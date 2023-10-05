'use server';

import { ClientGitExportConfig } from "@/app/(app)/settings/client";
import { getServerUserOrThrow } from "@/auth";
import { prisma } from "@/db/client";
import { exportUserDataToGitRemote } from "@/export";
import { generateDeployKeys } from "@/git";
import { GitExportConfig } from "@prisma/client";

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
  if (data.sshPrivateKey) {
    delete data.sshPrivateKey;
    data.hasPrivateKey = true;
  }
  return data;
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

export async function testGitExportConfig(configId: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  try {
    const config = await prisma.gitExportConfig.findFirstOrThrow({
      where: { id: configId, userId: user.id }
    });

    await exportUserDataToGitRemote(user, config);

  } catch (e) {
    console.error('testGitExportConfig error', e, user.id);
    throw new Error('Error exporting to Git.');
  }
}