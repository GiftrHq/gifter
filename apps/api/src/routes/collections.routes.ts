import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as collectionsController from '../controllers/collections.controller.js';

export async function collectionsRoutes(app: FastifyInstance) {
  // All collection routes require authentication
  app.addHook('preHandler', authMiddleware);

  // GET /v1/collections - List collections
  app.get('/', collectionsController.getCollections);

  // GET /v1/collections/:id - Get collection details
  app.get('/:id', collectionsController.getCollectionById);

  // GET /v1/collections/:id/products - Get collection products
  app.get('/:id/products', collectionsController.getCollectionProducts);
}
