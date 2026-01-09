import { FastifyInstance } from 'fastify';
import {
  startOnboarding,
  getQuestions,
  submitAnswer,
  completeOnboarding,
  getStatus,
  updateIdentity,
} from '../controllers/onboarding.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function onboardingRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // Start onboarding session
  fastify.post('/start', startOnboarding);

  // Get current questions
  fastify.get('/questions', getQuestions);

  // Submit an answer
  fastify.post('/answer', submitAnswer);

  // Complete onboarding and generate profile
  fastify.post('/complete', completeOnboarding);

  // Get onboarding status
  fastify.get('/status', getStatus);

  // Update identity (birthday, phone, address)
  fastify.post('/identity', updateIdentity);
}
