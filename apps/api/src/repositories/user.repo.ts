import { prisma } from '../services/prisma';
import { User } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        devices: true,
        prefs: true,
        tasteProfiles: {
          where: {
            mode: 'NEW_USER',
            recipientId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Partial<User>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async addDevice(userId: string, deviceData: {
    platform: string;
    token: string;
    appVersion?: string;
    buildNumber?: string;
  }) {
    return prisma.device.upsert({
      where: { token: deviceData.token },
      update: {
        userId,
        platform: deviceData.platform,
        appVersion: deviceData.appVersion,
        buildNumber: deviceData.buildNumber,
      },
      create: {
        userId,
        ...deviceData,
      },
    });
  }

  async removeDevice(deviceId: string) {
    return prisma.device.delete({
      where: { id: deviceId },
    });
  }

  async getDevices(userId: string) {
    return prisma.device.findMany({
      where: { userId },
    });
  }
}
