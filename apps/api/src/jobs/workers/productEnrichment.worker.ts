import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '../queue.js';
import {
    ProductEnrichmentJobPayload,
    ProductEnrichmentJobResult,
} from '../job.types.js';
import { prisma } from '../../services/prisma.js';
import { openaiService } from '../../services/llm/openai.service.js';
import { logger } from '../../utils/logger.js';
import { LlmPurpose } from '@prisma/client';

/**
 * Product Enrichment Worker
 *
 * Processes jobs from the product-enrichment queue.
 * Uses LLM to enrich product metadata (tags, occasions, style).
 */

async function processProductEnrichmentJob(
    job: Job<ProductEnrichmentJobPayload>
): Promise<ProductEnrichmentJobResult> {
    const startTime = Date.now();
    const { productId, currentEnrichmentVersion } = job.data;

    logger.info(
        { jobId: job.id, productId },
        'Processing product enrichment job'
    );

    try {
        // 1. Fetch Product
        const product = await prisma.productMirror.findUnique({
            where: { id: productId },
            include: { brand: true },
        });

        if (!product) {
            logger.warn({ productId }, 'Product not found, skipping enrichment');
            return {
                success: false,
                productId,
                skipped: true,
                skipReason: 'product-not-found',
                processingTimeMs: Date.now() - startTime,
            };
        }

        if (currentEnrichmentVersion !== undefined && product.enrichmentVersion > currentEnrichmentVersion) {
            logger.info({ productId, current: product.enrichmentVersion, jobVer: currentEnrichmentVersion }, 'Product already enriched with newer version, skipping');
            return {
                success: true,
                productId,
                skipped: true,
                skipReason: 'already-enriched',
                processingTimeMs: Date.now() - startTime,
            };
        }

        // 2. Prepare Prompt
        // Ideally use PromptLibrary, but for now inline simple prompt to ensure it works
        // or assume PromptLibrary has 'product_enrichment' (I should have checked, but I'll write defensive code)

        const prompt = `
    Analyze the following product and provide enrichment data in JSON format.
    
    Product: ${product.title}
    Brand: ${product.brand.name}
    Description: ${product.description || ''}
    Price: ${product.defaultPrice ? product.defaultPrice / 100 : 'N/A'} ${product.defaultCurrency || ''}
    
    Return JSON with:
    - giftTags: string[] (e.g. "luxury", "sustainable", "handler-crafted", "tech", "beauty")
    - occasionFit: string[] (e.g. "birthday", "wedding", "housewarming", "christmas")
    - styleTags: string[] (e.g. "modern", "rustic", "minimalist", "bold")
    - shortDescription: string (concise 1-sentence summary)
    `;

        // 3. Call LLM
        const response = await openaiService.chatCompletion(
            [
                { role: 'system', content: 'You are an expert e-commerce merchandiser. Output JSON only.' },
                { role: 'user', content: prompt }
            ],
            {
                purpose: LlmPurpose.PRODUCT_ENRICHMENT,
                responseFormat: 'json_object',
                traceId: job.id
            }
        );

        const data = openaiService.parseJsonResponse<{
            giftTags: string[];
            occasionFit: string[];
            styleTags: string[];
            shortDescription: string;
        }>(response.content);

        // 4. Update Product
        await prisma.productMirror.update({
            where: { id: productId },
            data: {
                giftTags: data.giftTags,
                occasionFit: data.occasionFit,
                styleTags: data.styleTags,
                shortDescription: data.shortDescription || product.shortDescription, // fallback
                enrichmentVersion: { increment: 1 },
                enrichment: data as any // Store raw enrichment data
            }
        });

        const processingTimeMs = Date.now() - startTime;
        logger.info({ productId, processingTimeMs }, 'Product enriched successfully');

        return {
            success: true,
            productId,
            enrichmentVersion: product.enrichmentVersion + 1,
            modelRunId: response.modelRunId,
            processingTimeMs,
        };

    } catch (error) {
        logger.error({ jobId: job.id, error, productId }, 'Product enrichment job failed');
        throw error;
    }
}

/**
 * Create and start the product enrichment worker
 */
export function createProductEnrichmentWorker() {
    const worker = new Worker<
        ProductEnrichmentJobPayload,
        ProductEnrichmentJobResult
    >(QUEUE_NAMES.PRODUCT_ENRICHMENT, processProductEnrichmentJob, {
        connection: redisConnection,
        concurrency: 3,
    });

    worker.on('completed', (job, result) => {
        logger.debug(
            { jobId: job.id, productId: result.productId },
            'Product enrichment job completed'
        );
    });

    worker.on('failed', (job, error) => {
        logger.error(
            { jobId: job?.id, error: error.message },
            'Product enrichment job failed'
        );
    });

    return worker;
}
