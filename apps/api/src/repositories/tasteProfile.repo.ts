import { prisma } from '../services/prisma.js';
import { Prisma } from '@prisma/client';
import { TasteProfileFacets } from '../services/llm/types.js';

export interface CreateTasteProfileInput {
  ownerUserId: string;
  recipientId?: string;
  mode: string;
  name?: string;
  answers?: Record<string, unknown>;
  facets?: TasteProfileFacets;
}

export interface UpdateTasteProfileInput {
  answers?: Record<string, unknown>;
  facets?: TasteProfileFacets;
  vector?: number[];
  vectorUpdatedAt?: Date;
}

export const tasteProfileRepo = {
  async findByUserId(userId: string) {
    return prisma.tasteProfile.findFirst({
      where: {
        ownerUserId: userId,
        recipientId: null, // User's own profile
        isTemporary: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.tasteProfile.findUnique({
      where: { id },
    });
  },

  async findByRecipient(userId: string, recipientId: string) {
    return prisma.tasteProfile.findFirst({
      where: {
        ownerUserId: userId,
        recipientId,
        isTemporary: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: CreateTasteProfileInput) {
    return prisma.tasteProfile.create({
      data: {
        ownerUserId: data.ownerUserId,
        recipientId: data.recipientId,
        mode: data.mode,
        name: data.name,
        answers: data.answers as Prisma.JsonValue,
        facets: data.facets as unknown as Prisma.JsonValue,
      },
    });
  },

  async update(id: string, data: UpdateTasteProfileInput) {
    const updateData: Prisma.TasteProfileUpdateInput = {};

    if (data.answers !== undefined) {
      updateData.answers = data.answers as Prisma.JsonValue;
    }

    if (data.facets !== undefined) {
      updateData.facets = data.facets as unknown as Prisma.JsonValue;
    }

    if (data.vectorUpdatedAt !== undefined) {
      updateData.vectorUpdatedAt = data.vectorUpdatedAt;
    }

    // Note: vector update requires raw SQL due to pgvector
    const profile = await prisma.tasteProfile.update({
      where: { id },
      data: updateData,
    });

    // Update vector separately if provided
    if (data.vector) {
      await prisma.$executeRaw`
        UPDATE "TasteProfile"
        SET vector = ${data.vector}::vector,
            "vectorUpdatedAt" = NOW()
        WHERE id = ${id}
      `;
    }

    return profile;
  },

  async updateAnswers(id: string, questionId: string, answer: unknown) {
    const profile = await prisma.tasteProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new Error('Taste profile not found');
    }

    const currentAnswers = (profile.answers as Record<string, unknown>) || {};
    const updatedAnswers = {
      ...currentAnswers,
      [questionId]: answer,
    };

    return prisma.tasteProfile.update({
      where: { id },
      data: {
        answers: updatedAnswers as Prisma.JsonValue,
      },
    });
  },

  async delete(id: string) {
    return prisma.tasteProfile.delete({
      where: { id },
    });
  },

  async createTemporary(data: CreateTasteProfileInput, expiresIn: number = 24 * 60 * 60 * 1000) {
    return prisma.tasteProfile.create({
      data: {
        ownerUserId: data.ownerUserId,
        recipientId: data.recipientId,
        mode: data.mode,
        name: data.name,
        answers: data.answers as Prisma.JsonValue,
        facets: data.facets as unknown as Prisma.JsonValue,
        isTemporary: true,
        expiresAt: new Date(Date.now() + expiresIn),
      },
    });
  },

  async cleanupExpired() {
    return prisma.tasteProfile.deleteMany({
      where: {
        isTemporary: true,
        expiresAt: { lt: new Date() },
      },
    });
  },
};
