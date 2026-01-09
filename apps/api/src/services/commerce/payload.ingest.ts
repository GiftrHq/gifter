/**
 * Payload CMS Webhook Ingestion Service
 *
 * Handles incoming webhooks from Payload CMS for commerce object updates.
 * Mirrors brand, product, and variant data to the Core API database and
 * enqueues enrichment and embedding jobs for published products.
 *
 * Webhook contract spec: Section 4 of gifter-core-api-spec.md
 */

import { logger } from '../../utils/logger';
import { ProductRepository } from '../../repositories/product.repo';
import { enqueueProductEnrichment, enqueueProductEmbedding } from '../../jobs/enqueue';
import {
  shouldProcessProduct,
  hasSignificantProductChange,
  validateBrandData,
  validateProductData,
  validateVariantData,
  prepareBrandData,
  prepareProductData,
  prepareVariantData,
} from './mirror.service';

/**
 * Webhook payload structure from Payload CMS
 */
export interface PayloadProductChangedWebhook {
  event: 'product.changed';
  payloadProductId: string;
  brand: {
    payloadBrandId: string;
    name: string;
    status?: string;
    country?: string;
    baseCurrency?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    giftFit?: string;
    styleTags?: string[];
    stripeConnectAccountId?: string;
    stripeOnboardingStatus?: string;
  };
  product: {
    title: string;
    slug?: string;
    status: string;
    visibleToGifter?: boolean;
    isFeatured?: boolean;
    shortDescription?: string;
    description?: string;
    specs?: string;
    primaryImageUrl?: string;
    galleryImageUrls?: string[];
    defaultPrice?: number;
    defaultCurrency?: string;
    giftTags?: string[];
    occasionFit?: string[];
    styleTags?: string[];
  };
  variants: Array<{
    payloadVariantId: string;
    sku: string;
    optionValues?: Array<{ option: string; value: string }>;
    price: number;
    currency: string;
    stock?: number;
    stripePriceId?: string;
  }>;
  ts: string;
}

export interface IngestResult {
  success: boolean;
  brandId?: string;
  productId?: string;
  variantIds?: string[];
  jobsEnqueued?: {
    enrichment: boolean;
    embedding: boolean;
  };
  error?: string;
}

export class PayloadIngestService {
  constructor(private productRepo: ProductRepository) {}

  /**
   * Main ingestion handler for product.changed webhook
   *
   * Process flow:
   * 1. Validate webhook payload
   * 2. Upsert BrandMirror
   * 3. Upsert ProductMirror
   * 4. Upsert VariantMirror records
   * 5. Determine if product should be enriched/embedded
   * 6. Enqueue jobs if eligible
   */
  async ingestProductChanged(payload: PayloadProductChangedWebhook): Promise<IngestResult> {
    const result: IngestResult = {
      success: false,
    };

    try {
      logger.info(
        {
          event: payload.event,
          payloadProductId: payload.payloadProductId,
          brandId: payload.brand.payloadBrandId,
        },
        'Processing product.changed webhook'
      );

      // Step 1: Validate payload
      if (!this.validatePayload(payload)) {
        result.error = 'Invalid webhook payload';
        return result;
      }

      // Step 2: Upsert Brand
      const brandData = prepareBrandData(payload.brand);
      logger.debug({ brandData }, 'Upserting brand');

      const brand = await this.productRepo.upsertBrand(brandData);
      result.brandId = brand.id;

      logger.info({ brandId: brand.id, payloadBrandId: brand.payloadBrandId }, 'Brand upserted');

      // Step 3: Check if this is a significant change (before upserting product)
      const existingProduct = await this.productRepo.findProductByPayloadId(
        payload.payloadProductId
      );

      const hasSignificantChange = hasSignificantProductChange(existingProduct, payload.product);

      // Step 4: Upsert Product
      const productData = prepareProductData(payload.product, brand.id);
      productData['payloadProductId'] = payload.payloadProductId;

      logger.debug({ productData }, 'Upserting product');

      const product = await this.productRepo.upsertProduct(productData as any);
      result.productId = product.id;

      logger.info(
        { productId: product.id, payloadProductId: product.payloadProductId },
        'Product upserted'
      );

      // Step 5: Upsert Variants
      const variantIds: string[] = [];

      for (const variantPayload of payload.variants || []) {
        if (!validateVariantData(variantPayload)) {
          logger.warn(
            { variant: variantPayload, productId: product.id },
            'Skipping invalid variant'
          );
          continue;
        }

        const variantData = prepareVariantData(variantPayload, product.id);
        logger.debug({ variantData }, 'Upserting variant');

        const variant = await this.productRepo.upsertVariant(variantData);
        variantIds.push(variant.id);

        logger.debug(
          { variantId: variant.id, payloadVariantId: variant.payloadVariantId },
          'Variant upserted'
        );
      }

      result.variantIds = variantIds;

      logger.info(
        { productId: product.id, variantCount: variantIds.length },
        'All variants upserted'
      );

      // Step 6: Determine if product should trigger jobs
      const decision = shouldProcessProduct(payload.product);

      result.jobsEnqueued = {
        enrichment: false,
        embedding: false,
      };

      if (decision.shouldEnrich || decision.shouldEmbed) {
        logger.info(
          {
            productId: product.id,
            shouldEnrich: decision.shouldEnrich,
            shouldEmbed: decision.shouldEmbed,
            reason: decision.reason,
          },
          'Product eligible for processing - enqueuing jobs'
        );

        // Enqueue enrichment job
        if (decision.shouldEnrich) {
          await enqueueProductEnrichment(product.id, {
            currentEnrichmentVersion: existingProduct?.enrichmentVersion,
            triggeredBy: 'product.updated',
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          });
          result.jobsEnqueued.enrichment = true;
        }

        // Enqueue embedding job
        if (decision.shouldEmbed) {
          await enqueueProductEmbedding(product.id, {
            previousTextHash: existingProduct?.embeddings?.[0]?.textHash,
            triggeredBy: 'product.updated',
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          });
          result.jobsEnqueued.embedding = true;
        }

        logger.info(
          {
            productId: product.id,
            jobsEnqueued: result.jobsEnqueued,
          },
          'Jobs enqueued successfully'
        );
      } else {
        logger.info(
          {
            productId: product.id,
            reason: decision.reason,
          },
          'Product not eligible for processing - skipping job enqueue'
        );
      }

      result.success = true;
      return result;
    } catch (error) {
      logger.error(
        {
          error,
          payload,
        },
        'Error processing product.changed webhook'
      );

      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  /**
   * Validate the webhook payload structure and required fields
   */
  private validatePayload(payload: PayloadProductChangedWebhook): boolean {
    if (payload.event !== 'product.changed') {
      logger.error({ event: payload.event }, 'Invalid event type');
      return false;
    }

    if (!payload.payloadProductId) {
      logger.error('Missing payloadProductId');
      return false;
    }

    if (!validateBrandData(payload.brand)) {
      return false;
    }

    if (!validateProductData(payload.product)) {
      return false;
    }

    // Variants array is optional - products may not have variants
    if (payload.variants && !Array.isArray(payload.variants)) {
      logger.error('variants must be an array if provided');
      return false;
    }

    return true;
  }
}

/**
 * Factory function to create a PayloadIngestService instance
 */
export function createPayloadIngestService(): PayloadIngestService {
  const productRepo = new ProductRepository();
  return new PayloadIngestService(productRepo);
}
