import pino from "pino";

const level = process.env.NODE_ENV === "development" ? "debug" : "info";

export const logger = pino({
  level,
  browser: {
    asObject: true,
  },
  transport:
    typeof window === "undefined" && process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

export default logger;
