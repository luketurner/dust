import { Tag, Task } from "@prisma/client"

export interface AgendaRules {
  max?: number
  skip?: string[]
  take: {
    tags?: string[]
    skip?: string[]
  }[]
}

export function defaultAgendaRules(): AgendaRules {
  return {
    max: 3,
    take: [
      { tags: ['important', 'urgent'] },
      { tags: ['urgent'] },
      { tags: ['important'] },
      { skip: ['someday', 'maybe'] },
      { tags: ['someday', 'maybe'] }
    ],
    skip: ['waiting', 'blocked', 'declined']
  }
}

/**
 * Applies the user's agenda rules in order to configure the agenda.
 * Expects tasks to have tags included.
 */
export function pickTasks(rules: AgendaRules, tasks: (Task & { tags: Tag[] })[]): Task[] {
  let picked: Task[] = [];
  let numToTake = rules.max ?? Infinity;
  for (const take of rules.take) {
    if (numToTake < 1) break;
    const candidates = tasks.filter((task) => {
      for (const skip of (rules.skip ?? []).concat(take.skip ?? [])) {
        if (task.tags.find(t => t.id === skip)) return false;
      }
      for (const tag of take.tags ?? []) {
        if (!task.tags.find(t => t.id === tag)) return false;
      }
      return true;
    });
    const taken = candidates.slice(0, numToTake);
    picked = picked.concat(taken);
    numToTake -= taken.length;
  }
  return picked;
}