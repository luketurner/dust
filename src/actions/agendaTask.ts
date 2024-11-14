'use server';

import { addTasksToAgenda } from "@/models/agenda";
import { getServerUserOrThrow } from "@/models/auth";
import { prisma } from "@/db/client";


/**
 * (Server Action) Updates one or more properties on an AgendaTask.
 */
export async function updateAgendaTask(agendaId: string, taskId: string, data: {
  deferred?: boolean
}) {
  const { user } = await getServerUserOrThrow();
  await prisma.agendaTask.update({
    where: {
      agendaId_taskId: {
        agendaId,
        taskId
      },
      agenda: {
        userId: user.id
      }
    },
    data: {
      deferred: data.deferred
    }
  });
}

/**
 * (Server Action) Adds some tasks to an agenda.
 */
export async function addAgendaTasks(agendaId: string, num: number = 1) {
  const { user } = await getServerUserOrThrow();
  const agenda = await prisma.agenda.findUniqueOrThrow({
    where: {
      id: agendaId,
      userId: user.id,
    }
  })
  return await addTasksToAgenda(agenda, num);
}