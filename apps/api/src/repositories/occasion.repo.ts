import { prisma } from '../services/prisma';
import { OccasionType, OccasionRecurrence } from '@prisma/client';

export class OccasionRepository {
  async create(data: {
    ownerUserId: string;
    recipientId: string;
    type: OccasionType;
    title?: string;
    date: Date;
    timezone?: string;
    isAllDay?: boolean;
    recurrence?: OccasionRecurrence;
    reminderPolicyId?: string;
  }) {
    return prisma.occasion.create({
      data,
      include: {
        recipient: true,
        reminderPolicy: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.occasion.findUnique({
      where: { id },
      include: {
        recipient: true,
        reminderPolicy: true,
      },
    });
  }

  async findByOwner(ownerUserId: string, recipientId?: string) {
    return prisma.occasion.findMany({
      where: {
        ownerUserId,
        ...(recipientId && { recipientId }),
      },
      include: {
        recipient: true,
        reminderPolicy: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async findUpcoming(ownerUserId: string, days: number = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return prisma.occasion.findMany({
      where: {
        ownerUserId,
        date: {
          gte: now,
          lte: future,
        },
      },
      include: {
        recipient: true,
        reminderPolicy: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async update(id: string, data: {
    type?: OccasionType;
    title?: string;
    date?: Date;
    timezone?: string;
    isAllDay?: boolean;
    recurrence?: OccasionRecurrence;
    reminderPolicyId?: string;
  }) {
    return prisma.occasion.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.occasion.delete({
      where: { id },
    });
  }
}
