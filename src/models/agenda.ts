import 'server-only';
import { Agenda, AgendaTask } from "@prisma/client";
import { prisma } from "../db/client";
import { DateTime } from "luxon";
import { TaskWithTags, pickTasks } from "./task";

export type AgendaTaskWithTags = (AgendaTask & { task: TaskWithTags })

export type AgendaWithIncludes = (Agenda & { agendaTasks: AgendaTaskWithTags[] })

/**
 * Picks num tasks and adds them to the agenda.
 */
export async function addTasksToAgenda(agenda: Agenda, num?: number) {
  const allTasks = await prisma.task.findMany({
    where: {
      userId: agenda.userId,
      completed: false,
      archived: false,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      tags: true
    }
  });

  const pickedTasks = pickTasks(allTasks, { limit: num ?? 1 });

  await prisma.agendaTask.createMany({
    data: pickedTasks.map((task) => ({
      agendaId: agenda.id,
      taskId: task.id
    }))
  });

  // TODO -- probably more efficient way to do this without querying for everything again.
  const updatedAgenda = await findAgendaServer(agenda.userId, agenda.date);
  return updatedAgenda;

}

/**
 * Returns the agenda for the user at the given date. If there isn't an existing
 * agenda, a new one will be created.
 */
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
      createdAt: 'desc'
    },
    include: {
      tags: true
    }
  });

  const pickedTasks = pickTasks(allTasks, { limit: 3 });

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
          task: {
            include: {
              tags: true
            }
          }
        }
      }
    }
  });
}

/**
 * Returns the agenda for the user at given date, if there is one.
 */
export async function findAgendaServer(userId: string, date: string | Date) {
  const dbDate = (typeof date === 'string' ? DateTime.fromFormat(date, 'yyyy-MM-dd') : DateTime.fromJSDate(date)).toISO();
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
          task: {
            include: {
              tags: true
            }
          }
        }
      }
    }
  });
}
