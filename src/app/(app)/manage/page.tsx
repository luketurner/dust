import { getServerUserOrRedirect } from "@/auth"
import TaskManager from "@/components/TaskManager";
import { prisma } from "@/db/client";

export default async function ManagePage() {
  const { user } = await getServerUserOrRedirect();

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      displayOrder: 'asc'
    },
    include: {
      tags: true
    }
  });

  const tags = await prisma.tag.findMany({
    where: {
      userId: user.id
    }
  });

  return (
    <TaskManager tasks={tasks} tags={tags} />
  )
}