import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ENV } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestContextMiddleware } from './middleware/requestContext.middleware';
import { registerRoutes } from './routes';

export async function createApp() {
  const app = Fastify({
    logger:
      ENV.NODE_ENV === 'development'
        ? {
            level: ENV.LOG_LEVEL,
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
          }
        : {
            level: ENV.LOG_LEVEL,
          },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Register CORS
  await app.register(cors, {
    origin: ENV.NODE_ENV === 'development' ? '*' : false,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // Global middleware
  app.addHook('preHandler', requestContextMiddleware);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Register all other routes
  await registerRoutes(app);

  return app;
}
