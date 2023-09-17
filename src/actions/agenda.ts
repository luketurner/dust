'use server';

import { getServerUserOrThrow } from "@/auth";
import { upsertAgenda } from "@/agenda";

export async function upsertAgendaAction(date: string) {
  const { user } = await getServerUserOrThrow();
  return await upsertAgenda(user.id, date);
}