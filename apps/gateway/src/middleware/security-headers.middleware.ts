import type { MiddlewareHandler } from 'hono';

export const securityHeadersMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    await next();

    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'no-referrer');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  };
};
