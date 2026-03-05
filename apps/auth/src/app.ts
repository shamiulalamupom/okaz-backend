import { swaggerUI } from '@hono/swagger-ui';
import { Prisma } from '@prisma/client';
import {
  correlationIdMiddleware,
  jsonError,
  requestLoggerMiddleware,
  signAccessToken,
  verifyAccessToken,
  createLogger
} from '@okaz/shared';
import { Hono } from 'hono';
import { z } from 'zod';

import { authConfig } from './config.js';
import './hono-env.js';
import { authOpenApi } from './openapi.js';
import { prisma } from './prisma.js';
import { hashPassword, verifyPassword } from './security.js';

const logger = createLogger('auth-service');

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
const bearerHeaderSchema = z.string().regex(/^Bearer\s+.+$/);

const authApp = new Hono();

authApp.use('*', correlationIdMiddleware());
authApp.use('*', requestLoggerMiddleware(logger));

authApp.get('/live', (c) => c.json({ status: 'ok' }, 200));

authApp.get('/ready', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: 'ok' }, 200);
  } catch {
    return c.json({ status: 'error' }, 503);
  }
});

authApp.get('/openapi.json', (c) => c.json(authOpenApi));
authApp.get('/docs', swaggerUI({ url: '/openapi.json' }));

authApp.post('/auth/register', async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = credentialsSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(c, 400, 'Invalid request body', {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten()
    });
  }

  const { email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        roles: ['CUSTOMER']
      }
    });

    return c.json(
      {
        id: user.id,
        email: user.email,
        roles: user.roles
      },
      201
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return c.json({ message: 'Email already registered' }, 409);
    }

    throw error;
  }
});

authApp.post('/auth/login', async (c) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = credentialsSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(c, 400, 'Invalid request body', {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten()
    });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const accessToken = await signAccessToken(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles as ('CUSTOMER' | 'STORE_MANAGER' | 'ADMIN')[]
    },
    authConfig.jwt
  );

  return c.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles
    }
  });
});

authApp.get('/auth/me', async (c) => {
  const parsedAuthHeader = bearerHeaderSchema.safeParse(c.req.header('authorization'));
  if (!parsedAuthHeader.success) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = parsedAuthHeader.data.slice('Bearer '.length).trim();

  try {
    const claims = await verifyAccessToken(token, {
      audience: authConfig.jwt.audience,
      issuer: authConfig.jwt.issuer,
      secret: authConfig.jwt.secret
    });

    return c.json({
      id: claims.sub,
      email: claims.email,
      roles: claims.roles
    });
  } catch {
    return c.json({ message: 'Unauthorized' }, 401);
  }
});

authApp.notFound((c) => jsonError(c, 404, 'Not Found', { code: 'NOT_FOUND' }));

authApp.onError((error, c) => {
  logger.error('unhandled_error', {
    message: error.message,
    requestId: c.get('requestId')
  });

  return jsonError(c, 500, 'Internal server error', { code: 'INTERNAL_ERROR' });
});

export { authApp };
