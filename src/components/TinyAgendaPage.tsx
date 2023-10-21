'use client';

import AgendaPageClient from "@/app/(app)/agenda/client";
import TinyDemoPage from "@/components/TinyDemoPage";
import { Quote, Task } from "@prisma/client";
import { v4 as uuid } from "uuid";

export interface TinyAgendaPageProps {
  quote: Quote;
  date: string;
}

let nextId = 1;

function demoTask(data: Partial<Task> & { tags?: string[] }) {
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
    ...data,
    tags: data.tags?.map(name => ({ id: uuid(), name, userId: '123' })) ?? [],
  };
}

function demoAgendaTask(data: Partial<Task> & { tags?: string[] }) {
  const task = demoTask(data)
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
      demoAgendaTask({name: 'Buy milk', important: true, tags: ["groceries"]}),
      demoAgendaTask({name: 'Buy eggs', urgent: true, tags: ["groceries"]}),
      demoAgendaTask({name: 'Take over the world', someday: true}),
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