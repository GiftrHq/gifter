import { FastifyInstance } from 'fastify';
import { internalWebhookMiddleware } from '../middleware/internalWebhook.middleware';
import {
  handleProductChanged,
  handleOrderStatusChanged,
  handleBrandChanged,
} from '../controllers/integrations.controller';

export async function integrationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', internalWebhookMiddleware);

  app.post('/integrations/payload/product-changed', handleProductChanged);
  app.post('/integrations/payload/order-status-changed', handleOrderStatusChanged);
  app.post('/integrations/payload/brand-changed', handleBrandChanged);
}
