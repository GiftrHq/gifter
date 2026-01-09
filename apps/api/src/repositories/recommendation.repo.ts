import { prisma } from '../services/prisma';
import { RecommendationAction } from '@prisma/client';

export class RecommendationRepository {
  async createRequest(data: {
    userId: string;
    recipientId?: string;
    occasionId?: string;
    budget?: any;
    constraints?: any;
    context?: any;
  }) {
    return prisma.recommendationRequest.create({
      data,
    });
  }

  async addItems(requestId: string, items: Array<{
    productId: string;
    rank: number;
    score: number;
    explanation?: string;
    badges?: any;
  }>) {
    return prisma.recommendationItem.createMany({
      data: items.map(item => ({
        requestId,
        ...item,
      })),
    });
  }

  async findRequestById(id: string) {
    return prisma.recommendationRequest.findUnique({
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
          orderBy: { rank: 'asc' },
        },
        recipient: true,
        occasion: true,
      },
    });
  }

  async findRequestsByUser(userId: string, limit = 20) {
    return prisma.recommendationRequest.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
          orderBy: { rank: 'asc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async recordEvent(data: {
    requestId?: string;
    userId?: string;
    productId?: string;
    action: RecommendationAction;
    props?: any;
  }) {
    return prisma.recommendationEvent.create({
      data,
    });
  }

  async getEventsByProduct(productId: string, limit = 100) {
    return prisma.recommendationEvent.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
