type ErrorWithCause = Error & {
  cause?: unknown;
  code?: string;
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return (error as ErrorWithCause).code;
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const code = getErrorCode(error);

  if (code && ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"].includes(code)) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (error instanceof AggregateError) {
    return error.errors.some((nestedError) => isDatabaseConnectionError(nestedError));
  }

  const cause = (error as ErrorWithCause).cause;

  if (cause) {
    return isDatabaseConnectionError(cause);
  }

  return false;
}
