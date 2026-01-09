import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export async function handleProductChanged(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = request.body as any;

    // Import the service dynamically to avoid circular dependencies
    const { createPayloadIngestService } = await import('../services/commerce');
    const ingestService = createPayloadIngestService();

    const result = await ingestService.ingestProductChanged(payload);

    if (result.success) {
      logger.info({
        productId: result.productId,
        jobsEnqueued: result.jobsEnqueued
      }, 'Product webhook processed successfully');

      return reply.send({
        success: true,
        productId: result.productId,
        brandId: result.brandId,
        jobsEnqueued: result.jobsEnqueued,
      });
    } else {
      logger.error({ error: result.error }, 'Product webhook processing failed');
      return reply.status(400).send({
        error: {
          code: 'WEBHOOK_PROCESSING_FAILED',
          message: result.error || 'Failed to process webhook',
        },
      });
    }
  } catch (error) {
    logger.error({ error }, 'Product webhook handler error');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error processing webhook',
      },
    });
  }
}

export async function handleOrderStatusChanged(request: FastifyRequest, reply: FastifyReply) {
  // TODO: Implement order status change webhook
  logger.info({ payload: request.body }, 'Order status webhook received');
  return reply.send({ success: true, message: 'Not implemented yet' });
}

export async function handleBrandChanged(request: FastifyRequest, reply: FastifyReply) {
  // TODO: Implement brand change webhook
  logger.info({ payload: request.body }, 'Brand webhook received');
  return reply.send({ success: true, message: 'Not implemented yet' });
}
