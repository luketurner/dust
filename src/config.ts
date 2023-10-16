export const ROOT_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
export const HOSTNAME = (new URL(ROOT_URL)).hostname;

export const GIT_EMAIL = `git@${HOSTNAME}`
export const GIT_NAME = 'Dust';

export const SSH_KEY_PASSPHRASE = process.env.DUST_SSH_KEY_PASSPHRASE || 'foobar';