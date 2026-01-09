import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { startSession, batchEvents } from '../controllers/telemetry.controller';

export async function telemetryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/telemetry/session/start', startSession);
  app.post('/telemetry/events', batchEvents);
}
