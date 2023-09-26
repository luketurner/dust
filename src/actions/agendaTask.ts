'use server';

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