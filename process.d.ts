declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    DUST_SSH_KEY_PASSPHRASE: string
    DUST_LLM_SERVER: string
  }
}
