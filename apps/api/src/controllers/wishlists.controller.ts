import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WishlistRepository } from '../repositories/wishlist.repo';
import { WishlistVisibility } from '@prisma/client';

const createWishlistSchema = z.object({
  recipientId: z.string().optional(),
  title: z.string(),
  visibility: z.enum(['PRIVATE', 'FRIENDS', 'PUBLIC']),
});

const updateWishlistSchema = z.object({
  title: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'FRIENDS', 'PUBLIC']).optional(),
});

const addItemSchema = z.object({
  productId: z.string().optional(),
  externalUrl: z.string().url().optional(),
  notes: z.string().optional(),
  priority: z.number().int().optional(),
  desiredPrice: z.number().int().optional(),
});

export async function createWishlist(request: FastifyRequest, reply: FastifyReply) {
  const data = createWishlistSchema.parse(request.body);
  const wishlistRepo = new WishlistRepository();

  const wishlist = await wishlistRepo.create({
    ownerUserId: request.userId,
    recipientId: data.recipientId,
    title: data.title,
    visibility: data.visibility as WishlistVisibility,
  });

  return reply.status(201).send(wishlist);
}

export async function getWishlists(request: FastifyRequest, reply: FastifyReply) {
  const { scope, recipientId } = request.query as { scope?: string; recipientId?: string };
  const wishlistRepo = new WishlistRepository();

  if (scope === 'public') {
    const wishlists = await wishlistRepo.findPublic();
    return reply.send(wishlists);
  }

  const wishlists = await wishlistRepo.findByOwner(request.userId, recipientId);
  return reply.send(wishlists);
}

export async function getWishlist(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const wishlistRepo = new WishlistRepository();

  const wishlist = await wishlistRepo.findById(id);

  if (!wishlist) {
    return reply.status(404).send({
      error: {
        code: 'WISHLIST_NOT_FOUND',
        message: 'Wishlist not found',
      },
    });
  }

  // Check access
  if (wishlist.ownerUserId !== request.userId && wishlist.visibility === 'PRIVATE') {
    return reply.status(403).send({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied',
      },
    });
  }

  return reply.send(wishlist);
}

export async function updateWishlist(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const data = updateWishlistSchema.parse(request.body);
  const wishlistRepo = new WishlistRepository();

  const wishlist = await wishlistRepo.findById(id);
  if (!wishlist || wishlist.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'WISHLIST_NOT_FOUND',
        message: 'Wishlist not found',
      },
    });
  }

  const updated = await wishlistRepo.update(id, {
    title: data.title,
    visibility: data.visibility as WishlistVisibility | undefined,
  });

  return reply.send(updated);
}

export async function addWishlistItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const data = addItemSchema.parse(request.body);
  const wishlistRepo = new WishlistRepository();

  const wishlist = await wishlistRepo.findById(id);
  if (!wishlist || wishlist.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'WISHLIST_NOT_FOUND',
        message: 'Wishlist not found',
      },
    });
  }

  const item = await wishlistRepo.addItem(id, data);
  return reply.status(201).send(item);
}

export async function deleteWishlistItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const wishlistRepo = new WishlistRepository();

  await wishlistRepo.removeItem(id);
  return reply.status(204).send();
}
