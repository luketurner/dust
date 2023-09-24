'use client';

import { upsertAgenda } from "@/actions/agenda";
import { addTasksFromText } from "@/actions/task";
import SimpleTaskList from "@/components/SimpleTaskList";
import TaskEntry from "@/components/TaskEntry";
import { Agenda, AgendaTask, Task } from "@prisma/client";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "react-aria-components";

export interface AgendaPageClientProps {
  date: string;
  agenda: (Agenda & { agendaTasks: (AgendaTask & { task: Task })[] }) | null
}

export default function AgendaPageClient({ date, agenda }: AgendaPageClientProps) {
  const router = useRouter();

  const parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd');
  const dayBefore = parsedDate.minus({ days: 1 }).toISODate();
  const dayAfter = parsedDate.plus({ days: 1 }).toISODate();
  const isToday = date === DateTime.now().toISODate();

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
          <p>No tasks for {date}!</p>
        )
      ) : (
        <>
          <p>There is no agenda for this date. Create one?</p>
          <Button onPress={async () => { await upsertAgenda(date); router.refresh(); }}>
            Generate Agenda
          </Button>
        </>
      )}
    </div>
    <TaskEntry onSubmit={addTasksFromText} />
  </div>
  );
}