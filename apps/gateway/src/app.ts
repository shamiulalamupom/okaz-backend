import { swaggerUI } from '@hono/swagger-ui';
import { correlationIdMiddleware, createLogger, jsonError, requestLoggerMiddleware } from '@okaz/shared';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { gatewayConfig } from './config/gateway.config.js';
import { gatewayOpenApi } from './docs/gateway.openapi.js';
import './hono-env.js';
import { createLoginRateLimitMiddleware } from './middleware/rate-limit.middleware.js';
import { securityHeadersMiddleware } from './middleware/security-headers.middleware.js';
import { applyGatewayRoutes } from './routes/index.js';

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
gatewayApp.use('*', securityHeadersMiddleware());
gatewayApp.use('/auth/login', createLoginRateLimitMiddleware(gatewayConfig.loginRateLimit));

gatewayApp.get('/openapi.json', (c) => c.json(gatewayOpenApi));
gatewayApp.get('/docs', swaggerUI({ url: '/openapi.json' }));
applyGatewayRoutes(gatewayApp, gatewayConfig);

gatewayApp.notFound((c) => jsonError(c, 404, 'Not Found', { code: 'NOT_FOUND' }));

gatewayApp.onError((error, c) => {
  logger.error('unhandled_error', {
    message: error.message,
    requestId: c.get('requestId')
  });

  return jsonError(c, 500, 'Internal server error', { code: 'INTERNAL_ERROR' });
});

export { gatewayApp };
