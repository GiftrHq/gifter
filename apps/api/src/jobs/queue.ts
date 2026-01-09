import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { ENV } from '../config/env';
import {
  ProductEmbeddingJobPayload,
  ProductEnrichmentJobPayload,
  TasteProfileEmbeddingJobPayload,
  CuratedCollectionsJobPayload,
  ReminderDispatchJobPayload,
} from './job.types';

/**
 * Redis connection used by all BullMQ queues and workers.
 * Shared connection for optimal resource usage.
 */
export const redisConnection = new Redis(ENV.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

/**
 * Default queue options for all queues.
 * Ensures consistent behavior across job types.
 */
const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
    },
  },
};

/**
 * Queue names - centralized to ensure consistency
 */
export const QUEUE_NAMES = {
  PRODUCT_EMBEDDING: 'product-embedding',
  PRODUCT_ENRICHMENT: 'product-enrichment',
  TASTE_PROFILE_EMBEDDING: 'taste-profile-embedding',
  CURATED_COLLECTIONS: 'curated-collections',
  REMINDER_DISPATCH: 'reminder-dispatch',
} as const;

/**
 * Product embedding generation queue.
 * Generates vector embeddings for products after creation/update.
 */
export const productEmbeddingQueue = new Queue<ProductEmbeddingJobPayload>(
  QUEUE_NAMES.PRODUCT_EMBEDDING,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 2, // Medium-high priority
    },
  }
);

/**
 * Product enrichment queue.
 * Enriches product metadata using LLM (tags, categories, etc).
 */
export const productEnrichmentQueue = new Queue<ProductEnrichmentJobPayload>(
  QUEUE_NAMES.PRODUCT_ENRICHMENT,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 3, // Medium priority (less urgent than embeddings)
    },
  }
);

/**
 * Taste profile embedding generation queue.
 * Generates vector embeddings from user taste profile answers.
 */
export const tasteProfileEmbeddingQueue = new Queue<TasteProfileEmbeddingJobPayload>(
  QUEUE_NAMES.TASTE_PROFILE_EMBEDDING,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 1, // High priority (user is waiting)
    },
  }
);

/**
 * Curated collections generation queue.
 * Generates LLM-powered collections on a schedule (daily/6h).
 */
export const curatedCollectionsQueue = new Queue<CuratedCollectionsJobPayload>(
  QUEUE_NAMES.CURATED_COLLECTIONS,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 4, // Low priority (scheduled background job)
      attempts: 5, // More attempts for scheduled jobs
    },
  }
);

/**
 * Reminder dispatch queue.
 * Dispatches scheduled reminder notifications to users.
 */
export const reminderDispatchQueue = new Queue<ReminderDispatchJobPayload>(
  QUEUE_NAMES.REMINDER_DISPATCH,
  {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      priority: 1, // High priority (time-sensitive)
      attempts: 5, // More attempts for critical notifications
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 10s, 20s, 40s, 80s
      },
    },
  }
);

/**
 * Gracefully close all queues and Redis connection.
 * Call this on application shutdown.
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([
    productEmbeddingQueue.close(),
    productEnrichmentQueue.close(),
    tasteProfileEmbeddingQueue.close(),
    curatedCollectionsQueue.close(),
    reminderDispatchQueue.close(),
  ]);

  await redisConnection.quit();
}

/**
 * Health check for queue infrastructure.
 * Returns true if Redis connection is healthy.
 */
export async function checkQueuesHealth(): Promise<boolean> {
  try {
    await redisConnection.ping();
    return true;
  } catch (error) {
    console.error('Queue health check failed:', error);
    return false;
  }
}
