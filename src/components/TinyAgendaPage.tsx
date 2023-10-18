'use client';

import AgendaPageClient from "@/app/(app)/today/client";
import TinyDemoPage from "@/components/TinyDemoPage";
import { Quote, Task } from "@prisma/client";

export interface TinyAgendaPageProps {
  quote: Quote;
  date: string;
}

let nextId = 1;

function demoTask(data: Partial<Task>) {
  return {
    id: (nextId++).toString(),
    userId: '123',
    name: 'Buy milk',
    completed: false,
    archived: false,
    important: false,
    urgent: false,
    someday: false,
    createdAt: new Date(),
    description: '',
    tags: [],
    ...data
  };
}

function demoAgendaTask(name: string) {
  const task = demoTask({ name })
  return {
    agendaId: '123',
    taskId: task.id,
    agenda: null,
    task,
    deferred: false,
  };
}

function demoAgenda(date: string) {
  return {
    id: '123',
    userId: '123',
    date: new Date(Date.parse(date)),
    agendaTasks: [
      demoAgendaTask('Buy milk'),
      demoAgendaTask('Buy eggs'),
      demoAgendaTask('Take over the world'),
    ],
  }
}

export default function TinyAgendaPage({ quote, date }: TinyAgendaPageProps) {

  return (
    <TinyDemoPage>
      <AgendaPageClient date={date} agenda={demoAgenda(date)} quote={quote} allTags={[]} />
    </TinyDemoPage>
  );
}