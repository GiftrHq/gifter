# BullMQ Job Infrastructure

This directory contains the BullMQ job queue infrastructure for background processing in the Core API.

## Overview

The job system uses **BullMQ** with **Redis** to handle asynchronous background tasks such as:

- Product embedding generation (vector search)
- Product enrichment (LLM-powered metadata)
- Taste profile embedding generation
- Curated collections generation
- Reminder dispatch (notifications)

## Architecture

### Files

- **`queue.ts`** - Queue initialization and Redis connection setup
- **`job.types.ts`** - TypeScript type definitions for all job payloads and results
- **`enqueue.ts`** - Helper functions to enqueue jobs
- **`index.ts`** - Module exports for convenient imports

### Queue Infrastructure

All queues share a single Redis connection for efficiency. Each queue has:

- **Retry logic** - Exponential backoff with configurable attempts
- **Priority levels** - Higher priority jobs are processed first
- **Job deduplication** - Using `jobId` for idempotency
- **Auto-cleanup** - Completed and failed jobs are automatically removed

### Priority Levels

1. **Priority 1 (Highest)** - User-facing, time-sensitive
   - Taste profile embeddings (user is waiting)
   - Reminder dispatch (time-sensitive notifications)

2. **Priority 2 (High)** - Product operations
   - Product embeddings (needed for search)

3. **Priority 3 (Medium)** - Enrichment
   - Product enrichment (LLM metadata)

4. **Priority 4 (Low)** - Background tasks
   - Curated collections generation (scheduled)

## Usage

### Enqueuing Jobs

Import the enqueue functions you need:

```typescript
import {
  enqueueProductEmbedding,
  enqueueProductEnrichment,
  enqueueTasteProfileEmbedding,
  enqueueCuratedCollections,
  enqueueReminderDispatch,
  enqueueProductProcessing, // Convenience: both embedding + enrichment
  scheduleDailyCuratedCollections, // Convenience: all surfaces
} from '@/jobs';
```

### Examples

#### 1. Product Embedding

```typescript
// Basic usage
await enqueueProductEmbedding('product-123');

// With options
await enqueueProductEmbedding('product-123', {
  triggeredBy: 'product.created',
  previousTextHash: 'abc123', // Skip if unchanged
  priority: 1, // Override default priority
  delay: 5000, // Delay 5 seconds before processing
});
```

#### 2. Product Enrichment

```typescript
await enqueueProductEnrichment('product-123', {
  triggeredBy: 'product.created',
  promptVersion: 'v2', // A/B testing
  currentEnrichmentVersion: 0,
});
```

#### 3. Taste Profile Embedding

```typescript
await enqueueTasteProfileEmbedding('profile-123', 'user-456', {
  triggeredBy: 'profile.completed',
  recipientId: 'recipient-789', // Optional
});
```

#### 4. Curated Collections

```typescript
await enqueueCuratedCollections('home', '2025-12-21', {
  collectionsCount: 6,
  productsPerCollection: 8,
  filters: {
    isFeatured: true,
    minPrice: 1000, // £10.00
    maxPrice: 10000, // £100.00
  },
  triggeredBy: 'scheduled',
});
```

#### 5. Reminder Dispatch

```typescript
await enqueueReminderDispatch(
  'schedule-123',
  'user-456',
  'PUSH',
  {
    title: 'Birthday Reminder',
    body: "Sarah's birthday is tomorrow!",
    data: { occasionId: 'occasion-789' },
  },
  '2025-12-22T09:00:00Z',
  {
    occasionId: 'occasion-789',
    triggeredBy: 'scheduler',
  }
);
```

#### 6. Product Processing (Convenience)

Enqueue both embedding and enrichment jobs for a new product:

```typescript
const { enrichmentJob, embeddingJob } = await enqueueProductProcessing(
  'product-123',
  {
    triggeredBy: 'product.created',
  }
);
```

#### 7. Daily Collections (Convenience)

Schedule collections for all surfaces:

```typescript
const jobs = await scheduleDailyCuratedCollections('2025-12-21');
// Returns 3 jobs: home, discovery, occasion
```

## Idempotency

All jobs are designed to be idempotent where possible:

### Job ID Strategy

Jobs use a predictable `jobId` format to prevent duplicates:

- Product embedding: `product-embedding:{productId}`
- Product enrichment: `product-enrichment:{productId}`
- Taste profile: `taste-profile-embedding:{tasteProfileId}`
- Collections: `curated-collections:{surface}:{date}`
- Reminders: `reminder-dispatch:{scheduleId}`

### Worker-Level Idempotency

Workers should also check database state before processing:

- **Product embedding**: Check `textHash` to skip if unchanged
- **Product enrichment**: Check `enrichmentVersion` to skip if current
- **Taste profile**: Check if `vector` already exists
- **Collections**: Check if collection for date already exists
- **Reminders**: Check `NotificationSchedule.status` before sending

## Environment Variables

Required environment variables (defined in `ENV`):

```bash
# Redis
REDIS_URL=redis://localhost:6379

# LLM/Embeddings
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMS=1536
LLM_API_KEY=sk-...
```

## Queue Management

### Shutdown

Gracefully close all queues on application shutdown:

```typescript
import { closeQueues } from '@/jobs';

process.on('SIGTERM', async () => {
  await closeQueues();
  process.exit(0);
});
```

### Health Check

Check if queue infrastructure is healthy:

```typescript
import { checkQueuesHealth } from '@/jobs';

const isHealthy = await checkQueuesHealth();
if (!isHealthy) {
  console.error('Redis connection failed!');
}
```

### Direct Queue Access

Access queue instances directly for advanced operations:

```typescript
import { productEmbeddingQueue, QUEUE_NAMES } from '@/jobs';

// Get queue stats
const stats = await productEmbeddingQueue.getJobCounts();
console.log(stats); // { waiting: 5, active: 2, completed: 100, failed: 3 }

// Pause/resume queue
await productEmbeddingQueue.pause();
await productEmbeddingQueue.resume();

// Clean old jobs
await productEmbeddingQueue.clean(24 * 3600 * 1000, 100, 'completed');
```

## Workers

Workers process jobs from these queues. Workers should be run in a separate process/service.

See `apps/workers/` for worker implementations.

### Worker Example

```typescript
import { Worker } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/jobs';
import { ProductEmbeddingJobPayload } from '@/jobs';

const worker = new Worker<ProductEmbeddingJobPayload>(
  QUEUE_NAMES.PRODUCT_EMBEDDING,
  async (job) => {
    const { productId } = job.data;

    // Process job...
    const result = await generateProductEmbedding(productId);

    return result;
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs in parallel
  }
);

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
```

## Testing

### Manual Testing

Use BullBoard for a web UI to monitor queues:

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import {
  productEmbeddingQueue,
  productEnrichmentQueue,
} from '@/jobs';

const serverAdapter = new FastifyAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(productEmbeddingQueue),
    new BullMQAdapter(productEnrichmentQueue),
    // ... add other queues
  ],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });
```

Access at: `http://localhost:4000/admin/queues`

## Best Practices

1. **Always use enqueue functions** - Don't call `queue.add()` directly
2. **Provide `triggeredBy`** - For tracking and debugging
3. **Use idempotent jobIds** - Prevents duplicate processing
4. **Set appropriate delays** - For rate limiting external APIs
5. **Monitor queue depths** - Alert if queues grow too large
6. **Test with retries** - Ensure jobs handle transient failures
7. **Log job results** - Include timing and success/failure metrics

## Monitoring

Key metrics to monitor:

- **Queue depth** - Waiting jobs per queue
- **Processing time** - Job duration (p50, p95, p99)
- **Failure rate** - Failed jobs / total jobs
- **Retry rate** - Jobs that required retries
- **Redis memory** - Track Redis memory usage
- **Worker health** - Worker uptime and errors

## Troubleshooting

### Jobs not processing

1. Check if workers are running
2. Check Redis connection: `await checkQueuesHealth()`
3. Check queue is not paused: `await queue.isPaused()`
4. Check worker concurrency settings

### Jobs failing repeatedly

1. Check error logs in BullBoard
2. Review job payload for invalid data
3. Check external dependencies (DB, APIs)
4. Consider increasing retry attempts or backoff delay

### High Redis memory

1. Reduce `removeOnComplete.count` and `removeOnFail.count`
2. Clean old jobs more aggressively
3. Consider using Redis eviction policies

## Future Enhancements

- [ ] Add job priority queues for urgent tasks
- [ ] Implement job batching for bulk operations
- [ ] Add metrics/observability (Prometheus, Datadog)
- [ ] Implement rate limiting for external API calls
- [ ] Add job scheduling with cron patterns
- [ ] Support for recurring jobs
