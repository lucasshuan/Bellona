import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  DISCORD_CALLBACK_URL: z.string().optional(),
});

export const parseEnv = (config: Record<string, string | undefined>) => {
  return envSchema.parse(config);
};

export type Env = z.infer<typeof envSchema>;
