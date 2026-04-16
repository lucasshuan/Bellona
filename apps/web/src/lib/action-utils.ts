import { logger } from "./logger";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Wrapper para Server Actions que garante logging de erros e contrato consistente.
 */
export function createSafeAction<TArgs extends unknown[], TResult>(
  actionName: string,
  handler: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<ActionResponse<TResult>> => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      const stack = error instanceof Error ? error.stack : undefined;
      const cause = error instanceof Error ? error.cause : undefined;
      const code = (error as { code?: string })?.code || "INTERNAL_ERROR";

      // Logamos o erro com contexto completo no servidor (terminal)
      logger.error(
        {
          action: actionName,
          args,
          error: {
            message,
            stack,
            cause,
          },
        },
        `[Server Action Error] ${actionName}: ${message}`,
      );

      // Retornamos um objeto amigável para o frontend
      return {
        success: false,
        error: message,
        code,
      };
    }
  };
}
