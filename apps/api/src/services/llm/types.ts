import { LlmPurpose } from '@prisma/client';

export interface LLMConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EmbeddingConfig {
  provider: string;
  model: string;
  dimensions: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  purpose: LlmPurpose;
  traceId?: string;
}

export interface ChatCompletionResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  modelRunId?: string;
}

export interface EmbeddingOptions {
  purpose: LlmPurpose;
  traceId?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  inputTokens: number;
  latencyMs: number;
}

export interface OnboardingQuestion {
  id: string;
  type: 'multiple_choice' | 'scale' | 'this_or_that' | 'short_text';
  question: string;
  description?: string;
  options?: OnboardingOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min?: string; max?: string };
  traitTarget?: string;
  required: boolean;
}

export interface OnboardingOption {
  id: string;
  label: string;
  description?: string;
  imageURL?: string;
}

export interface OnboardingQuestionsResponse {
  strategyUsed: string;
  onboardingFlow: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    trait_to_update: string;
    logic: string;
  }>;
}

export interface TasteProfileFacets {
  aestheticStyle?: string;
  lifeRituals?: string[];
  interests?: string[];
  priceRange?: { min?: number; max?: number };
  brandPreferences?: string[];
  occasions?: string[];
  keywords?: string[];
}
