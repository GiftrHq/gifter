import { prisma } from '../services/prisma';
import { RecipientType } from '@prisma/client';

export class RecipientRepository {
  async create(data: {
    ownerUserId: string;
    type: RecipientType;
    userId?: string;
    name?: string;
    relationship?: string;
    avatarUrl?: string;
    birthday?: Date;
    notes?: string;
    isTemporary?: boolean;
    expiresAt?: Date;
  }) {
    return prisma.recipient.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.recipient.findUnique({
      where: { id },
      include: {
        user: true,
        occasions: true,
        wishlists: true,
      },
    });
  }

  async findByOwner(ownerUserId: string) {
    return prisma.recipient.findMany({
      where: { ownerUserId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: {
    name?: string;
    relationship?: string;
    avatarUrl?: string;
    birthday?: Date;
    notes?: string;
  }) {
    return prisma.recipient.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.recipient.delete({
      where: { id },
    });
  }

  async cleanupExpired() {
    return prisma.recipient.deleteMany({
      where: {
        isTemporary: true,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
