/**
 * Mirror Service
 *
 * Handles mirroring of commerce objects from Payload CMS to Core API database.
 * This service provides utilities for managing the mirroring lifecycle and determining
 * when products should trigger downstream processing.
 */

import { ProductPublishStatus } from '@prisma/client';
import { logger } from '../../utils/logger';

export interface ProductMirrorDecision {
  shouldEnrich: boolean;
  shouldEmbed: boolean;
  reason?: string;
}

/**
 * Determine if a product should trigger enrichment and embedding jobs
 *
 * Rules:
 * - Only published products with visibleToGifter=true should be enriched/embedded
 * - Draft or archived products should not trigger jobs
 */
export function shouldProcessProduct(product: {
  status: string;
  visibleToGifter?: boolean;
}): ProductMirrorDecision {
  const decision: ProductMirrorDecision = {
    shouldEnrich: false,
    shouldEmbed: false,
  };

  // Convert status string to ProductPublishStatus enum
  const status = product.status.toUpperCase();

  if (status !== 'PUBLISHED') {
    decision.reason = `Product status is ${product.status}, not PUBLISHED`;
    logger.debug({ product, decision }, 'Product not eligible for processing');
    return decision;
  }

  if (product.visibleToGifter === false) {
    decision.reason = 'Product is not visible to Gifter';
    logger.debug({ product, decision }, 'Product not eligible for processing');
    return decision;
  }

  // Product is published and visible - should be enriched and embedded
  decision.shouldEnrich = true;
  decision.shouldEmbed = true;
  decision.reason = 'Product is published and visible to Gifter';

  logger.debug({ product, decision }, 'Product eligible for processing');
  return decision;
}

/**
 * Compare product data to detect meaningful changes
 *
 * This helps determine if we should force re-enrichment/re-embedding
 * when product data has changed significantly.
 */
export function hasSignificantProductChange(
  oldProduct: {
    title?: string;
    description?: string;
    shortDescription?: string;
    specs?: string;
    giftTags?: any;
    occasionFit?: any;
    styleTags?: any;
  } | null,
  newProduct: {
    title?: string;
    description?: string;
    shortDescription?: string;
    specs?: string;
    giftTags?: any;
    occasionFit?: any;
    styleTags?: any;
  }
): boolean {
  // If no old product exists, it's always significant (new product)
  if (!oldProduct) {
    return true;
  }

  // Check if core text fields have changed
  const textFieldsChanged =
    oldProduct.title !== newProduct.title ||
    oldProduct.description !== newProduct.description ||
    oldProduct.shortDescription !== newProduct.shortDescription ||
    oldProduct.specs !== newProduct.specs;

  if (textFieldsChanged) {
    logger.debug('Significant change detected: text fields modified');
    return true;
  }

  // Check if tags have changed (compare stringified versions)
  const tagsChanged =
    JSON.stringify(oldProduct.giftTags) !== JSON.stringify(newProduct.giftTags) ||
    JSON.stringify(oldProduct.occasionFit) !== JSON.stringify(newProduct.occasionFit) ||
    JSON.stringify(oldProduct.styleTags) !== JSON.stringify(newProduct.styleTags);

  if (tagsChanged) {
    logger.debug('Significant change detected: tags modified');
    return true;
  }

  return false;
}

/**
 * Validate brand data from webhook payload
 */
export function validateBrandData(brand: any): boolean {
  if (!brand.payloadBrandId || !brand.name) {
    logger.error({ brand }, 'Invalid brand data: missing required fields');
    return false;
  }
  return true;
}

/**
 * Validate product data from webhook payload
 */
export function validateProductData(product: any): boolean {
  if (!product.title) {
    logger.error({ product }, 'Invalid product data: missing required fields');
    return false;
  }
  return true;
}

/**
 * Validate variant data from webhook payload
 */
export function validateVariantData(variant: any): boolean {
  if (!variant.payloadVariantId || !variant.sku || variant.price === undefined) {
    logger.error({ variant }, 'Invalid variant data: missing required fields');
    return false;
  }
  return true;
}

/**
 * Sanitize and prepare brand data for database insertion
 */
export function prepareBrandData(brand: any) {
  return {
    payloadBrandId: String(brand.payloadBrandId),
    name: brand.name,
    slug: brand.slug || undefined,
    status: brand.status || undefined,
    country: brand.country || undefined,
    baseCurrency: brand.baseCurrency || undefined,
    logoUrl: brand.logoUrl || undefined,
    coverImageUrl: brand.coverImageUrl || undefined,
    giftFit: brand.giftFit || undefined,
    styleTags: brand.styleTags || undefined,
    stripeConnectAccountId: brand.stripeConnectAccountId || undefined,
    stripeOnboardingStatus: brand.stripeOnboardingStatus || undefined,
  };
}

/**
 * Sanitize and prepare product data for database insertion
 */
export function prepareProductData(product: any, brandId: string) {
  // Map status string to enum
  let status: ProductPublishStatus = ProductPublishStatus.DRAFT;
  if (product.status) {
    const statusUpper = product.status.toUpperCase();
    if (statusUpper in ProductPublishStatus) {
      status = ProductPublishStatus[statusUpper as keyof typeof ProductPublishStatus];
    }
  }

  return {
    title: product.title,
    slug: product.slug || undefined,
    status,
    visibleToGifter: product.visibleToGifter !== false, // default to true
    isFeatured: product.isFeatured || false,
    shortDescription: product.shortDescription || undefined,
    description: product.description || undefined,
    specs: product.specs || undefined,
    primaryImageUrl: product.primaryImageUrl || undefined,
    galleryImageUrls: product.galleryImageUrls || undefined,
    defaultPrice: product.defaultPrice || undefined,
    defaultCurrency: product.defaultCurrency || undefined,
    giftTags: product.giftTags || undefined,
    occasionFit: product.occasionFit || undefined,
    styleTags: product.styleTags || undefined,
    brandId,
  };
}

/**
 * Sanitize and prepare variant data for database insertion
 */
export function prepareVariantData(variant: any, productId: string) {
  return {
    payloadVariantId: String(variant.payloadVariantId),
    productId,
    sku: variant.sku,
    optionValues: variant.optionValues || [],
    price: variant.price,
    currency: variant.currency,
    stock: variant.stock !== undefined ? variant.stock : undefined,
    stripePriceId: variant.stripePriceId || undefined,
  };
}
