import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createRecipient,
  getRecipients,
  getRecipient,
  updateRecipient,
  deleteRecipient,
} from '../controllers/recipients.controller';

export async function recipientsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/recipients', createRecipient);
  app.get('/recipients', getRecipients);
  app.get('/recipients/:id', getRecipient);
  app.patch('/recipients/:id', updateRecipient);
  app.delete('/recipients/:id', deleteRecipient);
}
