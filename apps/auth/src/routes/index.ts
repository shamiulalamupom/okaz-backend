import type { Hono } from 'hono';

import { authRoutes } from '../modules/auth/auth.routes.js';
import { healthRoutes } from '../modules/health/health.routes.js';

export const applyAuthRoutes = (app: Hono) => {
  app.route('/', healthRoutes);
  app.route('/auth', authRoutes);
};
