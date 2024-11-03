import 'server-only';
import { getModelConfig, ModelName } from './config';

export const SSH_KEY_PASSPHRASE = process.env.DUST_SSH_KEY_PASSPHRASE || 'foobar';

export interface ModelServerConfig {
  url?: string;
}

const MODEL_SERVER_CONFIG: { [key: string]: ModelServerConfig } = {
  'phi-2.Q2_K': {
    url: process.env["DUST_MODEL_phi-2.Q2_K_URL"]
  }
}

export function getModelConfigServer(name: ModelName) { 
  return { ...getModelConfig(name), ...MODEL_SERVER_CONFIG[name] };
}
