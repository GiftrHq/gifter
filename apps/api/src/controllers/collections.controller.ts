import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';

const getCollectionsSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  surface: z.string().optional(),
});

export async function getCollections(request: FastifyRequest, reply: FastifyReply) {
  const query = request.query as { limit?: string };
  const limit = query.limit ? parseInt(query.limit, 10) : 10;

  // Get active collections
  const collections = await prisma.curatedCollection.findMany({
    where: {
      validFrom: { lte: new Date() },
      OR: [
        { validTo: null },
        { validTo: { gte: new Date() } }
      ]
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        take: 5, // Preview items
        include: {
          product: {
            include: {
              brand: true,
              variants: true
            }
          }
        },
        orderBy: { rank: 'asc' }
      }
    }
  });

  // Transform to response format
  const response = collections.map(collection => ({
    id: collection.id,
    title: collection.title,
    slug: collection.key,
    description: collection.description,
    narrative: collection.subtitle,
    imageURL: collection.imageUrl,
    theme: collection.title,
    occasion: null,
    productCount: collection.items.length,
    isPersonalized: collection.generatedBy === 'ai'
  }));

  return reply.send({
    collections: response,
    total: collections.length
  });
}

export async function getCollectionById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  const collection = await prisma.curatedCollection.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              variants: true
            }
          }
        },
        orderBy: { rank: 'asc' }
      }
    }
  });

  if (!collection) {
    return reply.status(404).send({
      error: {
        code: 'COLLECTION_NOT_FOUND',
        message: 'Collection not found'
      }
    });
  }

  // Transform collection
  const collectionResponse = {
    id: collection.id,
    title: collection.title,
    slug: collection.key,
    description: collection.description,
    narrative: collection.subtitle,
    imageURL: collection.imageUrl,
    theme: collection.title,
    occasion: null,
    productCount: collection.items.length,
    isPersonalized: collection.generatedBy === 'ai'
  };

  // Transform products
  const products = collection.items.map(item => ({
    id: item.product.id,
    title: item.product.title,
    slug: item.product.slug,
    shortDescription: item.product.shortDescription,
    description: item.product.description,
    primaryImageUrl: item.product.primaryImageUrl,
    galleryImageUrls: item.product.galleryImageUrls,
    defaultPrice: item.product.defaultPrice,
    defaultCurrency: item.product.defaultCurrency,
    brand: {
      id: item.product.brand.id,
      name: item.product.brand.name,
      slug: item.product.brand.slug,
      logoUrl: item.product.brand.logoUrl
    },
    giftTags: item.product.giftTags,
    occasionFit: item.product.occasionFit,
    styleTags: item.product.styleTags,
    isFeatured: item.product.isFeatured
  }));

  return reply.send({
    collection: collectionResponse,
    products
  });
}

export async function getCollectionProducts(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const query = request.query as { limit?: string; offset?: string };
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const offset = query.offset ? parseInt(query.offset, 10) : 0;

  const items = await prisma.curatedCollectionItem.findMany({
    where: { collectionId: id },
    include: {
      product: {
        include: {
          brand: true,
          variants: true
        }
      }
    },
    orderBy: { rank: 'asc' },
    take: limit,
    skip: offset
  });

  const total = await prisma.curatedCollectionItem.count({
    where: { collectionId: id }
  });

  const products = items.map(item => ({
    id: item.product.id,
    title: item.product.title,
    slug: item.product.slug,
    shortDescription: item.product.shortDescription,
    description: item.product.description,
    primaryImageUrl: item.product.primaryImageUrl,
    galleryImageUrls: item.product.galleryImageUrls,
    defaultPrice: item.product.defaultPrice,
    defaultCurrency: item.product.defaultCurrency,
    brand: {
      id: item.product.brand.id,
      name: item.product.brand.name,
      slug: item.product.brand.slug,
      logoUrl: item.product.brand.logoUrl
    },
    giftTags: item.product.giftTags,
    occasionFit: item.product.occasionFit,
    styleTags: item.product.styleTags,
    isFeatured: item.product.isFeatured
  }));

  return reply.send({
    products,
    total,
    limit,
    offset,
    hasMore: offset + limit < total
  });
}
