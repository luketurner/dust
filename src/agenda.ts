import { prisma } from "./db/client";
import { DateTime } from "luxon";

export async function upsertAgenda(userId: string, date: string) {
  // try finding agenda first to avoid task lookup if it's not needed
  const existingAgenda = await findAgenda(userId, date);
  if (existingAgenda) { return existingAgenda; }

  const tasksForAgenda = await prisma.task.findMany({
    where: {
      userId
    },
    take: 3,
    orderBy: {
      displayOrder: 'asc'
    }
  });

  const dbDate = DateTime.fromFormat(date, 'yyyy-MM-dd').toISO();

  // Create new agenda. Use upsert just in case the agenda was created by another client since querying above.
  return await prisma.agenda.upsert({
    create: {
      userId,
      date: dbDate!,
      agendaTasks: {
        createMany: {
          data: tasksForAgenda.map(task => ({
            taskId: task.id,
            archived: false,
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

export async function findAgenda(userId: string, date: string) {
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