'use client';

import { Flex, Heading, View } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Quote, Tag, Task } from "@prisma/client";
import { useCallback } from "react";
import { useImmerReducer } from "use-immer";
import AgendaTaskRow, { AgendaTaskRowAction } from "@/components/AgendaTaskRow";
import { updateTask } from "@/actions/task";
import { updateAgendaTask } from "@/actions/agendaTask";
import EditTaskDialog from "@/components/EditTaskDialog";
import { DateTime } from "luxon";
import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { useIsEmbedded } from "@/hooks/isEmbedded";
import { ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";

export type AgendaWithIncludes = (Agenda & {
  agendaTasks: (AgendaTask & {
    task: (Task & {
      tags: Tag[] 
    }) 
  })[] 
})

export interface AgendaPageClientProps {
  date: string;
  agenda: AgendaWithIncludes | null;
  quote: Quote;
  allTags: Tag[];
}

interface EditingTaskDialogState {
  taskId: string;
}

interface AgendaPageClientState {
  agenda: AgendaWithIncludes | null;
  dialog?: EditingTaskDialogState;
  allTags: Tag[];
}

interface DialogAction {
  type: 'close-dialog' | 'update-dialog-data';
  data?: object;
}

export interface SaveTaskAction {
  type: 'save-task'
  taskId: string
  data: {
    name?: string;
    description?: string;
    tags?: string[];
  }
}

type AgendaPageClientAction = AgendaTaskRowAction | SaveTaskAction | DialogAction | ServerErrorAction;

function clientReducer(state: AgendaPageClientState, action: AgendaPageClientAction) {
  switch (action.type) {
    case 'toggle':
      state.agenda!.agendaTasks.find(v => v.taskId === action.task.id)!.task.completed = !action.task.completed;
      break;
    case 'defer':
      (state?.agenda?.agendaTasks ?? []).find(v => v.taskId === action.task.id)!.deferred = true;
      break;
    case 'edit':
      state.dialog = {
        taskId: action.task.id,
      };
      break;
    case 'close-dialog':
      delete state.dialog;
      break;
    case 'save-task':
      const taskToUpdate = (state?.agenda?.agendaTasks ?? []).find(v => v.taskId === action.taskId)!.task;
      if (typeof action.data.name === 'string') taskToUpdate.name = action.data.name;
      if (typeof action.data.description === 'string') taskToUpdate.description = action.data.description;
      if (Array.isArray(action.data.tags)) taskToUpdate.tags = action.data.tags.map(id => state.allTags.find((tag) => tag.id === id));
      delete state.dialog;
      break;
  }
}

async function serverActionHandler(action: AgendaPageClientAction) {
  switch (action.type) {
    case 'toggle':
      updateTask(action.task.id, {
        completed: !action.task.completed
      });
      break;
    case 'defer':
      updateAgendaTask(action.agenda?.id!, action.task.id, {
        deferred: true
      });
      break;
    case 'save-task':
      updateTask(action.taskId, action.data ?? {});
      break;
  }
}

export default function AgendaPageClient({ date, agenda, quote, allTags }: AgendaPageClientProps) {
  const [state, dispatchAction] = useClientServerReducer<AgendaPageClientState, AgendaPageClientAction>(clientReducer, serverActionHandler, {
    agenda,
    allTags
  });

  const tasks = (state.agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)

  const displayDate = DateTime.fromISO(date).toLocaleString({ month: 'short', day: 'numeric' });

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Agenda', url: '/today', key: 'agenda' }]}>
      <EditTaskDialog
       task={tasks.find(t => t.id === state.dialog?.taskId)}
       onClose={() => dispatchAction({ type: 'close-dialog' })}
       onSave={(taskId, data) => dispatchAction({ type: 'save-task', taskId, data })}
       allTags={state.allTags}
       />
      <ThreeSpotLayout>
        <Heading gridArea="a" UNSAFE_className="text-4xl" level={1}  justifySelf={{base: 'center', 'M': 'end'}}>
          {displayDate}
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <Flex gridArea="c" direction="column" width="100%" gap="size-100" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }}>
          {tasks.map(task => (
            <AgendaTaskRow key={task.id} task={task} onAction={dispatchAction} />
          ))}
        </Flex>
      </ThreeSpotLayout>
    </AppLayout>
  );
}