import { getServerUserOrRedirect } from "@/auth"
import SimpleTaskList from "@/components/SimpleTaskList";
import { DateTime } from 'luxon';
import { notFound, redirect } from "next/navigation";
import { findAgendaServer, upsertAgendaServer } from "@/agenda";
import GenerateAgendaButton from "@/components/GenerateAgendaButton";
import TaskEntry from "@/components/TaskEntry";
import { addTasksFromText } from "@/actions/task";

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

  let agenda;
  if (isToday) {
    agenda = await upsertAgendaServer(user.id, canonicalDate);
  } else {
    // don't eagerly generate agendas for other days
    agenda = await findAgendaServer(user.id, canonicalDate);
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

  const tasks = agenda.agendaTasks.map(at => at.task);

  return (
    <div className="text-center">
      <h1 className="text-4xl mt-4 mb-8">{date}</h1>
      <SimpleTaskList tasks={tasks} />
      <TaskEntry onSubmit={addTasksFromText} />
    </div>
  );
}