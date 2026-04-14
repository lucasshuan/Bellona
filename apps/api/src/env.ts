import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(4000), // Note: Frontend uses 4000 for graphql locally
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  DISCORD_CALLBACK_URL: z.string().optional(),
});

export const parseEnv = (config: Record<string, string | undefined>) => {
  return envSchema.parse({
    ...config,
    DATABASE_URL: config.DATABASE_URL || config.POSTGRES_URL,
    JWT_SECRET: config.JWT_SECRET || config.AUTH_SECRET,
    DISCORD_CLIENT_ID: config.DISCORD_CLIENT_ID || config.AUTH_DISCORD_ID,
    DISCORD_CLIENT_SECRET:
      config.DISCORD_CLIENT_SECRET || config.AUTH_DISCORD_SECRET,
  });
};

export type Env = z.infer<typeof envSchema>;
