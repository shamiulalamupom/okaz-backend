import { swaggerUI } from '@hono/swagger-ui';
import {
  correlationIdMiddleware,
  createLogger,
  jsonError,
  requestLoggerMiddleware
} from '@okaz/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { gatewayConfig } from './config.js';
import './hono-env.js';
import { authMiddleware, requireRoles } from './middleware/auth.js';
import { createLoginRateLimitMiddleware } from './middleware/rate-limit.js';
import { gatewayOpenApi } from './openapi.js';

const logger = createLogger('gateway');

const gatewayApp = new Hono();

gatewayApp.use('*', correlationIdMiddleware());
gatewayApp.use('*', requestLoggerMiddleware(logger));
gatewayApp.use(
  '*',
  cors({
    origin: gatewayConfig.corsOrigin,
    allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    allowMethods: ['GET', 'POST', 'OPTIONS']
  })
);

gatewayApp.use('*', async (c, next) => {
  await next();

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
});

gatewayApp.use('/auth/login', createLoginRateLimitMiddleware(gatewayConfig.loginRateLimit));

gatewayApp.get('/live', (c) => c.json({ status: 'ok' }, 200));

gatewayApp.get('/ready', async (c) => {
  try {
    const response = await fetch(`${gatewayConfig.authServiceUrl}/ready`, {
      headers: {
        'x-request-id': c.get('requestId')
      }
    });

    if (!response.ok) {
      return c.json({ status: 'error' }, 503);
    }

    return c.json({ status: 'ok' }, 200);
  } catch {
    return c.json({ status: 'error' }, 503);
  }
});

gatewayApp.get('/openapi.json', (c) => c.json(gatewayOpenApi));
gatewayApp.get('/docs', swaggerUI({ url: '/openapi.json' }));

gatewayApp.all('/auth/*', async (c) => {
  const requestId = c.get('requestId');
  const incomingUrl = new URL(c.req.url);
  const targetUrl = new URL(`${c.req.path}${incomingUrl.search}`, gatewayConfig.authServiceUrl);

  const headers = new Headers(c.req.raw.headers);
  headers.delete('host');
  headers.set('x-request-id', requestId);

  const body = ['GET', 'HEAD'].includes(c.req.method) ? undefined : await c.req.raw.arrayBuffer();

  const response = await fetch(targetUrl, {
    method: c.req.method,
    headers,
    body
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('x-request-id', requestId);

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
});

gatewayApp.get('/protected', authMiddleware(gatewayConfig.jwt), (c) => {
  return c.json({
    message: 'Protected resource',
    user: c.get('user')
  });
});

gatewayApp.get('/admin', authMiddleware(gatewayConfig.jwt), requireRoles(['ADMIN']), (c) => {
  return c.json({
    message: 'Admin resource',
    user: c.get('user')
  });
});

gatewayApp.notFound((c) => jsonError(c, 404, 'Not Found', { code: 'NOT_FOUND' }));

gatewayApp.onError((error, c) => {
  logger.error('unhandled_error', {
    message: error.message,
    requestId: c.get('requestId')
  });

  return jsonError(c, 500, 'Internal server error', { code: 'INTERNAL_ERROR' });
});

export { gatewayApp };
