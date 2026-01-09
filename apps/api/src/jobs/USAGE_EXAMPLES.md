# Job Infrastructure Usage Examples

This file contains real-world examples of how to use the job infrastructure in the Core API.

## Table of Contents

1. [Product Ingestion from Payload](#product-ingestion-from-payload)
2. [Taste Profile Completion](#taste-profile-completion)
3. [Scheduled Collections](#scheduled-collections)
4. [Reminder Scheduling](#reminder-scheduling)
5. [Error Handling](#error-handling)
6. [Integration with Services](#integration-with-services)

---

## 1. Product Ingestion from Payload

When a product webhook is received from Payload CMS, enqueue both enrichment and embedding jobs.

### File: `src/services/commerce/payload.ingest.ts`

```typescript
import { enqueueProductProcessing } from '@/jobs';
import { logger } from '@/utils/logger';

export async function handleProductChanged(payload: any) {
  // 1. Upsert product in Core DB
  const product = await upsertProductMirror(payload);

  // 2. Only process published and visible products
  if (product.status === 'PUBLISHED' && product.visibleToGifter) {
    try {
      // 3. Enqueue both enrichment and embedding jobs
      const { enrichmentJob, embeddingJob } = await enqueueProductProcessing(
        product.id,
        {
          triggeredBy: 'product.created',
        }
      );

      logger.info(
        {
          productId: product.id,
          enrichmentJobId: enrichmentJob.id,
          embeddingJobId: embeddingJob.id,
        },
        'Product processing jobs enqueued'
      );
    } catch (error) {
      logger.error(
        { productId: product.id, error },
        'Failed to enqueue product processing jobs'
      );
      // Don't throw - product is already saved, jobs can be retried manually
    }
  }

  return product;
}
```

### Alternative: Enqueue jobs separately

```typescript
import { enqueueProductEmbedding, enqueueProductEnrichment } from '@/jobs';

// Enqueue embedding only (if product already enriched)
await enqueueProductEmbedding(product.id, {
  triggeredBy: 'product.updated',
  previousTextHash: product.lastEmbeddingHash,
});

// Enqueue enrichment only (if embedding exists but need new tags)
await enqueueProductEnrichment(product.id, {
  triggeredBy: 'product.updated',
  promptVersion: 'v2', // Test new prompt
  currentEnrichmentVersion: product.enrichmentVersion,
});
```

---

## 2. Taste Profile Completion

When a user completes a taste profile questionnaire, generate an embedding for recommendations.

### File: `src/services/taste-profile/taste-profile.service.ts`

```typescript
import { enqueueTasteProfileEmbedding } from '@/jobs';
import { logger } from '@/utils/logger';

export async function completeTasteProfile(
  tasteProfileId: string,
  userId: string,
  answers: any
) {
  // 1. Update taste profile in DB
  const profile = await prisma.tasteProfile.update({
    where: { id: tasteProfileId },
    data: {
      answers,
      facets: deriveFactsFromAnswers(answers),
      updatedAt: new Date(),
    },
  });

  // 2. Enqueue embedding generation (high priority - user is waiting)
  try {
    const job = await enqueueTasteProfileEmbedding(
      tasteProfileId,
      userId,
      {
        recipientId: profile.recipientId,
        triggeredBy: 'profile.completed',
      }
    );

    logger.info(
      { tasteProfileId, userId, jobId: job.id },
      'Taste profile embedding job enqueued'
    );

    return {
      profile,
      embeddingJobId: job.id,
      message: 'Profile saved. Generating recommendations...',
    };
  } catch (error) {
    logger.error(
      { tasteProfileId, error },
      'Failed to enqueue taste profile embedding'
    );

    // Return profile even if job failed - can retry manually
    return {
      profile,
      message: 'Profile saved. Recommendations may be delayed.',
    };
  }
}
```

---

## 3. Scheduled Collections

Generate curated collections on a schedule (e.g., daily via cron).

### File: `src/services/collections/collections.scheduler.ts`

```typescript
import { scheduleDailyCuratedCollections } from '@/jobs';
import { logger } from '@/utils/logger';

/**
 * Run this daily via cron at 02:00 UTC.
 * Example cron: "0 2 * * *"
 */
export async function generateDailyCollections() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Schedule collections for all surfaces (home, discovery, occasion)
    const jobs = await scheduleDailyCuratedCollections(today, {
      attempts: 5, // Retry on failure
      priority: 4, // Low priority
    });

    logger.info(
      {
        date: today,
        jobIds: jobs.map((j) => j.id),
      },
      'Daily curated collections scheduled'
    );

    return { success: true, jobCount: jobs.length };
  } catch (error) {
    logger.error({ date: today, error }, 'Failed to schedule daily collections');
    throw error;
  }
}

/**
 * Manually regenerate collections for a specific surface.
 * Useful for testing or fixing issues.
 */
export async function regenerateCollections(
  surface: 'home' | 'discovery' | 'occasion',
  targetDate: string
) {
  const { enqueueCuratedCollections } = await import('@/jobs');

  const job = await enqueueCuratedCollections(surface, targetDate, {
    triggeredBy: 'manual',
    collectionsCount: 8, // More collections for manual run
    productsPerCollection: 10,
    filters: {
      isFeatured: true, // Only featured products
    },
  });

  logger.info(
    { surface, targetDate, jobId: job.id },
    'Manual collection regeneration enqueued'
  );

  return job;
}
```

### Cron job setup

```typescript
import cron from 'node-cron';
import { generateDailyCollections } from '@/services/collections/collections.scheduler';

// Run daily at 02:00 UTC
cron.schedule('0 2 * * *', async () => {
  try {
    await generateDailyCollections();
  } catch (error) {
    console.error('Cron job failed:', error);
  }
});
```

---

## 4. Reminder Scheduling

Schedule reminders when an occasion is created or updated.

### File: `src/services/occasions/reminder.service.ts`

```typescript
import { enqueueReminderDispatch } from '@/jobs';
import { logger } from '@/utils/logger';
import { subDays, subHours } from 'date-fns';

export async function scheduleRemindersForOccasion(
  occasionId: string,
  userId: string,
  occasionDate: Date,
  reminderOffsets: number[] = [-7, -3, -1] // Days before
) {
  const scheduledJobs = [];

  for (const offset of reminderOffsets) {
    const reminderDate = subDays(occasionDate, Math.abs(offset));

    // Create notification schedule in DB
    const schedule = await prisma.notificationSchedule.create({
      data: {
        userId,
        occasionId,
        channel: 'PUSH',
        scheduledFor: reminderDate,
        payload: {
          title: 'Upcoming Occasion',
          body: `Reminder: ${Math.abs(offset)} day${Math.abs(offset) > 1 ? 's' : ''} until the occasion!`,
        },
        status: 'QUEUED',
      },
    });

    // Enqueue dispatch job
    try {
      const job = await enqueueReminderDispatch(
        schedule.id,
        userId,
        'PUSH',
        schedule.payload as any,
        reminderDate.toISOString(),
        {
          occasionId,
          triggeredBy: 'scheduler',
          delay: reminderDate.getTime() - Date.now(), // Delay until scheduled time
        }
      );

      scheduledJobs.push({ scheduleId: schedule.id, jobId: job.id });

      logger.info(
        { scheduleId: schedule.id, jobId: job.id, reminderDate },
        'Reminder dispatch job enqueued'
      );
    } catch (error) {
      logger.error(
        { scheduleId: schedule.id, error },
        'Failed to enqueue reminder dispatch'
      );
      // Continue with other reminders
    }
  }

  return scheduledJobs;
}

/**
 * Check for due reminders and dispatch them.
 * Run this every 5 minutes via cron.
 */
export async function processOverdueReminders() {
  const now = new Date();

  // Find schedules that should have been sent but haven't
  const overdueSchedules = await prisma.notificationSchedule.findMany({
    where: {
      status: 'QUEUED',
      scheduledFor: {
        lte: now,
      },
    },
    take: 100, // Process in batches
  });

  logger.info(
    { count: overdueSchedules.length },
    'Processing overdue reminders'
  );

  const results = [];

  for (const schedule of overdueSchedules) {
    try {
      const job = await enqueueReminderDispatch(
        schedule.id,
        schedule.userId,
        schedule.channel as 'PUSH' | 'EMAIL',
        schedule.payload as any,
        schedule.scheduledFor.toISOString(),
        {
          occasionId: schedule.occasionId || undefined,
          triggeredBy: 'scheduler',
        }
      );

      results.push({ scheduleId: schedule.id, jobId: job.id, success: true });
    } catch (error) {
      logger.error(
        { scheduleId: schedule.id, error },
        'Failed to enqueue overdue reminder'
      );
      results.push({ scheduleId: schedule.id, success: false, error });
    }
  }

  return results;
}
```

---

## 5. Error Handling

Best practices for handling job enqueue failures.

### Graceful Degradation

```typescript
import { enqueueProductEmbedding } from '@/jobs';
import { logger } from '@/utils/logger';

export async function createProduct(productData: any) {
  // 1. Save product to DB first
  const product = await prisma.productMirror.create({
    data: productData,
  });

  // 2. Try to enqueue job, but don't fail the entire operation
  try {
    await enqueueProductEmbedding(product.id, {
      triggeredBy: 'product.created',
    });
  } catch (error) {
    // Log error but continue - job can be retried manually
    logger.error(
      { productId: product.id, error },
      'Failed to enqueue embedding job. Product saved, but embedding generation failed.'
    );

    // Optionally: Store failed job in a dead-letter table for manual retry
    await prisma.failedJob.create({
      data: {
        jobType: 'PRODUCT_EMBEDDING',
        entityId: product.id,
        error: error.message,
      },
    });
  }

  return product;
}
```

### Retry with Backoff

```typescript
import { enqueueProductEmbedding } from '@/jobs';
import { logger } from '@/utils/logger';

export async function enqueueWithRetry(
  productId: string,
  maxRetries = 3,
  retryDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const job = await enqueueProductEmbedding(productId);
      logger.info({ productId, attempt }, 'Job enqueued successfully');
      return job;
    } catch (error) {
      logger.warn(
        { productId, attempt, error },
        `Enqueue attempt ${attempt} failed`
      );

      if (attempt === maxRetries) {
        logger.error({ productId, error }, 'All enqueue attempts failed');
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
      );
    }
  }
}
```

---

## 6. Integration with Services

How to integrate job infrastructure into your service layer.

### Product Service

```typescript
// src/services/commerce/product.service.ts
import { enqueueProductProcessing } from '@/jobs';

export class ProductService {
  async createProduct(data: CreateProductInput) {
    // Business logic
    const product = await this.productRepo.create(data);

    // Enqueue background jobs
    if (product.status === 'PUBLISHED') {
      await enqueueProductProcessing(product.id, {
        triggeredBy: 'product.created',
      });
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const product = await this.productRepo.update(id, data);

    // Re-process if published and visible
    if (product.status === 'PUBLISHED' && product.visibleToGifter) {
      await enqueueProductProcessing(product.id, {
        triggeredBy: 'product.updated',
      });
    }

    return product;
  }
}
```

### Recommendation Service

```typescript
// src/services/recommendations/recommendation.service.ts
import { enqueueTasteProfileEmbedding } from '@/jobs';

export class RecommendationService {
  async getRecommendations(userId: string, recipientId?: string) {
    // Check if user has a taste profile
    const profile = await this.getTasteProfile(userId, recipientId);

    if (!profile) {
      throw new Error('No taste profile found. Please complete onboarding.');
    }

    // Check if embedding exists
    if (!profile.vector) {
      // Enqueue embedding generation if missing
      await enqueueTasteProfileEmbedding(profile.id, userId, {
        recipientId,
        triggeredBy: 'manual',
      });

      throw new Error('Taste profile is being processed. Please try again in a moment.');
    }

    // Continue with recommendation logic...
    const recommendations = await this.generateRecommendations(profile);
    return recommendations;
  }
}
```

---

## Summary

The job infrastructure is designed to be:

1. **Easy to use** - Simple function calls with typed payloads
2. **Reliable** - Automatic retries, error handling, idempotency
3. **Observable** - Logging, job IDs, tracking
4. **Flexible** - Configurable priorities, delays, retries

Always remember:

- Jobs are asynchronous - don't wait for them to complete
- Handle enqueue failures gracefully
- Use idempotent job IDs to prevent duplicates
- Log job IDs for tracking and debugging
- Monitor queue depths and processing times
