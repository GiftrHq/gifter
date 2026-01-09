import { FastifyRequest, FastifyReply } from 'fastify';
import { ENV } from '../config/env';

export async function healthCheck(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    ok: true,
    env: ENV.NODE_ENV,
    version: '1.0.0',
  });
}
