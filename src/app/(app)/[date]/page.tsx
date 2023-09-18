import { getServerUserOrRedirect } from "@/auth"
import SimpleTaskList from "@/components/SimpleTaskList";
import { DateTime, Duration } from 'luxon';
import { notFound, redirect } from "next/navigation";
import { findAgendaServer, upsertAgendaServer } from "@/agenda";
import GenerateAgendaButton from "@/components/GenerateAgendaButton";
import TaskEntry from "@/components/TaskEntry";
import { addTasksFromText } from "@/actions/task";
import Link from "next/link";

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

  const dayBefore = parsedDate.minus({ days: 1 }).toISODate();
  const dayAfter = parsedDate.plus({ days: 1 }).toISODate();

  let agenda;
  if (isToday) {
    agenda = await upsertAgendaServer(user.id, canonicalDate);
  } else {
    // don't eagerly generate agendas for other days
    agenda = await findAgendaServer(user.id, canonicalDate);
  }

  const tasks = agenda?.agendaTasks?.map(at => at.task);

  return (
    <div className="flex flex-col flex-nowrap items-center">
      <div className="mt-4 flex flex-row flex-nowrap items-center justify-center">
        <Link className="mx-2 text-xl" href={`/${dayBefore}`}>&lt;&lt;</Link>
        <h1 className="text-4xl">{date}</h1>
        <Link className="mx-2 text-xl" href={`/${dayAfter}`}>&gt;&gt;</Link>
      </div>
      {!isToday && (
        <Link className="m-2 text-xl p-2 rounded bg-slate-200 w-64 mt-4 block text-center" href={`/today`}>Back to Today</Link>
      )}
      <div className="mt-8">
        {agenda ? (
          (tasks && tasks.length !== 0) ? (
            <SimpleTaskList tasks={tasks} />
          ) : (
            <p>No tasks for {canonicalDate}!</p>
          )
        ) : (
          <>
            <p>There is no agenda for this date. Create one?</p>
            <GenerateAgendaButton date={date} />
          </>
        )}
      </div>
      <TaskEntry onSubmit={addTasksFromText} />
    </div>
  );
}