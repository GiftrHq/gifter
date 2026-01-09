import { prisma } from '../services/prisma';

export class TelemetryRepository {
  async createEvents(events: Array<{
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    name: string;
    props?: any;
    ts?: Date;
  }>) {
    return prisma.telemetryEvent.createMany({
      data: events,
    });
  }

  async findBySession(sessionId: string) {
    return prisma.telemetryEvent.findMany({
      where: { sessionId },
      orderBy: { ts: 'asc' },
    });
  }

  async findByUser(userId: string, limit = 100) {
    return prisma.telemetryEvent.findMany({
      where: { userId },
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }
}
