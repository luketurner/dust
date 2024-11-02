declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    DUST_SSH_KEY_PASSPHRASE: string
    "DUST_MODEL_phi-2.Q2_K_URL": string
  }
}
