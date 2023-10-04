'use server';

import { getServerUserOrThrow } from "@/auth";
import { prisma } from "@/db/client";
import { GitExportConfig } from "@prisma/client";

export async function createGitExportConfig(): Promise<GitExportConfig> {
  const { user } = await getServerUserOrThrow();
  return await prisma.gitExportConfig.create({
    data: {
      userId: user.id,
      name: "Unnamed export config"
    }
  });
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

export async function generateSSHKeys(configId: string): Promise<{ sshPublicKey: string }> {
  throw new Error('Not implemented yet!');
}