import { getServerUserOrRedirect, getServerUserOrThrow } from "@/auth"
import TaskList from "@/components/TaskList";
import { prisma } from "@/db/client";
import Link from "next/link";
import { NextRequest } from "next/server";

export default async function ManagePage() {
  const { user } = await getServerUserOrRedirect();

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });

  return (
    <main className="text-center">
      <h1 className="text-4xl mt-4 mb-8">Manage tasks</h1>
      <TaskList tasks={tasks} />
    </main>
  )
}