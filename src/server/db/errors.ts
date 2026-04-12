type ErrorWithCause = Error & {
  cause?: unknown;
  code?: string;
};

const DATABASE_UNAVAILABLE_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
  "42P01",
  "3F000",
]);

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  return (error as ErrorWithCause).code;
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  const code = getErrorCode(error);

  if (code && DATABASE_UNAVAILABLE_ERROR_CODES.has(code)) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (error instanceof AggregateError) {
    return error.errors.some((nestedError) => isDatabaseUnavailableError(nestedError));
  }

  const cause = (error as ErrorWithCause).cause;

  if (cause) {
    return isDatabaseUnavailableError(cause);
  }

  return false;
}

export const isDatabaseConnectionError = isDatabaseUnavailableError;
