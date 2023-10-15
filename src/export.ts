import { GitExportAttempt, GitExportConfig, User } from "@prisma/client";
import { prisma } from "./db/client";
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises";
import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import { join } from "path";
import { DateTime } from "luxon";
import { tmpdir } from "os";

const exec = promisify(execCb)

export async function exportAll() {
  const configs = await prisma.gitExportConfig.findMany({});

  for (const config of configs) {
    await exportConfig(config);
  }
}

export async function exportConfig(config: GitExportConfig): Promise<GitExportAttempt> {

  const recentAttempts = await prisma.gitExportAttempt.count({
    where: { userId: config.userId, startedAt: { gte: DateTime.now().minus({ minutes: 10 }).toJSDate() } },
  });

  if (recentAttempts >= 10) {
    console.error('rate-limited git export request');
    throw new Error('Rate-limiting Git export. Please don\'t send more than ~1 request per minute.')
  }

  const attempt = await prisma.gitExportAttempt.create({
    data: {
      userId: config.userId,
      configId: config.id,
      status: 'running',
      result: '',
      finishedAt: null,
      startedAt: new Date()
    }
  });

  try {
    const result = await exportUserDataToGitRemote(config);
    return await prisma.gitExportAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'succeeded',
        result: result.hasChanges ? `SHA: ${result.commitSha}` : 'Nothing to commit',
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
    console.error('exportConfig error', e, failedAttempt);
    return failedAttempt;
  }
}

export type GitExportResult = { hasChanges: true; commitSha: string; } | { hasChanges: false; }

async function exportUserDataToGitRemote(config: GitExportConfig): Promise<GitExportResult> {
  // TODO -- support manually specifying authorized keys?

  const tmpDir = await mkdtemp(join(tmpdir(), `git-export-${config.id}-`));
  const privateKeyFilename = join(tmpDir, 'ssh_key');
  const gitRepoDir = join(tmpDir, 'repo');
  await writeFile(privateKeyFilename, Buffer.from(config.sshPrivateKey!, 'base64'))
  await mkdir(gitRepoDir);
  await exec(`git init --quiet "${gitRepoDir}"`);
  await exec(`git remote add origin "${config.remoteUrl}"`, { cwd: gitRepoDir });
  await exec(`git fetch --depth 1 origin "${config.branchName}"`, {
    cwd: gitRepoDir,
    env: {
      GIT_SSH_COMMAND: `ssh -i "${privateKeyFilename}" -o IdentitiesOnly=yes`
    } as any
  });
  await exec(`git checkout "${config.branchName}"`, { cwd: gitRepoDir });
  const userDataFilename = `${config.userId}_${config.id}.json`;
  await exportUserDataToFile(config.userId, join(gitRepoDir, userDataFilename));
  const { stdout: diffOutput } = await exec(`git diff --name-only`, { cwd: gitRepoDir });
  if (diffOutput.trim() === "") {
    return { hasChanges: false };
  }
  await exec(`git add "${userDataFilename}"`, { cwd: gitRepoDir });
  await exec(`git commit -m "${DateTime.now().toISOTime()} dust export"`, { cwd: gitRepoDir });
  const { stdout: commitSha } = await exec(`git rev-parse HEAD`, { cwd: gitRepoDir });
  await exec(`git push origin "${config.branchName}"`, {
    cwd: gitRepoDir,
    env: {
      GIT_SSH_COMMAND: `ssh -i "${privateKeyFilename}" -o IdentitiesOnly=yes`
    } as any
  });
  return { hasChanges: true, commitSha };

}

async function exportUserDataToJSON(userId: string) {
  return {
    user: { id: userId },
    tasks: await prisma.task.findMany({ where: { userId }, include: { tags: { select: { id: true } }}, orderBy: { id: 'asc' }}),
    tags: await prisma.tag.findMany({ where: { userId }, orderBy: { id: 'asc' }}),
    agendas: await prisma.agenda.findMany({ where: { userId }, include: { agendaTasks: true }, orderBy: { id: 'asc' }}),
    // agendaTasks: await prisma.agendaTask.findMany({ where: { task: { userId: user.id } }, orderBy: { agendaId: 'asc' }}),
  };
}

async function exportUserDataToFile(userId: string, file: string) {
  const data = JSON.stringify(await exportUserDataToJSON(userId), null, 2);
  await writeFile(file, data, { encoding: 'utf8' });
}

