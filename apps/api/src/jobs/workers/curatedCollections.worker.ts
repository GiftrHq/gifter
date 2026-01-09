import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '../queue.js';
import {
  CuratedCollectionsJobPayload,
  CuratedCollectionsJobResult,
} from '../job.types.js';
import { collectionService } from '../../services/collection.service.js';
import { prisma } from '../../services/prisma.js';
import { logger } from '../../utils/logger.js';

/**
 * Curated Collections Worker
 *
 * Processes jobs from the curated-collections queue.
 * Generates themed product collections using LLM and Unsplash images.
 */

async function processCuratedCollectionsJob(
  job: Job<CuratedCollectionsJobPayload>
): Promise<CuratedCollectionsJobResult> {
  const startTime = Date.now();
  const { surface, targetDate, collectionsCount, productsPerCollection, filters } =
    job.data;

  logger.info(
    {
      jobId: job.id,
      surface,
      targetDate,
      collectionsCount,
    },
    'Processing curated collections job'
  );

  try {
    // Check if collections already exist for this date/surface
    const existingCollections = await prisma.curatedCollection.findMany({
      where: {
        surface,
        validFrom: {
          gte: new Date(targetDate),
          lt: new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000),
        },
        generatedBy: 'ai',
      },
    });

    if (existingCollections.length > 0) {
      logger.info(
        {
          jobId: job.id,
          surface,
          targetDate,
          existingCount: existingCollections.length,
        },
        'Collections already exist for this date/surface, skipping'
      );

      return {
        success: true,
        surface,
        targetDate,
        collectionsCreated: 0,
        skipped: true,
        skipReason: 'already-exists',
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Generate collections
    const result = await collectionService.generateCollections({
      surface,
      targetDate,
      collectionsCount,
      productsPerCollection,
      filters,
      traceId: job.id,
    });

    const processingTimeMs = Date.now() - startTime;

    logger.info(
      {
        jobId: job.id,
        surface,
        targetDate,
        collectionsCreated: result.collectionsCreated,
        processingTimeMs,
      },
      'Curated collections job completed'
    );

    return {
      success: true,
      surface,
      targetDate,
      collectionsCreated: result.collectionsCreated,
      modelRunId: result.modelRunId,
      processingTimeMs,
    };
  } catch (error) {
    logger.error(
      {
        jobId: job.id,
        error,
        surface,
        targetDate,
      },
      'Curated collections job failed'
    );

    throw error; // Let BullMQ handle retries
  }
}

/**
 * Create and start the curated collections worker
 */
export function createCuratedCollectionsWorker() {
  const worker = new Worker<
    CuratedCollectionsJobPayload,
    CuratedCollectionsJobResult
  >(QUEUE_NAMES.CURATED_COLLECTIONS, processCuratedCollectionsJob, {
    connection: redisConnection,
    concurrency: 1, // Process one collection generation at a time to avoid rate limits
  });

  worker.on('completed', (job, result) => {
    logger.info(
      {
        jobId: job.id,
        surface: result.surface,
        collectionsCreated: result.collectionsCreated,
        processingTimeMs: result.processingTimeMs,
      },
      'Curated collections job completed successfully'
    );
  });

  worker.on('failed', (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        error: error.message,
        attempts: job?.attemptsMade,
      },
      'Curated collections job failed'
    );
  });

  worker.on('error', (error) => {
    logger.error({ error }, 'Curated collections worker error');
  });

  logger.info('Curated collections worker started');

  return worker;
}
