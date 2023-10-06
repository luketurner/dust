'use server';

import { ClientGitExportConfig } from "@/app/(app)/settings/client";
import { getServerUserOrThrow } from "@/auth";
import { prisma } from "@/db/client";
import { exportUserDataToGitRemote } from "@/export";
import { generateDeployKeys } from "@/git";
import { GitExportAttempt, GitExportConfig } from "@prisma/client";
import { DateTime } from "luxon";

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

export async function testGitExportConfig(configId: string): Promise<GitExportAttempt> {
  const { user } = await getServerUserOrThrow();

  const config = await prisma.gitExportConfig.findFirstOrThrow({
    where: { id: configId, userId: user.id }
  });

  const recentAttempts = await prisma.gitExportAttempt.count({
    where: { userId: user.id, startedAt: { gte: DateTime.now().minus({ minutes: 10 }).toJSDate() } },
  });

  if (recentAttempts >= 10) {
    console.error('rate-limited git export request');
    throw new Error('Rate-limiting Git export. Please don\'t send more than ~1 request per minute.')
  }

  const attempt = await prisma.gitExportAttempt.create({
    data: {
      userId: user.id,
      configId: config.id,
      status: 'running',
      result: '',
      finishedAt: null,
      startedAt: new Date()
    }
  });

  try {
    await exportUserDataToGitRemote(user, config);
    return await prisma.gitExportAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'succeeded',
        result: '', // TODO -- SHA?
        finishedAt: new Date(),
      }
    });
  } catch (e) {
    const failedAttempt = await prisma.gitExportAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'failed',
        result: 'Error exporting to Git.', // TODO
        finishedAt: new Date(),
      }
    })
    console.error('testGitExportConfig error', e, failedAttempt);
    return failedAttempt;
  }
}