'use server';

import { prisma } from "@/db/client";
import { Task, Tag, TaskEmbedding } from "@prisma/client";
import { getServerUserOrThrow } from "@/models/auth"
import { MAX_ACTIVE_TASKS } from "@/config";
import { calculateEmbedding, findSimilarTasks as findSimilarTasksImpl, TaskWithDistance } from "@/models/task";

/**
 * (Server Action) Deletes the task, permanently and forever. Cannot be undone.
 * Does nothing if currently logged-in user doesn't own the task, or the task ID doesn't exist.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.task.delete({
    where: {
      userId: user.id,
      id: taskId
    }
  });
}

/**
 * (Server Action) Accepts an existing Task model and a set of properties to update. Performs the update.
 * Does nothing if currently logged-in user doesn't own the task, or the task ID doesn't exist.
 */
export async function updateTask(taskId: string, data: {
  name?: string
  archived?: boolean
  completed?: boolean
  tags?: string[]
  description?: string
  important?: boolean
  urgent?: boolean
  someday?: boolean
}): Promise<void> {
  const { user } = await getServerUserOrThrow();

  // TODO -- this check doesn't work very well because it doesn't know what the current values of task are
  if (data.someday && (data.important || data.urgent)) {
    throw new Error('Someday tasks cannot be important/urgent')
  }

  await prisma.task.update({
    where: {
      id: taskId,
      userId: user.id
    },
    data: {
      name: data.name,
      archived: data.archived,
      completed: data.completed,
      description: data.description,
      important: data.important,
      urgent: data.urgent,
      someday: data.someday,
      tags: (data.tags ? { set: data.tags.map(id => ({ id, userId: user.id })) } : undefined)
    }
  });
}

/**
 * (Server Action) Creates a new Task for the currently logged-in user with reasonable defaults.
 */
export async function createTask(data: {
  name?: string
  archived?: boolean
  completed?: boolean
  tags?: string[]
  description?: string
  important?: boolean
  urgent?: boolean
  someday?: boolean
}): Promise<Task & { tags: Tag[], embeddings: TaskEmbedding[] }> {
  const { user } = await getServerUserOrThrow();

  if (data.someday && (data.important || data.urgent)) {
    throw new Error('Someday tasks cannot be important/urgent')
  }

  const activeTasks = await prisma.task.count({
    where: {
      userId: user.id,
      archived: false,
      completed: false,
      someday: false
    }
  });

  if (activeTasks >= MAX_ACTIVE_TASKS) {
    throw new Error('Reached active task limit.')
  }
  
  const newTask = await prisma.task.create({
    data: {
      userId: user.id,
      name: data.name ?? 'Unnamed task',
      createdAt: new Date(),
      archived: data.archived,
      completed: data.completed,
      description: data.description,
      important: data.important,
      someday: data.someday,
      urgent: data.urgent,
      tags: (data.tags ? { connect: data.tags.map(id => ({ id, userId: user.id })) } : undefined)
    },
    include: {
      tags: true,
      embeddings: true
    }
  });

  if (user.useAI) {
    try {
      await calculateEmbedding(newTask);
    } catch (e) {
      console.error('Error calculating embedding', e);
    }
  }

  return { ...newTask };
}

export async function removeTags(taskId: string, tagIds: string[]) {
  const { user } = await getServerUserOrThrow();
  
  // Disconnect tags from task
  await prisma.task.update({
    where: {
      userId: user.id,
      id: taskId
    },
    data: {
      tags: {
        disconnect: tagIds.map((id) => ({ id }))
      }
    }
  });

  // Delete tags if not attached to any other tasks
  // not using deleteMany because then we couldn't tell which specifically were deleted.
  const deletedTagIds = [];
  for (const tagId of tagIds) {
    try {
      const { id } = await prisma.tag.delete({
        select: { id: true },
        where: {
          userId: user.id,
          id: tagId,
          tasks: { none: {} }
        }
      });
      deletedTagIds.push(id);
    } catch (error) {
      console.log("error", error);
    }
  }

  return { deletedTagIds };
}

export async function recalculateEmbeddings(): Promise<void> {
  const { user } = await getServerUserOrThrow();
  if (!user.useAI) throw new Error('Feature not enabled');

  const allTasks = await prisma.task.findMany({
    where: {
      userId: user.id
    }
  });

  for (const task of allTasks) {
    await calculateEmbedding(task);
  }
}

export async function findSimilarTasks(taskId: string, limit: number = 3): Promise<TaskWithDistance[]> {
  const { user } = await getServerUserOrThrow();
  if (!user.useAI) throw new Error('Feature not enabled');

  const task = await prisma.task.findUniqueOrThrow({
    where: {
      userId: user.id,
      id: taskId
    }
  });

  if (!task) throw new Error('Cannot find task');

  const similarTasks = await findSimilarTasksImpl(task, limit);
  return similarTasks;
}