import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createWishlist,
  getWishlists,
  getWishlist,
  updateWishlist,
  addWishlistItem,
  deleteWishlistItem,
} from '../controllers/wishlists.controller';

export async function wishlistsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/wishlists', createWishlist);
  app.get('/wishlists', getWishlists);
  app.get('/wishlists/:id', getWishlist);
  app.patch('/wishlists/:id', updateWishlist);
  app.post('/wishlists/:id/items', addWishlistItem);
  app.delete('/wishlist-items/:id', deleteWishlistItem);
}
