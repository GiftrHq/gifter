// Polyfill crypto for Node.js < 20
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

import { createApp } from './app';
import { ENV } from './config/env';
import { disconnectPrisma } from './services/prisma';
import { workerRegistry } from './jobs/workers/index.js';
import { jobScheduler } from './jobs/scheduler.js';
import { closeQueues } from './jobs/queue.js';

async function bootstrap() {
  try {
    const app = await createApp();

    await app.listen({
      port: ENV.PORT,
      host: '0.0.0.0',
    });

    app.log.info(`Core API running on http://localhost:${ENV.PORT}`);

    // Start background workers
    workerRegistry.start();

    // Start job scheduler
    jobScheduler.start();

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);

      // Stop scheduler first
      jobScheduler.stop();

      // Stop workers
      await workerRegistry.stop();

      // Close queues and Redis connection
      await closeQueues();

      // Close API server
      await app.close();

      // Disconnect from database
      await disconnectPrisma();

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
