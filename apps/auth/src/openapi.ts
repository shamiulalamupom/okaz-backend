export const authOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'Okaz Auth Service API',
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
        summary: 'Liveness probe',
        responses: {
          '200': {
            description: 'Service is live'
          }
        }
      }
    },
    '/ready': {
      get: {
        summary: 'Readiness probe',
        responses: {
          '200': {
            description: 'Service is ready'
          },
          '503': {
            description: 'Service is not ready'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registered'
          },
          '400': {
            description: 'Validation error'
          },
          '409': {
            description: 'Email already exists'
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user and issue JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authenticated'
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user'
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    }
  }
};
