import { prisma } from '../services/prisma.js';

export class UserPreferenceStateRepository {
    async getState(userId: string) {
        // Return metadata; vector retrieval often needs specialized queries for similarity search
        return prisma.userPreferenceState.findUnique({
            where: { userId },
        });
    }

    async updateState(data: {
        userId: string;
        provider: string;
        model: string;
        dims: number;
        vector: string; // serialized vector string
    }) {
        const { userId, provider, model, dims, vector } = data;

        // Upsert using raw SQL to handle the vector type casting
        // Check existence first
        const exists = await prisma.userPreferenceState.findUnique({
            where: { userId },
        });

        if (exists) {
            await prisma.$executeRaw`
        UPDATE "UserPreferenceState"
        SET 
          vector = ${vector}::vector,
          "provider" = ${provider},
          "model" = ${model},
          "dims" = ${dims},
          "updatedAt" = NOW()
        WHERE "userId" = ${userId}
      `;
        } else {
            await prisma.$executeRaw`
        INSERT INTO "UserPreferenceState" ("userId", "provider", "model", "dims", "vector", "updatedAt")
        VALUES (${userId}, ${provider}, ${model}, ${dims}, ${vector}::vector, NOW())
      `;
        }
    }
}
