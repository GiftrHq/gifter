import { FastifyInstance } from 'fastify';
import { healthCheck } from '../controllers/health.controller';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', healthCheck);
}
