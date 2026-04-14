import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// For backward compatibility during migration, we can also export it as 'db'
export const db = prisma;

export type DatabaseClient = PrismaClient;
