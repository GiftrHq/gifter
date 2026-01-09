import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '../queue.js';
import {
    TasteProfileEmbeddingJobPayload,
    TasteProfileEmbeddingJobResult,
} from '../job.types.js';
import { prisma } from '../../services/prisma.js';
import { openaiService } from '../../services/llm/openai.service.js';
import { logger } from '../../utils/logger.js';
import { LlmPurpose } from '@prisma/client';

/**
 * Taste Profile Embedding Worker
 *
 * Processes jobs from the taste-profile-embedding queue.
 * Generates vector embeddings for user taste profiles to enable personalized recommendations.
 */

async function processTasteProfileEmbeddingJob(
    job: Job<TasteProfileEmbeddingJobPayload>
): Promise<TasteProfileEmbeddingJobResult> {
    const startTime = Date.now();
    const { tasteProfileId } = job.data;

    logger.info(
        { jobId: job.id, tasteProfileId },
        'Processing taste profile embedding job'
    );

    try {
        // 1. Fetch Profile
        const profile = await prisma.tasteProfile.findUnique({
            where: { id: tasteProfileId },
        });

        if (!profile) {
            logger.warn({ tasteProfileId }, 'Taste profile not found, skipping embedding');
            return {
                success: false,
                tasteProfileId,
                skipped: true,
                skipReason: 'profile-not-found',
                processingTimeMs: Date.now() - startTime,
            };
        }

        // 2. Construct Text to Embed
        // Flatten answers and facets into a descriptive string
        const textParts: string[] = [];

        if (profile.name) textParts.push(`Profile Name: ${profile.name}`);
        if (profile.mode) textParts.push(`Type: ${profile.mode}`);

        if (profile.answers) {
            const answers = profile.answers as Record<string, any>;
            for (const [key, value] of Object.entries(answers)) {
                // Basic formatting for now
                textParts.push(`${key}: ${JSON.stringify(value)}`);
            }
        }

        // Facets are usually derived tags e.g. "likes_outdoors", "budget_high"
        if (profile.facets) {
            const facets = profile.facets as Record<string, any>;
            textParts.push(`Traits: ${JSON.stringify(facets)}`);
        }

        const textToEmbed = textParts.join('\n');

        // 3. Generate Embedding
        const result = await openaiService.generateEmbedding(textToEmbed, {
            purpose: LlmPurpose.PRODUCT_ENRICHMENT, // Reuse enum or add TASTE_PROFILE to enum if strictly needed, usually same model/dims
        });

        // 4. Save to Database
        const vectorString = `[${result.embedding.join(',')}]`;

        // Direct update to TasteProfile table which has `vector` column
        await prisma.$executeRaw`
      UPDATE "TasteProfile"
      SET 
        "vector" = ${vectorString}::vector,
        "vectorUpdatedAt" = NOW(),
        "provider" = ${openaiService.config.provider},
        "model" = ${openaiService.config.embeddingModel},
        "dims" = ${openaiService.config.embeddingDims}
      WHERE "id" = ${tasteProfileId}
    `;

        const processingTimeMs = Date.now() - startTime;
        logger.info({ tasteProfileId, processingTimeMs }, 'Taste profile embedding generated and saved');

        return {
            success: true,
            tasteProfileId,
            processingTimeMs,
        };

    } catch (error) {
        logger.error({ jobId: job.id, error, tasteProfileId }, 'Taste profile embedding job failed');
        throw error;
    }
}

/**
 * Create and start the taste profile embedding worker
 */
export function createTasteProfileEmbeddingWorker() {
    const worker = new Worker<
        TasteProfileEmbeddingJobPayload,
        TasteProfileEmbeddingJobResult
    >(QUEUE_NAMES.TASTE_PROFILE_EMBEDDING, processTasteProfileEmbeddingJob, {
        connection: redisConnection,
        concurrency: 5,
    });

    worker.on('completed', (job, result) => {
        logger.debug(
            { jobId: job.id, tasteProfileId: result.tasteProfileId },
            'Taste profile embedding job completed'
        );
    });

    worker.on('failed', (job, error) => {
        logger.error(
            { jobId: job?.id, error: error.message },
            'Taste profile embedding job failed'
        );
    });

    return worker;
}
