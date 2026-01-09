import { prisma } from '../services/prisma';
import { ProductPublishStatus, Prisma } from '@prisma/client';

export class ProductRepository {
  async upsertBrand(data: {
    payloadBrandId: string;
    name: string;
    slug?: string;
    status?: string;
    country?: string;
    baseCurrency?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    giftFit?: string;
    styleTags?: any;
    stripeConnectAccountId?: string;
    stripeOnboardingStatus?: string;
  }) {
    return prisma.brandMirror.upsert({
      where: { payloadBrandId: data.payloadBrandId },
      update: data,
      create: data,
    });
  }

  async upsertProduct(data: {
    payloadProductId: string;
    brandId: string;
    title: string;
    slug?: string;
    status: ProductPublishStatus;
    visibleToGifter?: boolean;
    isFeatured?: boolean;
    shortDescription?: string;
    description?: string;
    specs?: string;
    primaryImageUrl?: string;
    galleryImageUrls?: any;
    defaultPrice?: number;
    defaultCurrency?: string;
    giftTags?: any;
    occasionFit?: any;
    styleTags?: any;
  }) {
    return prisma.productMirror.upsert({
      where: { payloadProductId: data.payloadProductId },
      update: data,
      create: data,
    });
  }

  async upsertVariant(data: {
    payloadVariantId: string;
    productId: string;
    sku: string;
    optionValues: any;
    price: number;
    currency: string;
    stock?: number;
    stripePriceId?: string;
  }) {
    return prisma.variantMirror.upsert({
      where: { payloadVariantId: data.payloadVariantId },
      update: data,
      create: data,
    });
  }

  async findProductById(id: string) {
    return prisma.productMirror.findUnique({
      where: { id },
      include: {
        brand: true,
        variants: true,
        embeddings: true,
      },
    });
  }

  async findProductByPayloadId(payloadProductId: string) {
    return prisma.productMirror.findUnique({
      where: { payloadProductId },
      include: {
        brand: true,
        variants: true,
      },
    });
  }

  async findProducts(params: {
    status?: ProductPublishStatus;
    brandId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const where: Prisma.ProductMirrorWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }
    if (params.brandId) {
      where.brandId = params.brandId;
    }
    if (params.cursor) {
      where.id = { gt: params.cursor };
    }

    return prisma.productMirror.findMany({
      where,
      include: {
        brand: true,
        variants: true,
      },
      take: (params.limit || 20) + 1,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBrands() {
    return prisma.brandMirror.findMany({
      where: {
        status: 'approved',
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBrandById(id: string) {
    return prisma.brandMirror.findUnique({
      where: { id },
    });
  }

  async updateProductEnrichment(productId: string, enrichment: any, version: number) {
    return prisma.productMirror.update({
      where: { id: productId },
      data: {
        enrichment,
        enrichmentVersion: version,
      },
    });
  }
}
