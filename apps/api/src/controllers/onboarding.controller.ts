import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { onboardingService, OnboardingScenario } from '../services/onboarding.service.js';
import { logger } from '../utils/logger.js';

// Request schemas
const startOnboardingSchema = z.object({
  scenario: z.enum(['NEW_USER', 'UPDATE_PROFILE', 'NON_USER_GIFTING']).default('NEW_USER'),
  recipientId: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAge: z.number().optional(),
  occasion: z.string().optional(),
});

const updateIdentitySchema = z.object({
  birthday: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  onboardingStep: z.number().optional(),
});

const submitAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
});

type StartOnboardingRequest = z.infer<typeof startOnboardingSchema>;
type SubmitAnswerRequest = z.infer<typeof submitAnswerSchema>;

export async function startOnboarding(
  request: FastifyRequest<{ Body: StartOnboardingRequest }>,
  reply: FastifyReply
) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = startOnboardingSchema.parse(request.body);

    const session = await onboardingService.startOnboarding({
      userId,
      scenario: body.scenario as OnboardingScenario,
      recipientId: body.recipientId,
      recipientName: body.recipientName,
      recipientAge: body.recipientAge,
      occasion: body.occasion,
    });

    return reply.status(201).send({
      sessionId: session.sessionId,
      questions: session.questions,
      scenario: session.scenario,
      currentIndex: session.currentIndex,
      totalQuestions: session.questions.length,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start onboarding');
    return reply.status(500).send({ error: 'Failed to start onboarding' });
  }
}

export async function getQuestions(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Get active session
    const session = await onboardingService.getActiveSession(userId);
    if (!session) {
      return reply.status(404).send({ error: 'No active onboarding session' });
    }

    return reply.send({
      sessionId: session.sessionId,
      questions: session.questions,
      scenario: session.scenario,
      currentIndex: session.currentIndex,
      totalQuestions: session.questions.length,
      answers: session.answers,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get questions');
    return reply.status(500).send({ error: 'Failed to get questions' });
  }
}

export async function submitAnswer(
  request: FastifyRequest<{ Body: SubmitAnswerRequest }>,
  reply: FastifyReply
) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = submitAnswerSchema.parse(request.body);

    logger.info({ userId, questionId: body.questionId, answer: body.answer }, 'Submitting answer');

    // Get active session
    const session = await onboardingService.getActiveSession(userId);
    if (!session) {
      logger.warn({ userId }, 'No active onboarding session found');
      return reply.status(404).send({ error: 'No active onboarding session' });
    }

    logger.info({ sessionId: session.sessionId, questionId: body.questionId }, 'Found active session');

    const result = await onboardingService.submitAnswer(
      session.sessionId,
      body.questionId,
      body.answer
    );

    logger.info({ result }, 'Answer submitted successfully');

    return reply.send({
      success: result.success,
      nextQuestionIndex: result.nextIndex,
      isComplete: result.isComplete,
    });
  } catch (error) {
    logger.error({
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: request.userId,
      body: request.body
    }, 'Failed to submit answer');
    return reply.status(500).send({
      error: 'Failed to submit answer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function completeOnboarding(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Get active session
    const session = await onboardingService.getActiveSession(userId);
    if (!session) {
      return reply.status(404).send({ error: 'No active onboarding session' });
    }

    const result = await onboardingService.completeOnboarding(session.sessionId);

    // Get the created/updated taste profile
    const tasteProfile = await onboardingService.getTasteProfile(userId);

    return reply.send({
      success: true,
      tasteProfile: tasteProfile ? {
        id: tasteProfile.id,
        userId: tasteProfile.ownerUserId,
        mode: tasteProfile.mode,
        answers: tasteProfile.answers,
        facets: tasteProfile.facets,
        completedAt: tasteProfile.updatedAt,
      } : null,
      profileSummary: result.summary,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to complete onboarding');
    return reply.status(500).send({ error: 'Failed to complete onboarding' });
  }
}

export async function getStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const status = await onboardingService.getStatus(userId);

    return reply.send(status);
  } catch (error) {
    logger.error({ error }, 'Failed to get onboarding status');
    return reply.status(500).send({ error: 'Failed to get status' });
  }
}

export async function updateIdentity(
  request: FastifyRequest<{ Body: z.infer<typeof updateIdentitySchema> }>,
  reply: FastifyReply
) {
  try {
    const userId = request.userId;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = updateIdentitySchema.parse(request.body);

    const result = await onboardingService.updateIdentity(userId, body);

    return reply.send(result);
  } catch (error) {
    logger.error({ error }, 'Failed to update identity');
    return reply.status(500).send({ error: 'Failed to update identity' });
  }
}
