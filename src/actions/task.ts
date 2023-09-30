'use server';

import { prisma } from "@/db/client";
import { Task, Prisma, Tag } from "@prisma/client";
import { getServerUserOrThrow } from "@/auth"
import { getHighestDisplayOrderServer, parseTaskInput } from "@/task";
import { NotFoundError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";

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
}): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.task.update({
    where: {
      id: taskId,
      userId: user.id
    },
    data: {
      name: data.name,
      archived: data.archived,
      completed: data.completed,
      tags: (data.tags ? { connect: data.tags.map(id => ({ id, userId: user.id })) } : undefined)
    }
  });
}

/**
 * (Server Action) Creates a new Task for the currently logged-in user with reasonable defaults.
 */
export async function createTask(): Promise<void> {
  const { user } = await getServerUserOrThrow();

  const highestDisplayOrder = await getHighestDisplayOrderServer(user.id);
  
  await prisma.task.create({
    data: {
      userId: user.id,
      name: 'New task',
      displayOrder: highestDisplayOrder + 1,
    }
  });
}

/**
 * (Server Action) Accepts a string containing 0+ task declarations, and creates tasks for each of them.
 */
export async function addTasksFromText(text: string): Promise<(Task & { tags: Tag[] })[]> {
  const { user } = await getServerUserOrThrow();

  const parsedTasks = parseTaskInput(text);

  const highestDisplayOrder = await getHighestDisplayOrderServer(user.id);

  const tasksToInsert = parsedTasks.map(({ name, tags, description }, index) => ({
    name,
    userId: user.id,
    displayOrder: highestDisplayOrder + 1 + index,
    description,
    tags: {
      connectOrCreate: (tags ?? []).map(tag => ({
        create: {
          userId: user.id,
          name: tag
        },
        where: {
          userId_name: {
            userId: user.id,
            name: tag
          }
        }
      }))
    }
  }));

  const tasks = [];
  // Can't use createMany because it doesn't return the created rows
  for (const data of tasksToInsert) {
    tasks.push(await prisma.task.create({ data, include: { tags: true } }));
  }
  return tasks;
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