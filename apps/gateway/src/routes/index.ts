import type { Hono } from 'hono';

import { createAuthProxyRoutes } from '../modules/auth-proxy/auth-proxy.routes.js';
import { createDemoRoutes } from '../modules/demo/demo.routes.js';
import { createHealthRoutes } from '../modules/health/health.routes.js';

export const applyGatewayRoutes = (
  app: Hono,
  config: {
    authServiceUrl: string;
    jwt: {
      audience: string;
      issuer: string;
      secret: string;
    };
  }
) => {
  app.route('/', createHealthRoutes(config.authServiceUrl));
  app.route('/auth', createAuthProxyRoutes(config.authServiceUrl));
  app.route('/', createDemoRoutes(config.jwt));
};
