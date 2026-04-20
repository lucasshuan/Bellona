import type { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level:
      process.env.LOG_LEVEL ??
      (process.env.NODE_ENV === 'production' ? 'info' : 'error'),
    // Em produção, os logs devem ser JSON para coletores (Datadog/BetterStack)
    // Em desenvolvimento, usamos pino-pretty para facilitar a leitura.
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
    // Customizamos o que é logado por padrão para evitar ruído.
    autoLogging: {
      // Não loga health-checks ou rotas internas de infraestrutura.
      ignore: (req) => req.url === '/health',
    },
    // Queries GraphQL são logadas em debug (ruído desnecessário em info).
    // Erros HTTP continuam em error independente da rota.
    customLogLevel: (
      req: IncomingMessage,
      res: ServerResponse,
      err?: Error,
    ) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      if (req.url?.startsWith('/graphql')) return 'debug';
      return 'info';
    },
    // Podemos extrair o operationName do GraphQL se disponível
    customProps: () => {
      return {
        context: 'HTTP',
      };
    },
  },
};
