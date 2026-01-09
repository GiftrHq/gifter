import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { getMe, updateMe, addDevice, removeDevice } from '../controllers/me.controller';

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/me', getMe);
  app.patch('/me', updateMe);
  app.post('/me/device', addDevice);
  app.delete('/me/device/:deviceId', removeDevice);
}
