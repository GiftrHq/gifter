import { Redis } from 'ioredis';
import { ENV } from '../config/env.js';
import { prisma } from './prisma.js';
import { openaiService } from './llm/openai.service.js';
import { PromptLibrary } from '../prompts/PromptLibrary.js';
import { tasteProfileRepo } from '../repositories/tasteProfile.repo.js';
import { logger } from '../utils/logger.js';
import {
  OnboardingQuestion,
  OnboardingQuestionsResponse,
  TasteProfileFacets,
} from './llm/types.js';
import { LlmPurpose, RecipientType, OccasionType, OccasionRecurrence } from '@prisma/client';
import crypto from 'crypto';
import { AddressService } from './address.service.js';
import { RecipientRepository } from '../repositories/recipient.repo.js';
import { OccasionRepository } from '../repositories/occasion.repo.js';

const addressService = new AddressService();
const recipientRepo = new RecipientRepository();
const occasionRepo = new OccasionRepository();

// Import prompts to register them
import '../prompts/templates/onboarding_generator.v1.js';

const redis = new Redis(ENV.REDIS_URL);

export type OnboardingScenario = 'NEW_USER' | 'UPDATE_PROFILE' | 'NON_USER_GIFTING';

export interface OnboardingSession {
  sessionId: string;
  userId: string;
  scenario: OnboardingScenario;
  recipientId?: string;
  questions: OnboardingQuestion[];
  currentIndex: number;
  answers: Record<string, unknown>;
  startedAt: Date;
  tasteProfileId?: string;
}

interface StartOnboardingInput {
  userId: string;
  scenario: OnboardingScenario;
  recipientId?: string;
  recipientName?: string;
  recipientAge?: number;
  occasion?: string;
}

const ONBOARDING_SESSION_TTL = 24 * 60 * 60; // 24 hours
const QUESTIONS_CACHE_TTL = 3 * 24 * 60 * 60; // 3 days

// Fallback questions if LLM fails
const FALLBACK_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'q_style',
    type: 'multiple_choice',
    question: 'How would you describe your personal style?',
    options: [
      { id: 'minimal', label: 'Minimal & clean' },
      { id: 'bold', label: 'Bold & expressive' },
      { id: 'classic', label: 'Classic & timeless' },
      { id: 'eclectic', label: 'Eclectic & unique' },
    ],
    required: true,
  },
  {
    id: 'q_evening',
    type: 'multiple_choice',
    question: 'What does your perfect evening look like?',
    options: [
      { id: 'quiet', label: 'A quiet night in with a book' },
      { id: 'friends', label: 'Dinner with close friends' },
      { id: 'explore', label: 'Exploring somewhere new' },
      { id: 'creative', label: 'Working on a creative project' },
    ],
    required: true,
  },
  {
    id: 'q_interests',
    type: 'multiple_choice',
    question: 'Which of these interests resonate with you? (Select all that apply)',
    options: [
      { id: 'coffee', label: 'Coffee & beverages' },
      { id: 'reading', label: 'Books & reading' },
      { id: 'cooking', label: 'Cooking & food' },
      { id: 'wellness', label: 'Wellness & self-care' },
      { id: 'tech', label: 'Tech & gadgets' },
      { id: 'home', label: 'Home & decor' },
      { id: 'outdoor', label: 'Outdoor & travel' },
      { id: 'art', label: 'Art & creativity' },
    ],
    required: true,
  },
  {
    id: 'q_price',
    type: 'scale',
    question: 'What\'s your typical gift budget?',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: { min: 'Under £25', max: 'Over £150' },
    required: true,
  },
  {
    id: 'q_occasions',
    type: 'multiple_choice',
    question: 'What occasions do you usually buy gifts for?',
    options: [
      { id: 'birthday', label: 'Birthdays' },
      { id: 'christmas', label: 'Christmas / holidays' },
      { id: 'anniversary', label: 'Anniversaries' },
      { id: 'justbecause', label: 'Just because' },
      { id: 'thankyou', label: 'Thank you gifts' },
    ],
    required: true,
  },
];

class OnboardingService {
  private getSessionKey(sessionId: string): string {
    return `onboarding:session:${sessionId}`;
  }

  private getQuestionsCacheKey(scenario: OnboardingScenario, contextHash: string): string {
    return `onboarding:questions:${scenario}:${contextHash}`;
  }

  async startOnboarding(input: StartOnboardingInput): Promise<OnboardingSession> {
    const sessionId = crypto.randomUUID();

    // Get or generate questions
    const questions = await this.getOrGenerateQuestions(input);

    // Create initial taste profile
    const tasteProfile = await tasteProfileRepo.create({
      ownerUserId: input.userId,
      recipientId: input.recipientId,
      mode: input.scenario,
      name: input.recipientName,
      answers: {},
    });

    const session: OnboardingSession = {
      sessionId,
      userId: input.userId,
      scenario: input.scenario,
      recipientId: input.recipientId,
      questions,
      currentIndex: 0,
      answers: {},
      startedAt: new Date(),
      tasteProfileId: tasteProfile.id,
    };

    // Store session in Redis
    await redis.setex(
      this.getSessionKey(sessionId),
      ONBOARDING_SESSION_TTL,
      JSON.stringify(session)
    );

    logger.info(
      { userId: input.userId, sessionId, scenario: input.scenario },
      'Onboarding session started'
    );

    return session;
  }

  async getSession(sessionId: string): Promise<OnboardingSession | null> {
    const data = await redis.get(this.getSessionKey(sessionId));
    if (!data) return null;

    try {
      return JSON.parse(data) as OnboardingSession;
    } catch {
      return null;
    }
  }

  async getActiveSession(userId: string): Promise<OnboardingSession | null> {
    // Find active session for user (including completed sessions not yet finalized)
    const keys = await redis.keys(`onboarding:session:*`);

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const session = JSON.parse(data) as OnboardingSession;
          // Include sessions that are in progress or completed but not finalized
          if (session.userId === userId) {
            return session;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<{ success: boolean; nextIndex: number; isComplete: boolean }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Validate question exists
    const questionIndex = session.questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error('Question not found');
    }

    // Update answers
    session.answers[questionId] = answer;
    session.currentIndex = questionIndex + 1;

    // Update taste profile with answer
    if (session.tasteProfileId) {
      await tasteProfileRepo.updateAnswers(session.tasteProfileId, questionId, answer);
    }

    // Check if complete
    const isComplete = session.currentIndex >= session.questions.length;

    // Update session in Redis
    await redis.setex(
      this.getSessionKey(sessionId),
      ONBOARDING_SESSION_TTL,
      JSON.stringify(session)
    );

    return {
      success: true,
      nextIndex: session.currentIndex,
      isComplete,
    };
  }

  async completeOnboarding(
    sessionId: string
  ): Promise<{ tasteProfile: TasteProfileFacets; summary: string[] }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Generate facets from answers
    const facets = await this.generateFacetsFromAnswers(session.answers, session.questions);

    // Generate embedding
    const embeddingText = this.generateEmbeddingText(facets);
    const embeddingResult = await openaiService.generateEmbedding(embeddingText, {
      purpose: LlmPurpose.ONBOARDING_QUESTIONS,
    });

    // Update taste profile
    if (session.tasteProfileId) {
      await tasteProfileRepo.update(session.tasteProfileId, {
        facets,
        vector: embeddingResult.embedding,
        vectorUpdatedAt: new Date(),
      });
    }

    // Generate summary
    const summary = this.generateProfileSummary(facets);

    // Clean up session
    await redis.del(this.getSessionKey(sessionId));

    logger.info(
      { userId: session.userId, sessionId },
      'Onboarding completed'
    );

    return { tasteProfile: facets, summary };
  }

  async getTasteProfile(userId: string) {
    return tasteProfileRepo.findByUserId(userId);
  }

  async updateIdentity(userId: string, data: {
    birthday?: Date;
    phone?: String;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
    onboardingStep?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update phone if provided
      if (data.phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: String(data.phone) },
        });
      }

      // 2. Handle Birthday (Linked to Self Recipient)
      if (data.birthday) {
        // Find or create "Self" recipient
        let meRecipient = await tx.recipient.findFirst({
          where: {
            ownerUserId: userId,
            type: RecipientType.USER,
            relationship: 'Self',
          },
        });

        if (!meRecipient) {
          meRecipient = await tx.recipient.create({
            data: {
              ownerUserId: userId,
              type: RecipientType.USER,
              name: 'Me',
              relationship: 'Self',
            },
          });
        }

        // Create or Update Birthday Occasion
        const existingBirthday = await tx.occasion.findFirst({
          where: {
            ownerUserId: userId,
            recipientId: meRecipient.id,
            type: OccasionType.BIRTHDAY,
          },
        });

        if (existingBirthday) {
          await tx.occasion.update({
            where: { id: existingBirthday.id },
            data: { date: data.birthday },
          });
        } else {
          await tx.occasion.create({
            data: {
              ownerUserId: userId,
              recipientId: meRecipient.id,
              type: OccasionType.BIRTHDAY,
              title: 'My Birthday',
              date: data.birthday,
              recurrence: OccasionRecurrence.YEARLY,
            },
          });
        }
      }

      // 3. Handle Address
      if (data.address) {
        // We use the service for standard logic but we need to stay in transaction if possible
        // Since addressService uses repo directly, we'll implement it here to ensure atomicity
        // Clear defaults if this is the new default
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        await tx.address.create({
          data: {
            userId,
            label: 'Home',
            ...data.address,
            isDefault: true,
          },
        });
      }

      // 4. Update onboarding step progress
      if (data.onboardingStep !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { onboardingStep: data.onboardingStep },
        });
      }

      return { success: true };
    });
  }

  async getStatus(userId: string): Promise<{
    status: 'not_started' | 'in_progress' | 'completed';
    currentQuestionIndex?: number;
    totalQuestions?: number;
    completedAt?: Date;
  }> {
    // Check for active session
    const session = await this.getActiveSession(userId);
    if (session) {
      return {
        status: 'in_progress',
        currentQuestionIndex: session.currentIndex,
        totalQuestions: session.questions.length,
      };
    }

    // Check for completed profile
    const profile = await tasteProfileRepo.findByUserId(userId);
    if (profile && profile.facets) {
      return {
        status: 'completed',
        completedAt: profile.updatedAt,
      };
    }

    return { status: 'not_started' };
  }

  private async getOrGenerateQuestions(
    input: StartOnboardingInput
  ): Promise<OnboardingQuestion[]> {
    // Create context hash for caching
    const contextHash = crypto
      .createHash('md5')
      .update(JSON.stringify({
        scenario: input.scenario,
        // Don't include user-specific data in cache key for global caching
      }))
      .digest('hex')
      .substring(0, 8);

    // Check cache
    const cacheKey = this.getQuestionsCacheKey(input.scenario, contextHash);
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        logger.debug({ scenario: input.scenario }, 'Using cached questions');
        return JSON.parse(cached);
      } catch {
        // Invalid cache, regenerate
      }
    }

    // Generate via LLM
    try {
      const questions = await this.generateQuestionsViaLLM(input);

      // Cache the result
      await redis.setex(cacheKey, QUESTIONS_CACHE_TTL, JSON.stringify(questions));

      return questions;
    } catch (error) {
      logger.error({ error, scenario: input.scenario }, 'LLM question generation failed, using fallback');
      return FALLBACK_QUESTIONS;
    }
  }

  private async generateQuestionsViaLLM(
    input: StartOnboardingInput
  ): Promise<OnboardingQuestion[]> {
    // Render the prompt
    const promptTemplate = PromptLibrary.get('onboarding_question_generator');
    if (!promptTemplate) {
      throw new Error('Onboarding prompt not found');
    }

    const renderedPrompt = PromptLibrary.render('onboarding_question_generator', {
      scenario: input.scenario,
      name: input.recipientName || 'User',
      preliminaryData: '{}',
      telemetryHistory: '[]',
      age: input.recipientAge?.toString() || 'Unknown',
      occasion: input.occasion || 'General',
    });

    // Call LLM
    const result = await openaiService.chatCompletion(
      [{ role: 'user', content: renderedPrompt }],
      {
        purpose: LlmPurpose.ONBOARDING_QUESTIONS,
        responseFormat: 'json_object',
        temperature: 0.7,
      }
    );

    // Parse response
    const parsed = openaiService.parseJsonResponse<OnboardingQuestionsResponse>(result.content);

    // Transform to our format
    return parsed.onboardingFlow.map((q, index) => ({
      id: q.id || `q_${index}`,
      type: q.type as OnboardingQuestion['type'],
      question: q.question,
      options: q.options?.map((opt, i) => ({
        id: `opt_${i}`,
        label: opt,
      })),
      traitTarget: q.trait_to_update,
      required: true,
    }));
  }

  private async generateFacetsFromAnswers(
    answers: Record<string, unknown>,
    questions: OnboardingQuestion[]
  ): Promise<TasteProfileFacets> {
    // Map answers to facets based on trait targets
    const facets: TasteProfileFacets = {
      interests: [],
      keywords: [],
    };

    for (const question of questions) {
      const answer = answers[question.id];
      if (!answer) continue;

      // Handle different answer types
      if (question.id.includes('style') || question.traitTarget?.includes('aesthetic')) {
        facets.aestheticStyle = String(answer);
      }

      if (question.id.includes('interests') || Array.isArray(answer)) {
        const interests = Array.isArray(answer) ? answer : [answer];
        facets.interests = [...(facets.interests || []), ...interests.map(String)];
      }

      if (question.id.includes('price') || question.type === 'scale') {
        const value = Number(answer);
        const priceRanges = [25, 50, 75, 100, 150];
        facets.priceRange = {
          min: priceRanges[Math.max(0, value - 2)] || 0,
          max: priceRanges[value] || 200,
        };
      }

      if (question.id.includes('occasion')) {
        const occasions = Array.isArray(answer) ? answer : [answer];
        facets.occasions = occasions.map(String);
      }

      // Add as keywords
      if (typeof answer === 'string') {
        facets.keywords?.push(answer.toLowerCase());
      }
    }

    return facets;
  }

  private generateEmbeddingText(facets: TasteProfileFacets): string {
    const parts: string[] = [];

    if (facets.aestheticStyle) {
      parts.push(`Style: ${facets.aestheticStyle}`);
    }

    if (facets.interests?.length) {
      parts.push(`Interests: ${facets.interests.join(', ')}`);
    }

    if (facets.occasions?.length) {
      parts.push(`Occasions: ${facets.occasions.join(', ')}`);
    }

    if (facets.priceRange) {
      parts.push(`Budget: £${facets.priceRange.min}-${facets.priceRange.max}`);
    }

    if (facets.keywords?.length) {
      parts.push(`Keywords: ${facets.keywords.join(', ')}`);
    }

    return parts.join('. ');
  }

  private generateProfileSummary(facets: TasteProfileFacets): string[] {
    const summary: string[] = [];

    if (facets.aestheticStyle) {
      summary.push(facets.aestheticStyle);
    }

    if (facets.interests?.slice(0, 3)) {
      summary.push(...facets.interests.slice(0, 3));
    }

    return summary;
  }
}

export const onboardingService = new OnboardingService();
