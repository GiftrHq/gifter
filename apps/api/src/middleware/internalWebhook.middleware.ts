import { FastifyRequest, FastifyReply } from 'fastify';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export async function internalWebhookMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const secret = request.headers['x-internal-webhook-secret'];

    if (!ENV.INTERNAL_WEBHOOK_SECRET) {
      logger.warn('INTERNAL_WEBHOOK_SECRET not configured. Allowing webhook in dev mode.');
      return;
    }

    if (!secret || secret !== ENV.INTERNAL_WEBHOOK_SECRET) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid webhook secret',
        },
      });
    }
  } catch (error) {
    logger.error({ error }, 'Webhook authentication failed');
    return reply.status(401).send({
      error: {
        code: 'WEBHOOK_AUTH_FAILED',
        message: 'Webhook authentication failed',
      },
    });
  }
}
