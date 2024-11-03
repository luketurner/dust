import 'server-only';
import { User } from "@prisma/client";
import { DEFAULT_EMBEDDING_MODEL, ModelName } from '@/config';

export interface AIConfig {
  embeddingModel: ModelName;
}

export function getAIConfig(user: User): AIConfig {
  if (!user.useAI) throw new Error('Feature not enabled');
  const config = (user.aiConfig ?? {}) as unknown as AIConfig;
  return {
    embeddingModel: config['embeddingModel'] ?? DEFAULT_EMBEDDING_MODEL,
  }
}