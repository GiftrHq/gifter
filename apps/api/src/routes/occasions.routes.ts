import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createOccasion,
  getOccasions,
  getUpcomingOccasions,
  updateOccasion,
  deleteOccasion,
} from '../controllers/occasions.controller';

export async function occasionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/occasions', createOccasion);
  app.get('/occasions', getOccasions);
  app.get('/occasions/upcoming', getUpcomingOccasions);
  app.patch('/occasions/:id', updateOccasion);
  app.delete('/occasions/:id', deleteOccasion);
}
