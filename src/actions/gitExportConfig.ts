'use server';

import { getServerUserOrThrow } from "@/models/auth";
import { prisma } from "@/db/client";
import { generateDeployKeys, gitConfigForClient, ClientGitExportConfig, exportConfig } from "@/models/gitExportConfig";
import { GitExportAttempt, GitExportConfig } from "@prisma/client";

/**
 * (Server Action) Creates a new GitExportConfig for the user.
 */
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

/**
 * (Server Action) Updates a GitExportConfig
 */
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

/**
 * (Server Action) Deletes a GitExportConfig
 */
export async function removeGitExportConfig(configId: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.gitExportConfig.delete({
    where: {
      id: configId,
      userId: user.id
    }
  });
}

/**
 * (Server Action) Exports user data to the given GitExportConfig for testing purposes.
 */
export async function testGitExportConfig(configId: string): Promise<GitExportAttempt> {
  const { user } = await getServerUserOrThrow();

  const config = await prisma.gitExportConfig.findFirstOrThrow({
    where: { id: configId, userId: user.id }
  });

  return await exportConfig(config);
}

/**
 * (Server Action) Updates the GitExportConfig with new data and then does a test export.
 * Recommended to use this from the frontend instead of calling testGitExportConfig directly,
 * to avoid testing with desynced settings.
 */
export async function saveAndTestGitExportConfig(configId: string, data: Partial<GitExportConfig>): Promise<GitExportAttempt> {
  await getServerUserOrThrow();

  await updateGitExportConfig(configId, data);

  return await testGitExportConfig(configId);
}