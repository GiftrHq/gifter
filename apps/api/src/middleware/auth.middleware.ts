import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../config/auth';
import { logger } from '../utils/logger';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    authUserId: string;
    session: any;
    user: any;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid session',
        },
      });
    }

    request.session = session.session;
    request.user = session.user;
    request.userId = session.user.id;
    request.authUserId = session.user.id; // In Better Auth, userId is the auth ID

  } catch (error) {
    logger.error({ error }, 'Authentication failed');
    return reply.status(401).send({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid or expired session',
      },
    });
  }
}
