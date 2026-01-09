import OpenAI from 'openai';
import { ENV } from '../../config/env.js';
import { prisma } from '../prisma.js';
import { logger } from '../../utils/logger.js';
import {
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
  EmbeddingOptions,
  EmbeddingResult,
} from './types.js';
import { LlmPurpose, Prisma } from '@prisma/client';

class OpenAIService {
  private client: OpenAI;
  private model: string;
  private embeddingModel: string;
  private embeddingDims: number;

  constructor() {
    this.client = new OpenAI({
      apiKey: ENV.LLM_API_KEY,
    });
    this.model = ENV.LLM_MODEL;
    this.embeddingModel = ENV.EMBEDDING_MODEL;
    this.embeddingDims = ENV.EMBEDDING_DIMS;
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        response_format:
          options.responseFormat === 'json_object'
            ? { type: 'json_object' }
            : undefined,
      });

      const latencyMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content ?? '';
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;

      // Log model run
      const modelRun = await this.logModelRun({
        purpose: options.purpose,
        promptKey: undefined,
        traceId: options.traceId,
        inputTokens,
        outputTokens,
        latencyMs,
        status: 'success',
        input: { messages },
        output: { content },
      });

      return {
        content,
        inputTokens,
        outputTokens,
        latencyMs,
        modelRunId: modelRun.id,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      // Log failed model run
      await this.logModelRun({
        purpose: options.purpose,
        promptKey: undefined,
        traceId: options.traceId,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        input: { messages },
      });

      throw error;
    }
  }

  async generateEmbedding(
    text: string,
    options: EmbeddingOptions
  ): Promise<EmbeddingResult> {
    const startTime = Date.now();

    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
        dimensions: this.embeddingDims,
      });

      const latencyMs = Date.now() - startTime;
      const embedding = response.data[0]?.embedding ?? [];
      const inputTokens = response.usage?.prompt_tokens ?? 0;

      logger.debug(
        { purpose: options.purpose, latencyMs, inputTokens },
        'Embedding generated'
      );

      return {
        embedding,
        inputTokens,
        latencyMs,
      };
    } catch (error) {
      logger.error({ error, purpose: options.purpose }, 'Embedding failed');
      throw error;
    }
  }

  async generateEmbeddingBatch(
    texts: string[],
    options: EmbeddingOptions
  ): Promise<EmbeddingResult[]> {
    const startTime = Date.now();

    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: texts,
        dimensions: this.embeddingDims,
      });

      const latencyMs = Date.now() - startTime;

      return response.data.map((item, index) => ({
        embedding: item.embedding,
        inputTokens: Math.floor(
          (response.usage?.prompt_tokens ?? 0) / texts.length
        ),
        latencyMs: Math.floor(latencyMs / texts.length),
      }));
    } catch (error) {
      logger.error({ error, purpose: options.purpose }, 'Batch embedding failed');
      throw error;
    }
  }

  private async logModelRun(data: {
    purpose: LlmPurpose;
    promptKey?: string;
    traceId?: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    status: string;
    error?: string;
    input?: unknown;
    output?: unknown;
  }) {
    try {
      return await prisma.modelRun.create({
        data: {
          purpose: data.purpose,
          provider: 'openai',
          model: this.model,
          promptKey: data.promptKey,
          traceId: data.traceId,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          latencyMs: data.latencyMs,
          costUsd: this.calculateCost(data.inputTokens, data.outputTokens),
          status: data.status as any, // Cast to avoid flexible string vs enum mismatch
          error: data.error,
          input: data.input as Prisma.JsonValue,
          output: data.output as Prisma.JsonValue,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to log model run');
      // Return a placeholder to avoid breaking the main flow
      return { id: 'log-failed' };
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // GPT-4 Turbo pricing (approximate)
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;

    return (
      (inputTokens / 1000) * inputCostPer1k +
      (outputTokens / 1000) * outputCostPer1k
    );
  }

  // Utility method to parse JSON from LLM response
  parseJsonResponse<T>(content: string): T {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    try {
      return JSON.parse(jsonString.trim());
    } catch (error) {
      logger.error({ content }, 'Failed to parse JSON from LLM response');
      throw new Error('Invalid JSON response from LLM');
    }
  }

  get config() {
    return {
      provider: 'openai',
      model: this.model,
      embeddingModel: this.embeddingModel,
      embeddingDims: this.embeddingDims,
    };
  }
}

export const openaiService = new OpenAIService();
