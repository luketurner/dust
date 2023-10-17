import { Tag, Task } from "@prisma/client"
import shuffle from "lodash.shuffle";

export interface PickTaskOptions {
  limit: number
}

type Score = -1 | 0 | 1 | 2 | 3;

export function pickTasks(tasks: Task[], rules: PickTaskOptions): Task[] {
  const scores: Record<Score, Task[]> = { [-1]: [], [0]: [], [1]: [], [2]: [], [3]: [] };
  for (const task of tasks) {
    const score: Score
      = (task.important ? 1 : 0)
      + (task.urgent ? 2 : 0)
      + (task.someday ? -1 : 0) as Score;
    scores[score].push(task);
  }

  const sortedTasks = shuffle(scores[3]).concat(shuffle(scores[2]), shuffle(scores[1]), shuffle(scores[0]), shuffle(scores[-1]));
  return sortedTasks.slice(0, rules.limit);
}