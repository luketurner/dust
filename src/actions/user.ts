'use server';

import { prisma } from "@/db/client";
import { getServerUserOrThrow } from "@/models/auth";

export async function setUserTimezone(zone: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: zone }
  });
}