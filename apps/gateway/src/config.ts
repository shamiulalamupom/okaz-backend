import { loadEnv } from '@okaz/shared';
import { z } from 'zod';

const envSchema = z.object({
  AUTH_JWT_AUDIENCE: z.string().min(1),
  AUTH_JWT_ISSUER: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000)
});

const parsed = loadEnv(envSchema, {
  ...process.env,
  PORT: process.env.GATEWAY_PORT ?? process.env.PORT
});

export const gatewayConfig = {
  authServiceUrl: parsed.AUTH_SERVICE_URL,
  corsOrigin: parsed.CORS_ORIGIN,
  jwt: {
    audience: parsed.AUTH_JWT_AUDIENCE,
    issuer: parsed.AUTH_JWT_ISSUER,
    secret: parsed.AUTH_JWT_SECRET
  },
  loginRateLimit: {
    max: parsed.LOGIN_RATE_LIMIT_MAX,
    windowMs: parsed.LOGIN_RATE_LIMIT_WINDOW_MS
  },
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT
};
