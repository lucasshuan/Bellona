import { Params } from 'nestjs-pino';

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
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
    // O usuário solicitou "apenas erros" para operações GraphQL,
    // então vamos silenciar logs automáticos de request/response bem-sucedidos.
    autoLogging: false,
    quietReqLogger: true,
    // Podemos extrair o operationName do GraphQL se disponível
    customProps: () => {
      return {
        context: 'HTTP',
      };
    },
  },
};
