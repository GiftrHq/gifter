import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().default('http://localhost:4000'),

  // Apple Sign In
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  RESEND_API_KEY: z.string(),
  RESEND_FROM: z.string(),

  // Internal webhooks
  INTERNAL_WEBHOOK_SECRET: z.string().optional(),

  // LLM/AI
  LLM_API_KEY: z.string().optional(),
  LLM_PROVIDER: z.string().default('openai'),
  LLM_MODEL: z.string().default('gpt-4'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIMS: z.string().default('1536').transform(Number),

  // Unsplash (for collection cover images)
  UNSPLASH_ACCESS_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.string().default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 4));
  process.exit(1);
}

export const ENV = parsedEnv.data;
