import 'server-only';
import { Tag, Task, TaskEmbedding } from "@prisma/client";
import shuffle from "lodash.shuffle";
import { prisma } from '@/db/client';
import { EMBEDDING_VERSION, LLM_SERVER } from '@/serverConfig';

export type TaskWithTags = Task & { tags: Tag[] };


export interface PickTaskOptions {
  limit: number
}

export type PickTaskScore = -1 | 0 | 1 | 2 | 3;

export function pickTasks(tasks: Task[], rules: PickTaskOptions): Task[] {
  const scores: Record<PickTaskScore, Task[]> = { [-1]: [], [0]: [], [1]: [], [2]: [], [3]: [] };
  for (const task of tasks) {
    const score: PickTaskScore
      = (task.important ? 1 : 0)
      + (task.urgent ? 2 : 0)
      + (task.someday ? -1 : 0) as PickTaskScore;
    scores[score].push(task);
  }

  const sortedTasks = shuffle(scores[3]).concat(shuffle(scores[2]), shuffle(scores[1]), shuffle(scores[0]), shuffle(scores[-1]));
  return sortedTasks.slice(0, rules.limit);
}

export async function calculateEmbedding(task: Task): Promise<void> {
  console.log(`Calculating embedding for task ${task.id} (user ${task.userId})`);
  if (!LLM_SERVER) {
    console.warn('Could not calculate embedding; LLM_SERVER not set.')
    return;
  }

  const embeddingVector = (await (await fetch(new URL('/embedding', LLM_SERVER), {
    method: 'POST',
    body: JSON.stringify({
      content: task.name
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })).json())?.embedding;

  const stringifiedVector = JSON.stringify(embeddingVector);

  await prisma.$executeRaw`
    INSERT INTO "TaskEmbedding" ("taskId", version, vector)
    VALUES (${task.id}, ${EMBEDDING_VERSION}, ${stringifiedVector}::vector)
    ON CONFLICT ("taskId", version) DO UPDATE SET vector = ${stringifiedVector}::vector
  `;
}