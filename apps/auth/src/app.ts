import { swaggerUI } from '@hono/swagger-ui';
import { correlationIdMiddleware, createLogger, jsonError, requestLoggerMiddleware } from '@okaz/shared';
import { Hono } from 'hono';

import './hono-env.js';
import { authOpenApi } from './docs/auth.openapi.js';
import { applyAuthRoutes } from './routes/index.js';

const logger = createLogger('auth-service');

const authApp = new Hono();

authApp.use('*', correlationIdMiddleware());
authApp.use('*', requestLoggerMiddleware(logger));

authApp.get('/openapi.json', (c) => c.json(authOpenApi));
authApp.get('/docs', swaggerUI({ url: '/openapi.json' }));
applyAuthRoutes(authApp);

authApp.notFound((c) => jsonError(c, 404, 'Not Found', { code: 'NOT_FOUND' }));

authApp.onError((error, c) => {
  logger.error('unhandled_error', {
    message: error.message,
    requestId: c.get('requestId')
  });

  return jsonError(c, 500, 'Internal server error', { code: 'INTERNAL_ERROR' });
});

export { authApp };
