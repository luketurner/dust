'use server';

import { getServerUserOrThrow } from "@/auth";
import { prisma } from "@/db/client";
import { GitExportConfig } from "@prisma/client";

export async function upsertSingleGitExportConfig(id: string | null, data: Partial<Pick<GitExportConfig, 'branchName' | 'remoteUrl' | 'name'>>): Promise<void> {
  const { user } = await getServerUserOrThrow();
  if (id) {
    await prisma.gitExportConfig.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        name: data.name,
        remoteUrl: data.remoteUrl,
        branchName: data.branchName
      }
    });
  } else {
    await prisma.gitExportConfig.create({
      data: {
        userId: user.id,
        name: data.name ?? "",
        remoteUrl: data.remoteUrl,
        branchName: data.branchName
      }
    });
  }

}

export async function generateSSHKeys(configId: string): Promise<{ sshPublicKey: string }> {
  throw new Error('Not implemented yet!');
}