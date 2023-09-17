import { getServerUser } from "@/auth"
import { prisma } from "@/db/client";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import SimpleTaskList from "@/components/SimpleTaskList";
import Link from "next/link";

export default async function IndexPage() {
  const { user, session } = await getServerUser();

  if (!user) {
    return (
      <main className="text-center">
        <h1 className="text-4xl mt-4 mb-8">DUST</h1>
        <p className="mb-8">
          Task management for people that don't like tasks.
        </p>
        <div>
          <LoginButton />
        </div>
      </main>
    );
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id
    },
    take: 3,
    orderBy: {
      displayOrder: 'asc'
    }
  });

  return (
    <main className="text-center">
      <h1 className="text-4xl mt-4 mb-8">Today</h1>
      <SimpleTaskList tasks={tasks} />
      <Link href="/manage" className="p-2 rounded bg-red-200">
        Manage tasks
      </Link>
      <LogoutButton />
    </main>
  )
}