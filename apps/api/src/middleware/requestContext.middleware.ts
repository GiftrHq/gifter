import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

export async function requestContextMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.requestId = randomUUID();
  reply.header('X-Request-Id', request.requestId);
}
