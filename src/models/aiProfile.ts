import 'server-only';
import { prisma } from "@/db/client";
import { MODEL_SERVER_CONFIG, ModelServerConfig } from "@/serverConfig";
import { AIProfile, User } from "@prisma/client";
import { DEFAULT_EMBEDDING_MODEL, ModelConfig, ModelName, MODELS } from '@/config';

export async function getUserAIProfile(user: User): Promise<AIProfile> {
  if (!user.useAI || !user.selectedAIProfileId) throw new Error('Feature not enabled');
  const profile = await prisma.aIProfile.findFirstOrThrow({
    where: {
      userId: user.id,
      id: user.selectedAIProfileId
    }
  });
  return profile;
}

export async function getModelConfigServer(name: ModelName): Promise<ModelConfig & ModelServerConfig> {
  return { ...MODELS[name], ...MODEL_SERVER_CONFIG[name] };
}

export async function createUserAIProfile(user: User, settings?: Pick<AIProfile, 'embeddingModel'>): Promise<AIProfile> {
  if (!user.useAI) throw new Error('Feature not enabled');
  const profile = await prisma.aIProfile.create({
    data: {
      userId: user.id,
      embeddingModel: settings?.embeddingModel ?? DEFAULT_EMBEDDING_MODEL
    }
  });
  return profile;
}
