import { getServerUserOrRedirect } from "@/auth"
import { prisma } from "@/db/client";
import SimpleTaskList from "@/components/SimpleTaskList";
import { DateTime } from 'luxon';
import { notFound, redirect } from "next/navigation";
import { Agenda } from "@prisma/client";
import { findAgenda, upsertAgenda } from "@/agenda";
import { upsertAgendaAction } from "@/actions/agenda";
import GenerateAgendaButton from "@/components/GenerateAgendaButton";

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

  const canonicalDate = parsedDate.toISODate();

  if (!canonicalDate) { return notFound(); }

  const isToday = canonicalDate === today.toISODate();
  if (isToday && date !== 'today') { return redirect('/today'); }

  let agenda: Agenda | null;
  if (isToday) {
    agenda = await upsertAgenda(user.id, canonicalDate);
  } else {
    // don't eagerly generate agendas for other days
    agenda = await findAgenda(user.id, canonicalDate);
  }

  if (!agenda) {
    return (
      <div className="text-center">
        <h1 className="text-4xl mt-4 mb-8">{date}</h1>
        <p>There is no agenda for this date. Create one?</p>
        <GenerateAgendaButton date={date} />
      </div>
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
    <div className="text-center">
      <h1 className="text-4xl mt-4 mb-8">{date}</h1>
      <SimpleTaskList tasks={tasks} />
    </div>
  );
}