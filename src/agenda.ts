import { Agenda } from "@prisma/client";
import { prisma } from "./db/client";
import { DateTime } from "luxon";
import { defaultAgendaRules, pickTasks } from "./agendaRules";

export async function upsertAgendaServer(userId: string, date: string) {
  // try finding agenda first to avoid task lookup if it's not needed
  const existingAgenda = await findAgendaServer(userId, date);
  if (existingAgenda) { return existingAgenda; }

  const allTasks = await prisma.task.findMany({
    where: {
      userId,
      completed: false,
      archived: false,
    },
    orderBy: {
      displayOrder: 'asc'
    },
    include: {
      tags: true
    }
  });

  const pickedTasks = pickTasks(defaultAgendaRules(), allTasks);

  const dbDate = DateTime.fromFormat(date, 'yyyy-MM-dd').toISO();

  // Create new agenda. Use upsert just in case the agenda was created by another client since querying above.
  return await prisma.agenda.upsert({
    create: {
      userId,
      date: dbDate!,
      agendaTasks: {
        createMany: {
          data: pickedTasks.map(task => ({
            taskId: task.id,
          }))
        }
      }
    },
    update: {},
    where: {
      userId_date: {
        userId,
        date: dbDate!
      }
    },
    include: {
      agendaTasks: {
        include: {
          task: true
        }
      }
    }
  });
}

export async function findAgendaServer(userId: string, date: string) {
  const dbDate = DateTime.fromFormat(date, 'yyyy-MM-dd').toISO();
  return await prisma.agenda.findUnique({
    where: {
      userId_date: {
        userId,
        date: dbDate!
      }
    },
    include: {
      agendaTasks: {
        include: {
          task: true
        }
      }
    }
  });
}
