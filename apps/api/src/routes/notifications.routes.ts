import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getNotifications,
  markAsRead,
  getPreferences,
  updatePreferences,
} from '../controllers/notifications.controller';

export async function notificationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/notifications', getNotifications);
  app.post('/notifications/:id/read', markAsRead);
  app.get('/notification-preferences', getPreferences);
  app.patch('/notification-preferences', updatePreferences);
}
