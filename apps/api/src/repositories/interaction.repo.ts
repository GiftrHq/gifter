import { prisma } from '../services/prisma.js';
import { InteractionSource, RecommendationAction } from '@prisma/client';

export class InteractionRepository {
    async logInteraction(data: {
        userId?: string;
        recipientId?: string;
        productId: string;
        action: RecommendationAction;
        source: InteractionSource;
        weight?: number;
        props?: any;
    }) {
        return prisma.productInteraction.create({
            data: {
                ...data,
                props: data.props ?? undefined,
            },
        });
    }

    async findByUserId(userId: string, limit = 50) {
        return prisma.productInteraction.findMany({
            where: { userId },
            orderBy: { ts: 'desc' },
            take: limit,
            include: {
                product: true,
            },
        });
    }
}
