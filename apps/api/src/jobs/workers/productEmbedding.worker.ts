import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '../queue.js';
import {
    ProductEmbeddingJobPayload,
    ProductEmbeddingJobResult,
} from '../job.types.js';
import { prisma } from '../../services/prisma.js';
import { openaiService } from '../../services/llm/openai.service.js';
import { logger } from '../../utils/logger.js';
import { LlmPurpose } from '@prisma/client';

/**
 * Product Embedding Worker
 *
 * Processes jobs from the product-embedding queue.
 * Generates vector embeddings for products to enable semantic search and clustering.
 */

async function processProductEmbeddingJob(
    job: Job<ProductEmbeddingJobPayload>
): Promise<ProductEmbeddingJobResult> {
    const startTime = Date.now();
    const { productId, previousTextHash } = job.data;

    logger.info(
        { jobId: job.id, productId },
        'Processing product embedding job'
    );

    try {
        // 1. Fetch Product
        const product = await prisma.productMirror.findUnique({
            where: { id: productId },
            include: { brand: true },
        });

        if (!product) {
            logger.warn({ productId }, 'Product not found, skipping embedding');
            return {
                success: false,
                productId,
                skipped: true,
                skipReason: 'product-not-found',
                processingTimeMs: Date.now() - startTime,
            };
        }

        // 2. Construct Text to Embed
        // Combine relevant fields: Title, Brand, Description, Tags
        const textParts = [
            product.title,
            `Brand: ${product.brand.name}`,
        ];

        if (product.description) textParts.push(product.description);
        if (product.giftTags) textParts.push(`Tags: ${(product.giftTags as string[]).join(', ')}`);
        if (product.styleTags) textParts.push(`Style: ${(product.styleTags as string[]).join(', ')}`);
        if (product.occasionFit) textParts.push(`Occasions: ${(product.occasionFit as string[]).join(', ')}`);

        const textToEmbed = textParts.join('\n');

        // Simple hash check (in a real app we'd use a proper hash function)
        const textHash = Buffer.from(textToEmbed).toString('base64');

        if (previousTextHash && previousTextHash === textHash) {
            logger.info({ productId }, 'Text hash unchanged, skipping re-embedding');
            return {
                success: true,
                productId,
                skipped: true,
                skipReason: 'unchanged-hash',
                textHash,
                processingTimeMs: Date.now() - startTime,
            };
        }

        // 3. Generate Embedding
        const result = await openaiService.generateEmbedding(textToEmbed, {
            purpose: LlmPurpose.PRODUCT_ENRICHMENT, // Closest match
        });

        // 4. Save to Database
        // We store it in ProductEmbedding table
        // Note: Prisma Vector support needs raw query or specific setup.
        // Assuming we use the `ProductEmbedding` model which has `vector` as Unsupported("vector(1536)")

        // Deleting old embeddings for this model to keep it clean (or version them)
        // For MVP we just replace/add.

        // Since we can't easily write to Unsupported type via Prisma Client directly without extensions often,
        // we use $executeRaw.

        const vectorString = `[${result.embedding.join(',')}]`;

        // Clean up old embedding for this model
        await prisma.productEmbedding.deleteMany({
            where: {
                productId,
                model: openaiService.config.embeddingModel
            }
        });

        await prisma.$executeRaw`
      INSERT INTO "ProductEmbedding" (
        "id", "productId", "provider", "model", "dims", "vector", "textHash", "createdAt"
      ) VALUES (
        gen_random_uuid(),
        ${productId},
        ${openaiService.config.provider},
        ${openaiService.config.embeddingModel},
        ${openaiService.config.embeddingDims},
        ${vectorString}::vector,
        ${textHash},
        NOW()
      )
    `;

        const processingTimeMs = Date.now() - startTime;
        logger.info({ productId, processingTimeMs }, 'Product embedding generated and saved');

        return {
            success: true,
            productId,
            textHash,
            processingTimeMs,
        };

    } catch (error) {
        logger.error({ jobId: job.id, error, productId }, 'Product embedding job failed');
        throw error;
    }
}

/**
 * Create and start the product embedding worker
 */
export function createProductEmbeddingWorker() {
    const worker = new Worker<
        ProductEmbeddingJobPayload,
        ProductEmbeddingJobResult
    >(QUEUE_NAMES.PRODUCT_EMBEDDING, processProductEmbeddingJob, {
        connection: redisConnection,
        concurrency: 5, // Can run in parallel
    });

    worker.on('completed', (job, result) => {
        logger.debug(
            { jobId: job.id, productId: result.productId },
            'Product embedding job completed'
        );
    });

    worker.on('failed', (job, error) => {
        logger.error(
            { jobId: job?.id, error: error.message },
            'Product embedding job failed'
        );
    });

    return worker;
}
