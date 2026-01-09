/**
 * Job payload type definitions for BullMQ.
 *
 * These types define the data structure for each job type in the system.
 * All jobs should be designed to be idempotent where possible.
 */

/**
 * Product embedding generation job payload.
 *
 * Triggered when a product is created or updated.
 * Generates a vector embedding for the product based on its attributes.
 *
 * Idempotency: Uses productId as job ID and checks textHash before regenerating.
 */
export interface ProductEmbeddingJobPayload {
  /**
   * Core API product ID (not Payload ID)
   */
  productId: string;

  /**
   * Embedding configuration
   */
  provider: string;
  model: string;
  dims: number;

  /**
   * Optional: Previous text hash to check if re-embedding is needed
   */
  previousTextHash?: string;

  /**
   * Metadata for tracking
   */
  triggeredBy?: 'product.created' | 'product.updated' | 'manual';
  timestamp: string;
}

/**
 * Product enrichment job payload.
 *
 * Triggered when a product is created or has minimal metadata.
 * Uses LLM to enrich product with tags, occasion fit, style tags, etc.
 *
 * Idempotency: Checks enrichmentVersion before re-enriching.
 */
export interface ProductEnrichmentJobPayload {
  /**
   * Core API product ID (not Payload ID)
   */
  productId: string;

  /**
   * LLM configuration
   */
  provider: string;
  model: string;

  /**
   * Enrichment prompt version (for A/B testing)
   */
  promptVersion: string;

  /**
   * Optional: Current enrichment version to check if update needed
   */
  currentEnrichmentVersion?: number;

  /**
   * Metadata for tracking
   */
  triggeredBy?: 'product.created' | 'product.updated' | 'manual';
  timestamp: string;
}

/**
 * Taste profile embedding generation job payload.
 *
 * Triggered when a user completes a taste profile questionnaire.
 * Generates a vector embedding from the answers for personalized recommendations.
 *
 * Idempotency: Uses tasteProfileId as job ID.
 */
export interface TasteProfileEmbeddingJobPayload {
  /**
   * Taste profile ID
   */
  tasteProfileId: string;

  /**
   * User who owns this profile (for logging/tracking)
   */
  userId: string;

  /**
   * Optional: Recipient this profile is for (if not for the user themselves)
   */
  recipientId?: string;

  /**
   * Embedding configuration
   */
  provider: string;
  model: string;
  dims: number;

  /**
   * Metadata for tracking
   */
  triggeredBy?: 'profile.completed' | 'profile.updated' | 'manual';
  timestamp: string;
}

/**
 * Curated collections generation job payload.
 *
 * Triggered on a schedule (daily or every 6 hours).
 * Uses LLM to generate themed product collections for discovery surfaces.
 *
 * Idempotency: Uses date + surface as job ID. Checks if collections already exist.
 */
export interface CuratedCollectionsJobPayload {
  /**
   * Which surface/context to generate collections for
   */
  surface: 'home' | 'discovery' | 'occasion';

  /**
   * Date for which to generate collections (YYYY-MM-DD)
   * Used for daily refreshes
   */
  targetDate: string;

  /**
   * LLM configuration
   */
  provider: string;
  model: string;

  /**
   * Prompt version for A/B testing
   */
  promptVersion: string;

  /**
   * Number of collections to generate
   */
  collectionsCount: number;

  /**
   * Number of products per collection
   */
  productsPerCollection: number;

  /**
   * Optional: Filters to apply when selecting products
   */
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    brandIds?: string[];
    excludeProductIds?: string[];
    isFeatured?: boolean;
  };

  /**
   * Metadata for tracking
   */
  triggeredBy?: 'scheduled' | 'manual' | 'api';
  timestamp: string;
}

/**
 * Reminder dispatch job payload.
 *
 * Triggered by a scheduled worker that checks NotificationSchedule table.
 * Dispatches reminder notifications for upcoming occasions.
 *
 * Idempotency: Uses scheduleId as job ID. Checks schedule status before sending.
 */
export interface ReminderDispatchJobPayload {
  /**
   * Notification schedule ID (from NotificationSchedule table)
   */
  scheduleId: string;

  /**
   * User to notify
   */
  userId: string;

  /**
   * Optional: Occasion this reminder is for
   */
  occasionId?: string;

  /**
   * Notification channel (push, email, etc)
   */
  channel: 'PUSH' | 'EMAIL';

  /**
   * Notification content
   */
  payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };

  /**
   * When this notification was scheduled for
   */
  scheduledFor: string;

  /**
   * Metadata for tracking
   */
  triggeredBy?: 'scheduler' | 'manual';
  timestamp: string;
}

/**
 * Common job options that can be passed when enqueueing.
 */
export interface JobOptions {
  /**
   * Job ID for idempotency. If a job with this ID already exists, it won't be added again.
   */
  jobId?: string;

  /**
   * Priority (1 = highest, higher numbers = lower priority)
   */
  priority?: number;

  /**
   * Delay before processing (milliseconds)
   */
  delay?: number;

  /**
   * Number of retry attempts
   */
  attempts?: number;

  /**
   * Backoff strategy for retries
   */
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };

  /**
   * When to remove completed job
   */
  removeOnComplete?: boolean | number | { age?: number; count?: number };

  /**
   * When to remove failed job
   */
  removeOnFail?: boolean | number | { age?: number; count?: number };
}

/**
 * Job result types for tracking completion
 */
export interface ProductEmbeddingJobResult {
  success: boolean;
  productId: string;
  embeddingId?: string;
  skipped?: boolean;
  skipReason?: 'unchanged-hash' | 'product-not-found';
  textHash?: string;
  processingTimeMs: number;
}

export interface ProductEnrichmentJobResult {
  success: boolean;
  productId: string;
  enrichmentVersion?: number;
  skipped?: boolean;
  skipReason?: 'already-enriched' | 'product-not-found';
  modelRunId?: string;
  processingTimeMs: number;
}

export interface TasteProfileEmbeddingJobResult {
  success: boolean;
  tasteProfileId: string;
  skipped?: boolean;
  skipReason?: 'already-embedded' | 'profile-not-found';
  processingTimeMs: number;
}

export interface CuratedCollectionsJobResult {
  success: boolean;
  surface: string;
  targetDate: string;
  collectionsCreated: number;
  skipped?: boolean;
  skipReason?: 'already-exists';
  modelRunId?: string;
  processingTimeMs: number;
}

export interface ReminderDispatchJobResult {
  success: boolean;
  scheduleId: string;
  notificationId?: string;
  skipped?: boolean;
  skipReason?: 'already-sent' | 'schedule-not-found' | 'user-disabled';
  processingTimeMs: number;
}
