import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlContextType, GqlArgumentsHost } from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import type { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

type SerializableRecord = Record<string, unknown>;

const getExceptionMessage = (exception: unknown): string => {
  if (exception instanceof Error) {
    return exception.message;
  }

  if (typeof exception === 'string') {
    return exception;
  }

  return 'Unknown error';
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const hostType = host.getType<GqlContextType>();
    const message = getExceptionMessage(exception);

    // Se for GraphQL, tratamos de forma especial para não quebrar o contrato do Apollo
    if (hostType === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const info = gqlHost.getInfo<GraphQLResolveInfo>();
      const args = gqlHost.getArgs<SerializableRecord>();

      this.logger.error(
        {
          exception,
          operationName: info?.fieldName,
          path: info?.path,
          args,
        },
        `[GraphQL Error] ${message}`,
      );

      // No NestJS + GraphQL, o próprio framework lida com o envio da resposta.
      // Retornamos a exceção para que o resolver de erros do Apollo faça o seu trabalho.
      throw exception;
    }

    if (hostType !== 'http') {
      this.logger.error(
        { exception, hostType },
        `[Unhandled ${hostType} Error] ${message}`,
      );

      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      {
        status,
        path: request.url,
        method: request.method,
        exception:
          exception instanceof Error
            ? {
                message: exception.message,
                stack: exception.stack,
              }
            : exception,
      },
      `[HTTP Error] ${message}`,
    );

    // Se for HTTP, enviamos a resposta JSON padrão se não foi enviada ainda
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
    }
  }
}
