import { prisma } from '../services/prisma';
import { FriendshipStatus } from '@prisma/client';

export class FriendshipRepository {
  async createRequest(fromUserId: string, toUserId: string) {
    return prisma.friendRequest.create({
      data: {
        fromUserId,
        toUserId,
        status: 'PENDING',
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    });
  }

  async findRequestById(id: string) {
    return prisma.friendRequest.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
      },
    });
  }

  async findRequestsByUser(userId: string, direction: 'incoming' | 'outgoing') {
    if (direction === 'incoming') {
      return prisma.friendRequest.findMany({
        where: {
          toUserId: userId,
          status: 'PENDING',
        },
        include: {
          fromUser: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return prisma.friendRequest.findMany({
        where: {
          fromUserId: userId,
          status: 'PENDING',
        },
        include: {
          toUser: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async updateRequestStatus(id: string, status: FriendshipStatus) {
    return prisma.friendRequest.update({
      where: { id },
      data: { status },
    });
  }

  async createFriendship(userAId: string, userBId: string) {
    // Ensure userAId < userBId for consistent ordering
    const [a, b] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];

    return prisma.friendship.create({
      data: {
        userAId: a,
        userBId: b,
        status: 'ACCEPTED',
      },
    });
  }

  async findFriendships(userId: string) {
    return prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
        status: 'ACCEPTED',
      },
      include: {
        userA: true,
        userB: true,
      },
    });
  }

  async deleteFriendship(friendshipId: string) {
    return prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }
}
