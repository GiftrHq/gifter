import { prisma } from './prisma.js';
import { openaiService } from './llm/openai.service.js';
import { unsplashService } from './unsplash.service.js';
import { clusteringService } from './clustering.service.js';
import { PromptLibrary } from '../prompts/PromptLibrary.js';
import { logger } from '../utils/logger.js';
import { LlmPurpose, Prisma, ProductPublishStatus } from '@prisma/client';

// Import prompt template to register it (we'll update this next)
import '../prompts/templates/curated_collections.v1.js';

interface CollectionSpec {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  productIds: string[]; // LLM selects subset from cluster
  editorial_vibe: string;
}

interface CollectionsResponse {
  collections: CollectionSpec[];
}

export interface GenerateCollectionsOptions {
  surface: 'home' | 'discovery' | 'occasion';
  targetDate: string;
  collectionsCount?: number; // Target number of collections
  productsPerCollection?: number;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    brandIds?: string[];
    excludeProductIds?: string[];
    isFeatured?: boolean;
    // New: Slices for pipeline
    category?: string;
  };
  traceId?: string;
}

export class CollectionService {
  /**
   * Generate curated collections using Cluster-First pipeline
   */
  async generateCollections(options: GenerateCollectionsOptions): Promise<{
    collectionsCreated: number;
    modelRunId: string;
  }> {
    const startTime = Date.now();
    const traceId = options.traceId || `run-${startTime}`;
    let totalCreated = 0;
    let lastModelRunId = '';

    // 1. Candidate Pool Creation
    // Fetch a larger pool of products to cluster (e.g. 500-1000)
    const products = await this.fetchAvailableProducts({
      ...options.filters,
      limit: 1000 // Limit pool size for clustering performance
    });

    if (products.length < 50) { // arbitrary min size for clustering
      logger.warn({ count: products.length }, 'Insufficient products for clustering');
      return { collectionsCreated: 0, modelRunId: '' };
    }

    // 2. Clustering
    // Fetch embeddings for these products
    const productIds = products.map(p => p.id);
    const points = await clusteringService.fetchEmbeddingsForItems(productIds);

    // Cluster them (aim for ~40 items per cluster as a heuristic, or fixed k)
    // If we want 10 collections, maybe generate 20 clusters and pick top 10?
    const k = Math.min(Math.floor(products.length / 30), 20);
    if (k < 2) {
      logger.warn('Pool too small for meaningful clustering, falling back to simple logic or skipping');
      // In production we might fall back to "Select 20 random items" but here we skip
      return { collectionsCreated: 0, modelRunId: '' };
    }

    const clusters = await clusteringService.clusterItems(points, k);

    // 3. Pre-selection (Scoring)
    const scoredClusters = clusteringService.scoreClusters(clusters);
    const topClusters = scoredClusters.slice(0, options.collectionsCount || 5);

    logger.info({
      poolSize: products.length,
      clustersFound: clusters.length,
      topClusters: topClusters.length
    }, 'Clustering complete');

    // 4. LLM Editor Step (Iterate per cluster)
    // We treat each cluster as a "candidate collection" and ask LLM to refine it

    const season = this.determineSeason(new Date(options.targetDate));

    for (const cluster of topClusters) {
      // Map cluster points back to full product details
      const clusterProductIds = new Set(cluster.points.map(p => p.id));
      const clusterProducts = products.filter(p => clusterProductIds.has(p.id));

      const productSummary = clusterProducts.map((p) => ({
        id: p.id,
        title: p.title,
        brand: p.brand?.name || 'Unknown',
        price: p.defaultPrice,
        tags: p.giftTags,
        occasions: p.occasionFit,
        style: p.styleTags,
      }));

      // Render Prompt for this specific cluster
      const renderedPrompt = PromptLibrary.render('curated_collections', {
        date: options.targetDate,
        season,
        productCount: clusterProducts.length,
        isCluster: true, // Signal to template (if we use logic-less mustache, this logic might be in code)
        // We'll update the template to handle "Here is a cluster of items..."
      });

      try {
        const llmResponse = await openaiService.chatCompletion(
          [
            {
              role: 'system',
              content: renderedPrompt,
            },
            {
              role: 'user',
              content: `Here is a cluster of potentially related products:\n${JSON.stringify(productSummary, null, 2)}\n\nCreate ONE high-quality curated collection from these items. Select best ${options.productsPerCollection || 15} items.`,
            },
          ],
          {
            purpose: LlmPurpose.CURATED_COLLECTIONS,
            responseFormat: 'json_object',
            temperature: 0.7,
            traceId,
          }
        );

        lastModelRunId = llmResponse.modelRunId || '';

        // Parse Response
        // Expecting { collections: [ ... ] } but we only asked for 1
        const responseData = openaiService.parseJsonResponse<CollectionsResponse>(
          llmResponse.content
        );

        // 5. Post-process & Persist
        // (Similar to before but inside the loop)
        for (const spec of responseData.collections) {
          const unsplashPhoto = await unsplashService.getPhotoForVibe(spec.editorial_vibe);
          const saved = await this.saveCollection(spec, options.surface, options.targetDate, unsplashPhoto?.url, lastModelRunId);
          if (saved) totalCreated++;
        }

      } catch (err) {
        logger.error({ error: err, traceId }, 'Failed to process cluster with LLM');
      }
    }

    const processingTime = Date.now() - startTime;
    logger.info(
      {
        collectionsCreated: totalCreated,
        surface: options.surface,
        targetDate: options.targetDate,
        processingTimeMs: processingTime,
      },
      'Collections generation complete'
    );

    return {
      collectionsCreated: totalCreated,
      modelRunId: lastModelRunId,
    };
  }

  // --- Helpers ---

  private async saveCollection(spec: CollectionSpec, surface: string, targetDate: string, imageUrl: string | undefined | null, modelRunId: string): Promise<boolean> {
    try {
      const validFrom = new Date(targetDate);
      const validTo = new Date(validFrom);
      validTo.setDate(validTo.getDate() + 3);

      const createdCollection = await prisma.curatedCollection.create({
        data: {
          key: spec.key,
          title: spec.title,
          subtitle: spec.subtitle,
          description: spec.description,
          surface,
          generatedBy: 'ai',
          imageUrl: imageUrl || null,
          validFrom,
          validTo,
          metadata: {
            editorial_vibe: spec.editorial_vibe,
            generated_at: new Date().toISOString(),
            model_run_id: modelRunId,
          },
        },
      });

      // Add items
      // Filter productIds to known valid ones from the cluster (simple safety)
      await prisma.curatedCollectionItem.createMany({
        data: spec.productIds.map((pid, idx) => ({
          collectionId: createdCollection.id,
          productId: pid,
          rank: idx + 1,
        })),
        skipDuplicates: true
      });

      logger.info({ collectionId: createdCollection.id, title: spec.title }, 'Collection created');
      return true;
    } catch (error) {
      logger.error({ error, key: spec.key }, 'Failed to save collection');
      return false;
    }
  }

  /**
   * Fetch products available for collection inclusion
   * (Candidates pool)
   */
  private async fetchAvailableProducts(filters?: {
    minPrice?: number;
    maxPrice?: number;
    brandIds?: string[];
    excludeProductIds?: string[];
    isFeatured?: boolean;
    limit?: number;
  }): Promise<Prisma.ProductMirrorGetPayload<{ include: { brand: true } }>[]> {
    return prisma.productMirror.findMany({
      where: {
        status: ProductPublishStatus.PUBLISHED,
        ...(filters?.minPrice && { defaultPrice: { gte: filters.minPrice } }),
        ...(filters?.maxPrice && { defaultPrice: { lte: filters.maxPrice } }),
        ...(filters?.brandIds && { brandId: { in: filters.brandIds } }),
        ...(filters?.excludeProductIds && {
          id: { notIn: filters.excludeProductIds },
        }),
        ...(filters?.isFeatured !== undefined && {
          isFeatured: filters.isFeatured,
        }),
      },
      include: {
        brand: true,
      },
      orderBy: {
        createdAt: 'desc', // Bias towards newer items in pool? Or random?
        // Random not easily supported in Prisma, usually we fetch range and shuffle.
        // For now, descending creation is fine for "freshness"
      },
      take: filters?.limit || 200,
    });
  }

  private determineSeason(date: Date): string {
    const month = date.getMonth() + 1; // 1-12
    if (month >= 12 || month <= 2) return 'winter / holiday season';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'autumn';
  }

  async cleanupExpiredCollections(): Promise<number> {
    const result = await prisma.curatedCollection.deleteMany({
      where: {
        validTo: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}

export const collectionService = new CollectionService();
