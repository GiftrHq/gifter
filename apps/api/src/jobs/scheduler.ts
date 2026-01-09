import cron from 'node-cron';
import { scheduleDailyCuratedCollections, enqueueReminderDispatch } from './enqueue.js';
import { collectionService } from '../services/collection.service.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../services/prisma.js';
import { NotificationStatus } from '@prisma/client';

/**
 * Job Scheduler
 *
 * Manages recurring jobs using cron expressions.
 * Schedules daily collection generation and cleanup tasks.
 */

export class JobScheduler {
  private tasks: any[] = []; // Typed as any to avoid namespace issues with node-cron types

  /**
   * Start all scheduled tasks
   */
  start() {
    // Daily collection generation - runs at 6 AM UTC
    const dailyCollectionsTask = cron.schedule(
      '0 6 * * *',
      async () => {
        try {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          logger.info({ targetDate: today }, 'Scheduling daily curated collections');

          await scheduleDailyCuratedCollections(today);

          logger.info(
            { targetDate: today },
            'Daily curated collections jobs enqueued'
          );
        } catch (error) {
          logger.error({ error }, 'Failed to schedule daily curated collections');
        }
      },
      {
        scheduled: false, // Don't start immediately
      } as any
    );

    // Collection cleanup - runs at 2 AM UTC
    const cleanupTask = cron.schedule(
      '0 2 * * *',
      async () => {
        try {
          logger.info('Running collection cleanup');
          const deletedCount = await collectionService.cleanupExpiredCollections();
          logger.info({ deletedCount }, 'Collection cleanup complete');
        } catch (error) {
          logger.error({ error }, 'Collection cleanup failed');
        }
      },
      {
        scheduled: false,
      } as any
    );

    // Reminder Scheduler - runs every minute
    const reminderTask = cron.schedule(
      '* * * * *',
      async () => {
        try {
          const now = new Date();

          // Find due notifications
          const dueSchedules = await prisma.notificationSchedule.findMany({
            where: {
              status: NotificationStatus.QUEUED,
              scheduledFor: {
                lte: now
              }
            },
            take: 100 // Process in batches
          });

          if (dueSchedules.length > 0) {
            logger.info({ count: dueSchedules.length }, 'Found due reminders');

            for (const schedule of dueSchedules) {
              // Enqueue job
              await enqueueReminderDispatch(
                schedule.id,
                schedule.userId,
                schedule.channel,
                schedule.payload as any,
                schedule.scheduledFor.toISOString(),
                {
                  occasionId: schedule.occasionId || undefined,
                  triggeredBy: 'scheduler'
                }
              );
            }
          }
        } catch (error) {
          logger.error({ error }, 'Reminder scheduler failed');
        }
      },
      {
        scheduled: false,
      } as any
    );

    // Immediate generation on startup (if no collections exist for today)
    const startupTask = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        logger.info({ targetDate: today }, 'Running startup collection generation');

        await scheduleDailyCuratedCollections(today);

        logger.info(
          { targetDate: today },
          'Startup curated collections jobs enqueued'
        );
      } catch (error) {
        logger.error({ error }, 'Startup collection generation failed');
      }
    };

    // Store tasks
    this.tasks = [dailyCollectionsTask, cleanupTask, reminderTask];

    // Start cron tasks
    dailyCollectionsTask.start();
    cleanupTask.start();
    reminderTask.start();

    // Run startup task
    startupTask();

    logger.info(
      {
        tasks: [
          'Daily collections generation (6 AM UTC)',
          'Collection cleanup (2 AM UTC)',
          'Reminder processing (Every minute)',
          'Startup generation (immediate)',
        ],
      },
      'Job scheduler started'
    );
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.tasks.forEach((task) => task.stop());
    logger.info('Job scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      tasksCount: this.tasks.length,
      tasks: [
        {
          name: 'Daily collections generation',
          schedule: '0 6 * * * (6 AM UTC)',
          active: true,
        },
        {
          name: 'Collection cleanup',
          schedule: '0 2 * * * (2 AM UTC)',
          active: true,
        },
        {
          name: 'Reminder processing',
          schedule: '* * * * * (Every minute)',
          active: true,
        },
      ],
    };
  }
}

export const jobScheduler = new JobScheduler();
