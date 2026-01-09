import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getProducts,
  getProduct,
  getBrands,
  getBrand,
} from '../controllers/products.controller';

export async function productsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/products', getProducts);
  app.get('/products/:id', getProduct);
  app.get('/brands', getBrands);
  app.get('/brands/:id', getBrand);
}
