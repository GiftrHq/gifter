/**
 * Jobs module exports
 *
 * Provides centralized access to job enqueue functions, types, and queue infrastructure.
 *
 * Usage:
 *   import { enqueueProductEmbedding, ProductEmbeddingJobPayload } from '@/jobs';
 */

// Export all job types and payload interfaces
export * from './job.types';

// Export all enqueue functions
export * from './enqueue';

// Export queue instances and utilities
export {
  productEmbeddingQueue,
  productEnrichmentQueue,
  tasteProfileEmbeddingQueue,
  curatedCollectionsQueue,
  reminderDispatchQueue,
  QUEUE_NAMES,
  closeQueues,
  checkQueuesHealth,
  redisConnection,
} from './queue';
