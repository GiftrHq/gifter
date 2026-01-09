import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ProductRepository } from '../repositories/product.repo';
import { paginationSchema, createPaginatedResponse } from '../utils/pagination';

const getProductsSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  brandId: z.string().optional(),
}).merge(paginationSchema);

export async function getProducts(request: FastifyRequest, reply: FastifyReply) {
  const params = getProductsSchema.parse(request.query);
  const productRepo = new ProductRepository();

  const products = await productRepo.findProducts({
    status: params.status as any,
    brandId: params.brandId,
    limit: params.limit,
    cursor: params.cursor,
  });

  const response = createPaginatedResponse(
    products,
    params.limit,
    (product) => product.id
  );

  return reply.send(response);
}

export async function getProduct(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const productRepo = new ProductRepository();

  const product = await productRepo.findProductById(id);

  if (!product) {
    return reply.status(404).send({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      },
    });
  }

  return reply.send(product);
}

export async function getBrands(request: FastifyRequest, reply: FastifyReply) {
  const productRepo = new ProductRepository();
  const brands = await productRepo.findBrands();
  return reply.send(brands);
}

export async function getBrand(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const productRepo = new ProductRepository();

  const brand = await productRepo.findBrandById(id);

  if (!brand) {
    return reply.status(404).send({
      error: {
        code: 'BRAND_NOT_FOUND',
        message: 'Brand not found',
      },
    });
  }

  return reply.send(brand);
}
