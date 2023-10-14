'use server';

import { addTasksToAgenda } from "@/agenda";
import { getServerUserOrThrow } from "@/auth";
import { prisma } from "@/db/client";


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