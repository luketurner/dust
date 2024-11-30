'use server';

import { prisma } from "@/db/client";
import { getServerUserOrThrow } from "@/models/auth";
import { AIConfig } from "@/models/userClient";

/**
 * (Server Action) Updates the currently-logged-in user's timezone.
 */
export async function setUserTimezone(zone: string): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: zone }
  });
}

/**
 * (Server Action) Updates the currently-logged-in user's AI config.
 */
export async function setUserAiConfig(aiConfig: AIConfig): Promise<void> {
  const { user } = await getServerUserOrThrow();
  await prisma.user.update({
    where: { id: user.id },
    data: { aiConfig: aiConfig as Record<string, any> }
  });
}

/**
 * (Server Action) Permanently and irrevocably deletes a user's data.
 */
export async function deleteUserData(): Promise<void> {
  const { user } = await getServerUserOrThrow();
  // Note -- because we have cascading deletion on foreign keys everywhere,
  // just deleting the user is enough to also delete tasks, agendas, accounts, etc.
  console.log(`Deleting user: ${user.id}`);
  await prisma.user.delete({ where: { id: user.id }});
}