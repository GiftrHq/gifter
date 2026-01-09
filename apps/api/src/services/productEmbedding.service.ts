import { prisma } from './prisma.js';
import { embeddingService } from './embedding.service.js';
import { logger } from '../utils/logger.js';
import { LlmPurpose, EmbeddingEntityType, ProductPublishStatus } from '@prisma/client';

interface ProductForEmbedding {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  giftTags: unknown;
  occasionFit: unknown;
  styleTags: unknown;
  brand: {
    name: string;
    giftFit: string | null;
    styleTags: unknown;
  };
}

class ProductEmbeddingService {
  /**
   * Create composite text for embedding from product data
   */
  createEmbeddingText(product: ProductForEmbedding): string {
    const parts: string[] = [];

    // Title and brand
    parts.push(`${product.title} by ${product.brand.name}`);

    // Description
    if (product.shortDescription) {
      parts.push(product.shortDescription);
    }
    if (product.description) {
      // Limit description length for embedding
      const truncatedDesc = product.description.slice(0, 500);
      parts.push(truncatedDesc);
    }

    // Gift tags
    if (product.giftTags && Array.isArray(product.giftTags)) {
      parts.push(`Gift tags: ${(product.giftTags as string[]).join(', ')}`);
    }

    // Occasion fit
    if (product.occasionFit && Array.isArray(product.occasionFit)) {
      parts.push(`Occasions: ${(product.occasionFit as string[]).join(', ')}`);
    }

    // Style tags
    if (product.styleTags && Array.isArray(product.styleTags)) {
      parts.push(`Style: ${(product.styleTags as string[]).join(', ')}`);
    }

    // Brand gift fit and style
    if (product.brand.giftFit) {
      parts.push(`Brand gift style: ${product.brand.giftFit}`);
    }
    if (product.brand.styleTags && Array.isArray(product.brand.styleTags)) {
      parts.push(`Brand style: ${(product.brand.styleTags as string[]).join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Generate and store embedding for a single product
   */
  async embedProduct(productId: string): Promise<void> {
    const product = await prisma.productMirror.findUnique({
      where: { id: productId },
      include: { brand: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const text = this.createEmbeddingText(product);
    const textHash = embeddingService.generateTextHash(text);

    // Check if embedding is current
    const needsRefresh = await embeddingService.needsRefresh(productId, textHash);
    if (!needsRefresh) {
      logger.debug({ productId }, 'Product embedding is current, skipping');
      return;
    }

    // Generate and store embedding
    const embedding = await embeddingService.generateEmbedding(
      text,
      LlmPurpose.PRODUCT_ENRICHMENT
    );
    await embeddingService.storeProductEmbedding(productId, text, embedding);

    logger.info({ productId }, 'Product embedding generated');
  }

  /**
   * Queue product for background embedding
   */
  async queueProductEmbedding(productId: string): Promise<string> {
    const product = await prisma.productMirror.findUnique({
      where: { id: productId },
      include: { brand: true },
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const text = this.createEmbeddingText(product);
    return embeddingService.queueEmbeddingJob(
      EmbeddingEntityType.PRODUCT,
      productId,
      text
    );
  }

  /**
   * Embed all products that need embedding
   */
  async embedAllProducts(batchSize: number = 50): Promise<{
    processed: number;
    skipped: number;
    failed: number;
  }> {
    const products = await prisma.productMirror.findMany({
      where: {
        status: ProductPublishStatus.PUBLISHED,
        visibleToGifter: true,
      },
      include: { brand: true },
      take: batchSize,
    });

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const text = this.createEmbeddingText(product);
        const textHash = embeddingService.generateTextHash(text);

        const needsRefresh = await embeddingService.needsRefresh(product.id, textHash);
        if (!needsRefresh) {
          skipped++;
          continue;
        }

        const embedding = await embeddingService.generateEmbedding(
          text,
          LlmPurpose.PRODUCT_ENRICHMENT
        );
        await embeddingService.storeProductEmbedding(product.id, text, embedding);
        processed++;
      } catch (error) {
        logger.error({ error, productId: product.id }, 'Failed to embed product');
        failed++;
      }
    }

    logger.info({ processed, skipped, failed }, 'Product embedding batch complete');
    return { processed, skipped, failed };
  }

  /**
   * Get products without embeddings
   */
  async getProductsWithoutEmbeddings(limit: number = 100): Promise<string[]> {
    const products = await prisma.$queryRaw<{ id: string }[]>`
      SELECT pm.id
      FROM "ProductMirror" pm
      LEFT JOIN "ProductEmbedding" pe ON pm.id = pe."productId"
      WHERE pm.status = 'PUBLISHED'
        AND pm."visibleToGifter" = true
        AND pe.id IS NULL
      LIMIT ${limit}
    `;

    return products.map((p) => p.id);
  }
}

export const productEmbeddingService = new ProductEmbeddingService();
