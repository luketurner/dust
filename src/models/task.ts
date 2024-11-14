import 'server-only';
import { Tag, Task } from "@prisma/client";
import shuffle from "lodash.shuffle";
import { prisma } from '@/db/client';
import { ModelName } from '@/config';
import { getModelConfigServer } from '@/serverConfig';

export type TaskWithTags = Task & { tags: Tag[] };

export interface TaskWithDistance {
  task: Task;
  distance: number;
}

export interface PickTaskOptions {
  limit: number
}

export type PickTaskScore = -1 | 0 | 1 | 2 | 3;

/**
 * Picks some tasks according to a semi-intelligent "score",
 * which is calculated based on the task's important, urgent, and someday properties.
 */
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

/**
 * Sends data about the task to an LLM to calculate embeddings, and saves
 * the embedding into the DB.
 */
export async function calculateEmbedding(task: Task, model: ModelName): Promise<void> {
  console.log(`Calculating embedding for task ${task.id} (user ${task.userId})`);

  const config = await getModelConfigServer(model);

  if (!config?.url) throw new Error('Model not set up');

  const embeddingVector = (await (await fetch(new URL('/embedding', config.url), {
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
    VALUES (${task.id}, ${model}, ${stringifiedVector}::vector)
    ON CONFLICT ("taskId", version) DO UPDATE SET vector = ${stringifiedVector}::vector
  `;
}

/**
 * Returns a list of tasks "similar" to the given task based on the distance between their
 * embedding vectors.
 */
export async function findSimilarTasks(task: Task, model: ModelName, limit: number = 3): Promise<TaskWithDistance[]> {
  const embedding = await prisma.taskEmbedding.findUnique({
    where: {
      taskId_version: {
        taskId: task.id,
        version: model
      }
    },
    select: {
      taskId: true,
    }
  });
  if (!embedding) return [];

  const similarTasks = await prisma.$queryRaw<(Task & { distance: string })[]>`
    SELECT t.*, te.vector <-> (SELECT vector FROM "TaskEmbedding" WHERE "taskId" = ${task.id}) as distance FROM "TaskEmbedding" AS te
    JOIN "Task" AS t ON (t.id = te."taskId")
    WHERE
      te."taskId" != ${task.id}
      AND te.version = ${model}
      AND t."userId" = ${task.userId}
    ORDER BY te.vector <-> (SELECT vector FROM "TaskEmbedding" WHERE "taskId" = ${task.id})
    LIMIT ${limit};
  `;
  return similarTasks.map(({ distance, ...task }) => ({ task, distance: Number(distance) }));
}