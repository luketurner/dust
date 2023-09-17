'use server';

import { prisma } from "@/db/client";
import { Task, Prisma, User } from "@prisma/client";
import { config, getServerUserOrThrow } from "@/auth"
import { getServerSession } from "next-auth/next";

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

  const highestDisplayOrder = (await prisma.task.findFirst({
    where: {
      userId: user.id
    },
    orderBy: {
      displayOrder: 'desc'
    },
    select: {
      displayOrder: true
    }
  }))?.displayOrder ?? 0;
  
  return await prisma.task.create({
    data: {
      userId: user.id,
      name: 'New task',
      displayOrder: highestDisplayOrder + 1,
    }
  });
}