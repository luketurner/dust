import { GitExportConfig, User } from "@prisma/client";
import { prisma } from "./db/client";
import { mkdtemp, writeFile } from "fs/promises";
import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import { join } from "path";
import { DateTime } from "luxon";
import { tmpdir } from "os";

const exec = promisify(execCb)

export async function exportUserDataToGitRemote(user: User, config: GitExportConfig) {
  // TODO -- make this configurable
  const branch = 'main';

  // TODO -- support manually specifying authorized keys?

  const tmpDir = await mkdtemp(join(tmpdir(), `git-export-${config.id}-`));
  const privateKeyFilename = join(tmpDir, 'ssh_key');
  const gitRepoDir = join(tmpDir, 'repo');
  // await mkdir(gitRepoDir);
  await exec(`git init --quiet '${gitRepoDir}'`);
  await exec(`git remote add origin '${config.remoteUrl}'`, { cwd: gitRepoDir });
  await exec(`git fetch --depth 1 origin ${branch}`, {
    cwd: gitRepoDir,
    env: {
      GIT_SSH_COMMAND: `ssh -i ${privateKeyFilename} -o IdentitiesOnly=yes`
    } as any
  });
  await exportUserDataToFile(user, join(gitRepoDir, `${user.id}_${config.id}.json`));
  await exec (`git commit -am "${DateTime.now().toISOTime()} dust export"`, { cwd: gitRepoDir });
  await exec(`git push origin ${branch}`, {
    cwd: gitRepoDir,
    env: {
      GIT_SSH_COMMAND: `ssh -i ${privateKeyFilename} -o IdentitiesOnly=yes`
    } as any
  });

}

export async function exportUserDataToJSON(user: User) {
  return {
    user: { id: user.id },
    tasks: await prisma.task.findMany({ where: { userId: user.id }, include: { tags: { select: { id: true } }}, orderBy: { id: 'asc' }}),
    tags: await prisma.tag.findMany({ where: { userId: user.id }, orderBy: { id: 'asc' }}),
    agendas: await prisma.agenda.findMany({ where: { userId: user.id }, include: { agendaTasks: true }, orderBy: { id: 'asc' }}),
    // agendaTasks: await prisma.agendaTask.findMany({ where: { task: { userId: user.id } }, orderBy: { agendaId: 'asc' }}),
  };
}

export async function exportUserDataToFile(user: User, file: string) {
  const data = JSON.stringify(await exportUserDataToJSON(user), null, 2);
  await writeFile(file, data, { encoding: 'utf8' });
}

