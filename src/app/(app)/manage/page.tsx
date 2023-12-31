import { getServerUserOrRedirect } from "@/models/auth"
import { prisma } from "@/db/client";
import ManagePageClient from "./client";

export default async function ManagePage() {
  const { user } = await getServerUserOrRedirect();

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
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
    <ManagePageClient user={user} tasks={tasks} tags={tags} />
  )
}