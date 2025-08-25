import * as dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.string().default('4000'),
  SERVER_URL: z.string().default('http://localhost:4000'),
  ACCESS_TOKEN_SECRET: z.string().min(8),
  ACCESS_TOKEN_EXPIRE: z.string().default('20m'),
  REFRESH_TOKEN_SECRET: z.string().min(8),
  REFRESH_TOKEN_EXPIRE: z.string().default('1d'),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default('jid'),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(1433),
  DATABASE_DB: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Environment variable validation error:\n${msg}`);
}

const env = parsed.data;

const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  server: {
    port: env.PORT,
    url: env.SERVER_URL
  },
  jwt: {
    access_token: {
      secret: env.ACCESS_TOKEN_SECRET,
      expire: env.ACCESS_TOKEN_EXPIRE
    },
    refresh_token: {
      secret: env.REFRESH_TOKEN_SECRET,
      expire: env.REFRESH_TOKEN_EXPIRE,
      cookie_name: env.REFRESH_TOKEN_COOKIE_NAME
    }
  },
  database: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_DB,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD
  }
} as const;

export type AppConfig = typeof config;
export default config;
