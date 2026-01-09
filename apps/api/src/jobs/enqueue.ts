/**
 * Job enqueue functions for background processing using BullMQ.
 *
 * This module provides helper functions to enqueue jobs to Redis-backed queues.
 * All jobs are designed to be idempotent where possible using jobId.
 *
 * Usage:
 *   - Import the enqueue function you need
 *   - Pass the job payload and optional options
 *   - The job will be added to the queue and picked up by workers
 */

import { Job } from 'bullmq';
import { ENV } from '../config/env';
import {
  productEmbeddingQueue,
  productEnrichmentQueue,
  tasteProfileEmbeddingQueue,
  curatedCollectionsQueue,
  reminderDispatchQueue,
} from './queue';
import {
  ProductEmbeddingJobPayload,
  ProductEnrichmentJobPayload,
  TasteProfileEmbeddingJobPayload,
  CuratedCollectionsJobPayload,
  ReminderDispatchJobPayload,
  JobOptions,
} from './job.types';

/**
 * Enqueue a product embedding generation job.
 *
 * This job generates vector embeddings for a product to enable semantic search.
 * Idempotent: Uses productId as jobId to prevent duplicate embeddings.
 *
 * @param productId - Core API product ID
 * @param options - Optional job configuration
 * @returns BullMQ Job instance
 */
export async function enqueueProductEmbedding(
  productId: string,
  options?: Partial<JobOptions> & {
    previousTextHash?: string;
    triggeredBy?: 'product.created' | 'product.updated' | 'manual';
  }
): Promise<Job<ProductEmbeddingJobPayload>> {
  const payload: ProductEmbeddingJobPayload = {
    productId,
    provider: ENV.LLM_PROVIDER,
    model: ENV.EMBEDDING_MODEL,
    dims: ENV.EMBEDDING_DIMS,
    previousTextHash: options?.previousTextHash,
    triggeredBy: options?.triggeredBy || 'manual',
    timestamp: new Date().toISOString(),
  };

  return productEmbeddingQueue.add('generate-embedding', payload, {
    jobId: `product-embedding-${productId}`, // Idempotent: only one embedding job per product
    ...options,
  });
}

/**
 * Enqueue a product enrichment job.
 *
 * This job uses LLM to enrich product metadata (tags, occasion fit, etc).
 * Idempotent: Uses productId as jobId and checks enrichmentVersion in worker.
 *
 * @param productId - Core API product ID
 * @param options - Optional job configuration
 * @returns BullMQ Job instance
 */
export async function enqueueProductEnrichment(
  productId: string,
  options?: Partial<JobOptions> & {
    currentEnrichmentVersion?: number;
    triggeredBy?: 'product.created' | 'product.updated' | 'manual';
    promptVersion?: string;
  }
): Promise<Job<ProductEnrichmentJobPayload>> {
  const payload: ProductEnrichmentJobPayload = {
    productId,
    provider: ENV.LLM_PROVIDER,
    model: ENV.LLM_MODEL,
    promptVersion: options?.promptVersion || 'v1',
    currentEnrichmentVersion: options?.currentEnrichmentVersion,
    triggeredBy: options?.triggeredBy || 'manual',
    timestamp: new Date().toISOString(),
  };

  return productEnrichmentQueue.add('enrich-product', payload, {
    jobId: `product-enrichment-${productId}`, // Idempotent: only one enrichment job per product
    ...options,
  });
}

/**
 * Enqueue a taste profile embedding generation job.
 *
 * This job generates vector embeddings from a user's taste profile answers.
 * Used for personalized recommendations.
 * Idempotent: Uses tasteProfileId as jobId.
 *
 * @param tasteProfileId - Taste profile ID
 * @param userId - User who owns the profile
 * @param options - Optional job configuration
 * @returns BullMQ Job instance
 */
export async function enqueueTasteProfileEmbedding(
  tasteProfileId: string,
  userId: string,
  options?: Partial<JobOptions> & {
    recipientId?: string;
    triggeredBy?: 'profile.completed' | 'profile.updated' | 'manual';
  }
): Promise<Job<TasteProfileEmbeddingJobPayload>> {
  const payload: TasteProfileEmbeddingJobPayload = {
    tasteProfileId,
    userId,
    recipientId: options?.recipientId,
    provider: ENV.LLM_PROVIDER,
    model: ENV.EMBEDDING_MODEL,
    dims: ENV.EMBEDDING_DIMS,
    triggeredBy: options?.triggeredBy || 'manual',
    timestamp: new Date().toISOString(),
  };

  return tasteProfileEmbeddingQueue.add('generate-embedding', payload, {
    jobId: `taste-profile-embedding-${tasteProfileId}`, // Idempotent: only one embedding job per profile
    ...options,
  });
}

/**
 * Enqueue a curated collections generation job.
 *
 * This job uses LLM to generate themed product collections for a specific surface.
 * Typically triggered on a schedule (daily or every 6 hours).
 * Idempotent: Uses date + surface as jobId.
 *
 * @param surface - Which surface to generate collections for
 * @param targetDate - Date string (YYYY-MM-DD)
 * @param options - Optional job configuration
 * @returns BullMQ Job instance
 */
export async function enqueueCuratedCollections(
  surface: 'home' | 'discovery' | 'occasion',
  targetDate: string,
  options?: Partial<JobOptions> & {
    collectionsCount?: number;
    productsPerCollection?: number;
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      brandIds?: string[];
      excludeProductIds?: string[];
      isFeatured?: boolean;
    };
    triggeredBy?: 'scheduled' | 'manual' | 'api';
    promptVersion?: string;
  }
): Promise<Job<CuratedCollectionsJobPayload>> {
  const payload: CuratedCollectionsJobPayload = {
    surface,
    targetDate,
    provider: ENV.LLM_PROVIDER,
    model: ENV.LLM_MODEL,
    promptVersion: options?.promptVersion || 'v1',
    collectionsCount: options?.collectionsCount || 6,
    productsPerCollection: options?.productsPerCollection || 8,
    filters: options?.filters,
    triggeredBy: options?.triggeredBy || 'manual',
    timestamp: new Date().toISOString(),
  };

  return curatedCollectionsQueue.add('generate-collections', payload, {
    jobId: `curated-collections-${surface}-${targetDate}`, // Idempotent: one job per surface per day
    ...options,
  });
}

/**
 * Enqueue a reminder dispatch job.
 *
 * This job sends a scheduled notification to a user.
 * Triggered by a scheduler that checks the NotificationSchedule table.
 * Idempotent: Uses scheduleId as jobId and checks status in worker.
 *
 * @param scheduleId - NotificationSchedule ID
 * @param userId - User to notify
 * @param channel - Notification channel (PUSH or EMAIL)
 * @param payload - Notification content
 * @param scheduledFor - When notification should be sent
 * @param options - Optional job configuration
 * @returns BullMQ Job instance
 */
export async function enqueueReminderDispatch(
  scheduleId: string,
  userId: string,
  channel: 'PUSH' | 'EMAIL',
  payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  },
  scheduledFor: string,
  options?: Partial<JobOptions> & {
    occasionId?: string;
    triggeredBy?: 'scheduler' | 'manual';
  }
): Promise<Job<ReminderDispatchJobPayload>> {
  const jobPayload: ReminderDispatchJobPayload = {
    scheduleId,
    userId,
    occasionId: options?.occasionId,
    channel,
    payload,
    scheduledFor,
    triggeredBy: options?.triggeredBy || 'scheduler',
    timestamp: new Date().toISOString(),
  };

  return reminderDispatchQueue.add('dispatch-reminder', jobPayload, {
    jobId: `reminder-dispatch-${scheduleId}`, // Idempotent: only one dispatch per schedule
    ...options,
  });
}

/**
 * Enqueue both enrichment and embedding jobs for a product.
 * Useful when ingesting a new product from Payload.
 *
 * @param productId - Core API product ID
 * @param options - Optional job configuration
 */
export async function enqueueProductProcessing(
  productId: string,
  options?: {
    enrichmentOptions?: Partial<JobOptions>;
    embeddingOptions?: Partial<JobOptions>;
    triggeredBy?: 'product.created' | 'product.updated';
  }
): Promise<{
  enrichmentJob: Job<ProductEnrichmentJobPayload>;
  embeddingJob: Job<ProductEmbeddingJobPayload>;
}> {
  const triggeredBy = options?.triggeredBy || 'manual';

  // Enqueue both jobs in parallel
  const [enrichmentJob, embeddingJob] = await Promise.all([
    enqueueProductEnrichment(productId, {
      ...options?.enrichmentOptions,
      triggeredBy,
    }),
    enqueueProductEmbedding(productId, {
      ...options?.embeddingOptions,
      triggeredBy,
    }),
  ]);

  return { enrichmentJob, embeddingJob };
}

/**
 * Schedule daily curated collections generation for all surfaces.
 * Typically called by a cron job or scheduler.
 *
 * @param targetDate - Date string (YYYY-MM-DD)
 * @param options - Optional job configuration
 */
export async function scheduleDailyCuratedCollections(
  targetDate: string,
  options?: Partial<JobOptions>
): Promise<Job<CuratedCollectionsJobPayload>[]> {
  const surfaces: Array<'home' | 'discovery' | 'occasion'> = [
    'home',
    'discovery',
    'occasion',
  ];

  return Promise.all(
    surfaces.map((surface) =>
      enqueueCuratedCollections(surface, targetDate, {
        ...options,
        triggeredBy: 'scheduled',
      })
    )
  );
}
