'use server';

import { prisma } from "@/db/client";
import { Task, Prisma } from "@prisma/client";
import { getServerUserOrThrow } from "@/auth"
import { getHighestDisplayOrder, parseTaskInput } from "@/task";

/**
 * (Server Action) Accepts an existing Task model and a set of properties to update. Performs the update and returns the updated task.
 * Throws error if the currently logged-in user does not own the task.
 */
export async function updateTask(task: Task, data: Prisma.TaskUpdateInput): Promise<Task> {
  const { user } = await getServerUserOrThrow();
  if (task.userId !== user.id) {
    throw new Error('Cannot update task.')
  }
  return await prisma.task.update({
    where: {
      id: task.id
    },
    data: {
      name: data.name
    }
  });
}

/**
 * (Server Action) Creates a new Task for the currently logged-in user with reasonable defaults. Returns the new task.
 */
export async function createTask(): Promise<Task> {
  const { user } = await getServerUserOrThrow();

  const highestDisplayOrder = await getHighestDisplayOrder(user.id);
  
  return await prisma.task.create({
    data: {
      userId: user.id,
      name: 'New task',
      displayOrder: highestDisplayOrder + 1,
    }
  });
}

export async function addTasksFromText(text: string): Promise<Task[]> {
  const { user } = await getServerUserOrThrow();

  const parsedTasks = parseTaskInput(text);

  const highestDisplayOrder = await getHighestDisplayOrder(user.id);

  const tasks: Task[] = [];

  const tasksToInsert = parsedTasks.map(({ name, tags, flags, description }, index) => ({
    name,
    userId: user.id,
    displayOrder: highestDisplayOrder + 1 + index
  }));

  // Can't use createMany because it doesn't return the created rows
  for (const data of tasksToInsert) {
    tasks.push(await prisma.task.create({ data }));
  }

  return tasks;
}