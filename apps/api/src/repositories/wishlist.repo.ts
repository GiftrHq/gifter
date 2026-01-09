import { prisma } from '../services/prisma';
import { WishlistVisibility } from '@prisma/client';

export class WishlistRepository {
  async create(data: {
    ownerUserId: string;
    recipientId?: string;
    title: string;
    visibility: WishlistVisibility;
  }) {
    return prisma.wishlist.create({
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.wishlist.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                variants: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        owner: true,
        recipient: true,
      },
    });
  }

  async findByOwner(ownerUserId: string, recipientId?: string) {
    return prisma.wishlist.findMany({
      where: {
        ownerUserId,
        ...(recipientId && { recipientId }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        recipient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic() {
    return prisma.wishlist.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: {
    title?: string;
    visibility?: WishlistVisibility;
  }) {
    return prisma.wishlist.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.wishlist.delete({
      where: { id },
    });
  }

  async addItem(wishlistId: string, data: {
    productId?: string;
    externalUrl?: string;
    notes?: string;
    priority?: number;
    desiredPrice?: number;
  }) {
    return prisma.wishlistItem.create({
      data: {
        wishlistId,
        ...data,
      },
      include: {
        product: true,
      },
    });
  }

  async removeItem(itemId: string) {
    return prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }
}
