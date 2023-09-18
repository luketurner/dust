'use server';

import { prisma } from "@/db/client";
import { Task, Prisma } from "@prisma/client";
import { getServerUserOrThrow } from "@/auth"
import { getHighestDisplayOrderServer, parseTaskInput } from "@/task";

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
}): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.task.update({
    where: {
      id: taskId,
      userId: user.id
    },
    data: {
      name: data.name,
      archived: data.archived
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
export async function addTasksFromText(text: string): Promise<void> {
  const { user } = await getServerUserOrThrow();

  const parsedTasks = parseTaskInput(text);

  const highestDisplayOrder = await getHighestDisplayOrderServer(user.id);

  const tasksToInsert = parsedTasks.map(({ name, tags, flags, description }, index) => ({
    name,
    userId: user.id,
    displayOrder: highestDisplayOrder + 1 + index
  }));

  // Can't use createMany because it doesn't return the created rows
  for (const data of tasksToInsert) {
    await prisma.task.create({ data });
  }
}