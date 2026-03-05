import { jsonError } from '@okaz/shared';
import type { Context } from 'hono';

import { authService, isUniqueConstraintError } from './auth.service.js';
import { credentialsSchema } from './auth.schemas.js';

export const registerController = async (c: Context) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = credentialsSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(c, 400, 'Invalid request body', {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten()
    });
  }

  try {
    const user = await authService.register(parsed.data);
    return c.json(user, 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return c.json({ message: 'Email already registered' }, 409);
    }

    throw error;
  }
};

export const loginController = async (c: Context) => {
  const payload = await c.req.json().catch(() => null);
  const parsed = credentialsSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(c, 400, 'Invalid request body', {
      code: 'VALIDATION_ERROR',
      details: parsed.error.flatten()
    });
  }

  const loginResult = await authService.login(parsed.data);

  if (!loginResult) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  return c.json(loginResult, 200);
};

export const meController = async (c: Context) => {
  const user = c.get('user');
  return c.json({
    id: user.id,
    email: user.email,
    roles: user.roles
  });
};
