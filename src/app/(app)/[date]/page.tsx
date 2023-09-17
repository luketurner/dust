import { getServerUserOrRedirect } from "@/auth"
import { prisma } from "@/db/client";
import SimpleTaskList from "@/components/SimpleTaskList";
import { DateTime } from 'luxon';
import { notFound, redirect } from "next/navigation";

interface AgendaPageProps {
  params: { date: string }
}

export default async function AgendaPage({ params: { date } }: AgendaPageProps) {
  const { user } = await getServerUserOrRedirect();

  let today = DateTime.now();

  let parsedDate: DateTime;
  if (date === 'today') {
    parsedDate = today;
  } else {
    parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd');
  }

  if (!parsedDate.isValid) { return notFound(); }
  if (parsedDate.toISODate() === today.toISODate() && date !== 'today') { return redirect('/today'); }


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
      <h1 className="text-4xl mt-4 mb-8">{date}</h1>
      <SimpleTaskList tasks={tasks} />
    </main>
  )
}