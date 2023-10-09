import { GitExportConfig, User } from "@prisma/client";
import { prisma } from "./db/client";
import { mkdtemp, readFile, writeFile } from "fs/promises";
import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import { join } from "path";
import { DateTime } from "luxon";
import { tmpdir } from "os";
import { ClientGitExportConfig } from "./app/(app)/settings/client";

const exec = promisify(execCb)

export async function generateDeployKeys(): Promise<Pick<GitExportConfig, 'sshPrivateKey' | 'sshPublicKey'>> {
  const tmpDir = await mkdtemp(join(tmpdir(), `generate-deploy-keys-`));
  const privateKeyFilename = join(tmpDir, 'id_rsa');
  const publicKeyFilename = join(tmpDir, 'id_rsa.pub');

  try {
    await exec(`/usr/bin/git --help`);
  } catch (e) {
    console.log("git help error", e)
  }

  try {
    await exec(`/usr/bin/ssh --help`);
  } catch (e) {
    console.log("ssh help error", e)
  }

  // TODO -- hardcoded domain
  await exec(`/usr/bin/ssh-keygen -q -t ed25519 -C "gitexport@dust.luketurner.org" -N "" -f "${privateKeyFilename}"`);

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