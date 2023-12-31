'use server';

import { getServerUserOrThrow } from "@/models/auth";
import { prisma } from "@/db/client";
import { generateDeployKeys, gitConfigForClient, ClientGitExportConfig, exportConfig } from "@/models/gitExportConfig";
import { GitExportAttempt, GitExportConfig } from "@prisma/client";

export async function createGitExportConfig(): Promise<ClientGitExportConfig> {
  const { user } = await getServerUserOrThrow();
  let sshPrivateKey, sshPublicKey
  try {
    ({ sshPrivateKey, sshPublicKey } = await generateDeployKeys());
  } catch (e) {
    console.error('SSH keygen error', e, user.id);
    throw new Error('Error generating deploy keys.');
  }
  const data = await prisma.gitExportConfig.create({
    data: {
      userId: user.id,
      name: "Unnamed export config",
      sshPrivateKey,
      sshPublicKey
    }
  });
  return gitConfigForClient(data);
}

export async function updateGitExportConfig(configId: string, data: Partial<GitExportConfig>): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.gitExportConfig.update({
    where: {
      id: configId,
      userId: user.id
    },
    data: {
      name: data.name,
      branchName: data.branchName,
      remoteUrl: data.remoteUrl,
    }
  });
}

export async function removeGitExportConfig(configId: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.gitExportConfig.delete({
    where: {
      id: configId,
      userId: user.id
    }
  });
}

export async function testGitExportConfig(configId: string): Promise<GitExportAttempt> {
  const { user } = await getServerUserOrThrow();

  const config = await prisma.gitExportConfig.findFirstOrThrow({
    where: { id: configId, userId: user.id }
  });

  return await exportConfig(config);
}

export async function saveAndTestGitExportConfig(configId: string, data: Partial<GitExportConfig>): Promise<GitExportAttempt> {
  await getServerUserOrThrow();

  await updateGitExportConfig(configId, data);

  return await testGitExportConfig(configId);
}