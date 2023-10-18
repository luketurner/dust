'use server';

import { getServerUserOrThrow } from "@/models/auth";
import { upsertAgendaServer } from "@/models/agenda";

/**
 * (Server Action) Creates an agenda for the day if it doesn't already exist.
 */
export async function upsertAgenda(date: string) {
  const { user } = await getServerUserOrThrow();
  await upsertAgendaServer(user.id, date);
}