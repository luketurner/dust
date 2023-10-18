'use server';

import { getServerUserOrThrow } from "@/models/auth";
import { prisma } from "@/db/client";
import { Tag } from "@prisma/client";

export async function deleteTag(id: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.tag.delete({
    where: {
      userId: user.id,
      id
    }
  });
}

export async function updateTag(id: string, data: {
  name?: string
}): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.tag.update({
    where: {
      id,
      userId: user.id
    },
    data: {
      name: data.name,
    }
  });
}

export async function createTag(data: {
  name?: string;
}): Promise<Tag> {
  const { user } = await getServerUserOrThrow();
  
  return await prisma.tag.create({
    data: {
      userId: user.id,
      name: data.name ?? 'Unnamed tag',
    }
  });
}