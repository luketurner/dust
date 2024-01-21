import 'server-only';

export const SSH_KEY_PASSPHRASE = process.env.DUST_SSH_KEY_PASSPHRASE || 'foobar';

export const LLM_SERVER = process.env.DUST_LLM_SERVER;
export const LLM_VERSION = process.env.DUST_LLM_VERSION || 'test';
export const EMBEDDING_VERSION = process.env.DUST_LLM_VERSION || 'test';