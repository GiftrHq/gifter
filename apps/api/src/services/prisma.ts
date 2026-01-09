import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

prisma.$on('warn', (e) => {
  logger.warn(e);
});

prisma.$on('error', (e) => {
  logger.error(e);
});

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
