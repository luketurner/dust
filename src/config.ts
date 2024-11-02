export const ROOT_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
export const HOSTNAME = (new URL(ROOT_URL)).hostname;

export const GIT_EMAIL = `git@${HOSTNAME}`
export const GIT_NAME = 'Dust';

export const MAX_ACTIVE_TASKS = 100;

export interface ModelConfig {
  displayName: string;
}

export const MODELS = {
  'phi-2.Q2_K': {
    displayName: 'Phi-2 (Q2_K)',
  }
}

export type ModelName = keyof typeof MODELS;

export const DEFAULT_EMBEDDING_MODEL: ModelName = 'phi-2.Q2_K';