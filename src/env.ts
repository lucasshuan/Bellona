import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const inferredAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);

if (authSecret) {
  process.env.AUTH_SECRET ??= authSecret;
  process.env.NEXTAUTH_SECRET ??= authSecret;
}

if (inferredAppUrl) {
  process.env.NEXT_PUBLIC_APP_URL ??= inferredAppUrl;
  process.env.NEXTAUTH_URL ??= inferredAppUrl;
  process.env.AUTH_URL ??= inferredAppUrl;
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    AUTH_DISCORD_ID: z.string().min(1).optional(),
    AUTH_DISCORD_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: authSecret,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    NEXT_PUBLIC_APP_URL: inferredAppUrl,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
