import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '../queue.js';
import {
    ReminderDispatchJobPayload,
    ReminderDispatchJobResult,
} from '../job.types.js';
import { prisma } from '../../services/prisma.js';
import { logger } from '../../utils/logger.js';
import { NotificationStatus } from '@prisma/client';

/**
 * Reminder Dispatch Worker
 *
 * Processes jobs from the reminder-dispatch queue.
 * Sends push notifications or emails for scheduled reminders.
 */

async function processReminderDispatchJob(
    job: Job<ReminderDispatchJobPayload>
): Promise<ReminderDispatchJobResult> {
    const startTime = Date.now();
    const { scheduleId, userId, channel, payload } = job.data;

    logger.info(
        { jobId: job.id, scheduleId, userId, channel },
        'Processing reminder dispatch job'
    );

    try {
        // 1. Fetch Schedule & Validate
        const schedule = await prisma.notificationSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            logger.warn({ scheduleId }, 'Schedule not found, skipping');
            return {
                success: false,
                scheduleId,
                skipped: true,
                skipReason: 'schedule-not-found',
                processingTimeMs: Date.now() - startTime,
            };
        }

        if (schedule.status === NotificationStatus.SENT) {
            logger.info({ scheduleId }, 'Schedule already sent, skipping');
            return {
                success: true,
                scheduleId,
                skipped: true,
                skipReason: 'already-sent',
                processingTimeMs: Date.now() - startTime,
            };
        }

        // 2. Send Notification
        // Placeholder for actual provider logic (FCM, APNS, SendGrid, etc.)
        logger.info(
            { userId, channel, title: payload.title, body: payload.body },
            '>>>>> SENDING NOTIFICATION (MOCK) <<<<<'
        );

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. Record Notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                title: payload.title,
                body: payload.body,
                data: payload.data || undefined
            }
        });

        // 4. Update Schedule
        await prisma.notificationSchedule.update({
            where: { id: scheduleId },
            data: {
                status: NotificationStatus.SENT,
                updatedAt: new Date()
            }
        });

        const processingTimeMs = Date.now() - startTime;
        logger.info({ scheduleId, processingTimeMs }, 'Reminder dispatched successfully');

        return {
            success: true,
            scheduleId,
            notificationId: notification.id,
            processingTimeMs,
        };

    } catch (error) {
        logger.error({ jobId: job.id, error, scheduleId }, 'Reminder dispatch job failed');

        // Update schedule to FAILED (or let BullMQ retry and eventually fail)
        // We update to FAILED here to track it in DB, but re-throwing error triggers BullMQ retry logic
        await prisma.notificationSchedule.update({
            where: { id: scheduleId },
            data: {
                status: NotificationStatus.FAILED,
                lastError: error instanceof Error ? error.message : 'Unknown error',
                attempts: { increment: 1 }
            }
        });

        throw error;
    }
}

/**
 * Create and start the reminder dispatch worker
 */
export function createReminderDispatchWorker() {
    const worker = new Worker<
        ReminderDispatchJobPayload,
        ReminderDispatchJobResult
    >(QUEUE_NAMES.REMINDER_DISPATCH, processReminderDispatchJob, {
        connection: redisConnection,
        concurrency: 10,
    });

    worker.on('completed', (job, result) => {
        logger.debug(
            { jobId: job.id, scheduleId: result.scheduleId },
            'Reminder dispatch job completed'
        );
    });

    worker.on('failed', (job, error) => {
        logger.error(
            { jobId: job?.id, error: error.message },
            'Reminder dispatch job failed'
        );
    });

    return worker;
}
