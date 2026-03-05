export const gatewayOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'Okaz Gateway API',
    version: '1.0.0'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/live': {
      get: {
        summary: 'Gateway liveness probe',
        responses: {
          '200': { description: 'Gateway is live' }
        }
      }
    },
    '/ready': {
      get: {
        summary: 'Gateway readiness probe',
        responses: {
          '200': { description: 'Gateway is ready' },
          '503': { description: 'Gateway is not ready' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Proxy register to auth service',
        responses: {
          '201': { description: 'Registered' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Proxy login to auth service',
        responses: {
          '200': { description: 'Authenticated' },
          '401': { description: 'Invalid credentials' },
          '429': { description: 'Rate limited' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Proxy me to auth service',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/protected': {
      get: {
        summary: 'Protected demo route',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Accessible by any authenticated user' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/admin': {
      get: {
        summary: 'Admin-only demo route',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Accessible by ADMIN role' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' }
        }
      }
    }
  }
};
