import { prisma } from '../services/prisma';

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async findByUser(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { readAt: null }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async getPreferences(userId: string) {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async upsertPreferences(userId: string, data: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    quietHours?: any;
    defaultReminderPolicyId?: string;
  }) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}
