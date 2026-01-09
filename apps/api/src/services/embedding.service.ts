import { openaiService } from './llm/openai.service.js';
import { prisma } from './prisma.js';
import { logger } from '../utils/logger.js';
import { LlmPurpose, EmbeddingEntityType, JobStatus } from '@prisma/client';
import crypto from 'crypto';

export interface EmbeddingConfig {
  provider: string;
  model: string;
  dims: number;
}

class EmbeddingService {
  private config: EmbeddingConfig;

  constructor() {
    this.config = {
      provider: openaiService.config.provider,
      model: openaiService.config.embeddingModel,
      dims: openaiService.config.embeddingDims,
    };
  }

  /**
   * Generate a hash for text to detect changes
   */
  generateTextHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string, purpose: LlmPurpose): Promise<number[]> {
    const result = await openaiService.generateEmbedding(text, { purpose });
    return result.embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingBatch(
    texts: string[],
    purpose: LlmPurpose
  ): Promise<number[][]> {
    const results = await openaiService.generateEmbeddingBatch(texts, { purpose });
    return results.map((r) => r.embedding);
  }

  /**
   * Store embedding for a product in pgvector
   */
  async storeProductEmbedding(
    productId: string,
    text: string,
    vector: number[]
  ): Promise<void> {
    const textHash = this.generateTextHash(text);

    // Delete existing embeddings for this product with same model
    await prisma.productEmbedding.deleteMany({
      where: {
        productId,
        model: this.config.model,
      },
    });

    // Insert new embedding using raw SQL for pgvector
    await prisma.$executeRaw`
      INSERT INTO "ProductEmbedding" (id, "productId", provider, model, dims, vector, "textHash", "createdAt")
      VALUES (
        ${crypto.randomUUID()},
        ${productId},
        ${this.config.provider},
        ${this.config.model},
        ${this.config.dims},
        ${vector}::vector,
        ${textHash},
        NOW()
      )
    `;

    logger.debug({ productId, textHash }, 'Product embedding stored');
  }

  /**
   * Store embedding for a taste profile in pgvector
   */
  async storeTasteProfileEmbedding(
    profileId: string,
    vector: number[]
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "TasteProfile"
      SET vector = ${vector}::vector,
          provider = ${this.config.provider},
          model = ${this.config.model},
          dims = ${this.config.dims},
          "vectorUpdatedAt" = NOW()
      WHERE id = ${profileId}
    `;

    logger.debug({ profileId }, 'Taste profile embedding stored');
  }

  /**
   * Check if product embedding needs refresh
   */
  async needsRefresh(productId: string, currentTextHash: string): Promise<boolean> {
    const existing = await prisma.productEmbedding.findFirst({
      where: {
        productId,
        model: this.config.model,
      },
      select: { textHash: true },
    });

    return !existing || existing.textHash !== currentTextHash;
  }

  /**
   * Queue an embedding job for background processing
   */
  async queueEmbeddingJob(
    entityType: EmbeddingEntityType,
    entityId: string,
    inputText: string
  ): Promise<string> {
    const job = await prisma.embeddingJob.create({
      data: {
        entityType,
        entityId,
        provider: this.config.provider,
        model: this.config.model,
        dims: this.config.dims,
        inputText,
        status: JobStatus.QUEUED,
      },
    });

    logger.info({ jobId: job.id, entityType, entityId }, 'Embedding job queued');
    return job.id;
  }

  /**
   * Process pending embedding jobs
   */
  async processEmbeddingJobs(batchSize: number = 10): Promise<number> {
    const jobs = await prisma.embeddingJob.findMany({
      where: {
        status: JobStatus.QUEUED,
        scheduledAt: { lte: new Date() },
      },
      take: batchSize,
      orderBy: { scheduledAt: 'asc' },
    });

    if (jobs.length === 0) return 0;

    // Mark as running
    await prisma.embeddingJob.updateMany({
      where: { id: { in: jobs.map((j) => j.id) } },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    });

    // Process each job
    let processed = 0;
    for (const job of jobs) {
      try {
        if (!job.inputText) {
          throw new Error('No input text for embedding job');
        }

        const embedding = await this.generateEmbedding(
          job.inputText,
          job.entityType === EmbeddingEntityType.PRODUCT
            ? LlmPurpose.PRODUCT_ENRICHMENT
            : LlmPurpose.ONBOARDING_QUESTIONS
        );

        if (job.entityType === EmbeddingEntityType.PRODUCT) {
          await this.storeProductEmbedding(job.entityId, job.inputText, embedding);
        } else {
          await this.storeTasteProfileEmbedding(job.entityId, embedding);
        }

        await prisma.embeddingJob.update({
          where: { id: job.id },
          data: {
            status: JobStatus.SUCCEEDED,
            finishedAt: new Date(),
          },
        });

        processed++;
      } catch (error) {
        logger.error({ error, jobId: job.id }, 'Embedding job failed');

        await prisma.embeddingJob.update({
          where: { id: job.id },
          data: {
            status: JobStatus.FAILED,
            finishedAt: new Date(),
            attempts: { increment: 1 },
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return processed;
  }

  get embeddingConfig(): EmbeddingConfig {
    return this.config;
  }
}

export const embeddingService = new EmbeddingService();
