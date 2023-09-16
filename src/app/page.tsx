import { config } from "@/auth"
import { prisma } from "@/db/client";
import { getServerSession } from "next-auth/next";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";

export default async function IndexPage() {
  const session = await getServerSession(config);

  if (!session?.user?.email) {
    return (
      <main className="text-center">
        <h1 className="text-4xl mt-4 mb-8">DUST</h1>
        <p className="mb-8">
          Dust is a task management app.
        </p>
        <div>
          <LoginButton />
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user?.email
    },
    include: {
      tasks: true
    }
  });

  return (
    <main className="text-center">
      <h1 className="text-4xl mt-4 mb-8">DUST</h1>
      <p className="mb-8">
        Hey, you're logged in! Noice.
      </p>
      <ul>
        {user.tasks.map(task => 
          <li>{task.name}</li>  
        )}
      </ul>
      <LogoutButton />
    </main>
  )
}