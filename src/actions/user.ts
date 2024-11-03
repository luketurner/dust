'use server';

import { prisma } from "@/db/client";
import { getServerUserOrThrow } from "@/models/auth";
import { AIConfig } from "@/models/userClient";

export async function setUserTimezone(zone: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: zone }
  });
}

export async function setUserAiConfig(aiConfig: AIConfig): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.user.update({
    where: { id: user.id },
    data: { aiConfig: aiConfig as Record<string, any> }
  });
}