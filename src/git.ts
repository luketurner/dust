import { GitExportConfig } from "@prisma/client";
import { mkdtemp, readFile } from "fs/promises";
import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import { join } from "path";
import { tmpdir } from "os";
import { ClientGitExportConfig } from "./app/(app)/settings/client";
import { GIT_EMAIL, SSH_KEY_PASSPHRASE } from "./config";

const exec = promisify(execCb)

export async function generateDeployKeys(): Promise<Pick<GitExportConfig, 'sshPrivateKey' | 'sshPublicKey'>> {
  const tmpDir = await mkdtemp(join(tmpdir(), `generate-deploy-keys-`));
  const privateKeyFilename = join(tmpDir, 'id_rsa');
  const publicKeyFilename = join(tmpDir, 'id_rsa.pub');

  await exec(`ssh-keygen -q -t ed25519 -C "${GIT_EMAIL}" -N "${SSH_KEY_PASSPHRASE}" -f "${privateKeyFilename}"`);

  return {
    sshPrivateKey: (await readFile(privateKeyFilename)).toString('base64'),
    sshPublicKey: (await readFile(publicKeyFilename, { encoding: 'utf8' })),
  }
}

export function gitConfigForClient(serverConfig: GitExportConfig): ClientGitExportConfig {
  const clientConfig: ClientGitExportConfig = {
    ...serverConfig,
    hasPrivateKey: !!serverConfig.sshPrivateKey,
  };

  delete (clientConfig as any).sshPrivateKey;

  return clientConfig;
}