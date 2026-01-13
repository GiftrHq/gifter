import { prisma } from '../services/prisma.js';
import { OccasionType, OccasionRecurrence, OccasionVisibility } from '@prisma/client';

export class OccasionRepository {
  async create(data: {
    ownerUserId: string;
    recipientId?: string;
    type: OccasionType;
    title?: string;
    date: Date;
    timezone?: string;
    isAllDay?: boolean;
    recurrence?: OccasionRecurrence;
    visibility?: OccasionVisibility;
    sharedWithUserIds?: string[];
    reminderPolicyId?: string;
  }) {
    const { sharedWithUserIds, ...rest } = data;
    return (prisma as any).occasion.create({
      data: {
        ...rest,
        recipientId: rest.recipientId ?? null,
        ...(sharedWithUserIds && {
          sharedWith: {
            connect: sharedWithUserIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        recipient: true,
        reminderPolicy: true,
        sharedWith: true,
      },
    });
  }

  async findById(id: string) {
    return (prisma as any).occasion.findUnique({
      where: { id },
      include: {
        recipient: true,
        reminderPolicy: true,
        sharedWith: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
    });
  }

  async findByOwner(ownerUserId: string, recipientId?: string) {
    return (prisma as any).occasion.findMany({
      where: {
        ownerUserId,
        ...(recipientId && { recipientId }),
      },
      include: {
        recipient: true,
        reminderPolicy: true,
        sharedWith: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async findUpcoming(ownerUserId: string, days: number = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return (prisma as any).occasion.findMany({
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
        sharedWith: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async findFeed(userId: string, days: number = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    // Get friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId, status: 'ACCEPTED' },
          { userBId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = friendships.map((f: any) => (f.userAId === userId ? f.userBId : f.userAId));

    if (friendIds.length === 0) return [];

    return (prisma as any).occasion.findMany({
      where: {
        AND: [
          {
            date: {
              gte: now,
              lte: future,
            },
          },
          {
            OR: [
              { ownerUserId: userId }, // Own occasions
              {
                AND: [
                  { ownerUserId: { in: friendIds } },
                  {
                    OR: [
                      { visibility: 'PUBLIC' },
                      {
                        visibility: 'PRIVATE',
                        sharedWith: { some: { id: userId } },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        recipient: true,
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
    visibility?: OccasionVisibility;
    sharedWithUserIds?: string[];
    reminderPolicyId?: string;
  }) {
    const { sharedWithUserIds, ...rest } = data;
    return (prisma as any).occasion.update({
      where: { id },
      data: {
        ...rest,
        ...(sharedWithUserIds && {
          sharedWith: {
            set: sharedWithUserIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        recipient: true,
        reminderPolicy: true,
        sharedWith: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.occasion.delete({
      where: { id },
    });
  }
}
