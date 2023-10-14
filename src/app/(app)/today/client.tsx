'use client';

import { Flex, Heading, View } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Quote, Tag, Task } from "@prisma/client";
import AgendaTaskRow from "@/components/AgendaTaskRow";
import { updateTask } from "@/actions/task";
import { updateAgendaTask } from "@/actions/agendaTask";
import EditTaskDialog, { EditTaskDialogData } from "@/components/EditTaskDialog";
import { DateTime } from "luxon";
import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ToastQueue } from "@react-spectrum/toast";
import { useCallback } from "react";

export type AgendaWithIncludes = (Agenda & {
  agendaTasks: (AgendaTask & {
    task: (Task & {
      tags: Tag[] 
    }) 
  })[] 
})

export interface AgendaPageClientProps {
  date: string;
  agenda: AgendaWithIncludes;
  quote: Quote;
  allTags: Tag[];
}

interface EditingTaskDialogState {
  taskId: string;
}

interface AgendaPageClientState {
  agenda: AgendaWithIncludes;
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
    important?: boolean;
    urgent?: boolean;
  }
}

export interface EditTaskAction { type: 'edit-task'; taskId: string; }
export interface DeferTaskAction { type: 'defer-task'; taskId: string; agendaId: string; }
export interface ToggleTaskAction { type: 'toggle-task'; taskId: string; completed: boolean; }

type AgendaPageClientAction = EditTaskAction | DeferTaskAction | ToggleTaskAction | SaveTaskAction | DialogAction | ServerErrorAction;

function clientReducer(state: AgendaPageClientState, action: AgendaPageClientAction) {
  switch (action.type) {
    case 'toggle-task':
      state.agenda!.agendaTasks.find(v => v.taskId === action.taskId)!.task.completed = action.completed;
      break;
    case 'defer-task':
      (state?.agenda?.agendaTasks ?? []).find(v => v.taskId === action.taskId)!.deferred = true;
      break;
    case 'edit-task':
      state.dialog = {
        taskId: action.taskId,
      };
      break;
    case 'close-dialog':
      delete state.dialog;
      break;
    case 'save-task':
      const taskToUpdate = (state?.agenda?.agendaTasks ?? []).find(v => v.taskId === action.taskId)!.task;
      if (typeof action.data.name === 'string') taskToUpdate.name = action.data.name;
      if (typeof action.data.description === 'string') taskToUpdate.description = action.data.description;
      taskToUpdate.urgent = action.data.urgent ?? false;
      taskToUpdate.important = action.data.important ?? false;
      if (Array.isArray(action.data.tags)) taskToUpdate.tags = action.data.tags.map(id => state.allTags.find((tag) => tag.id === id)!);
      delete state.dialog;
      break;
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      break;
  }
}

async function serverReducer(action: AgendaPageClientAction) {
  switch (action.type) {
    case 'toggle-task':
      updateTask(action.taskId, {
        completed: action.completed
      });
      break;
    case 'defer-task':
      updateAgendaTask(action.agendaId, action.taskId, {
        deferred: true
      });
      break;
    case 'save-task':
      updateTask(action.taskId, action.data);
      break;
  }
}

export default function AgendaPageClient({ date, agenda, quote, allTags }: AgendaPageClientProps) {
  const [state, dispatchAction] = useClientServerReducer<AgendaPageClientState, AgendaPageClientAction>(clientReducer, serverReducer, {
    agenda,
    allTags
  });

  const tasks = (state.agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)

  const displayDate = DateTime.fromISO(date).toLocaleString({ month: 'short', day: 'numeric' });

  const handleDeferTask = useCallback((taskId: string) => dispatchAction({ type: 'defer-task', taskId, agendaId: agenda.id }), [dispatchAction, agenda.id]);
  const handleEditTask = useCallback((taskId: string) => dispatchAction({ type: 'edit-task', taskId }), [dispatchAction]);
  const handleToggleTask = useCallback((taskId: string, completed: boolean) => dispatchAction({ type: 'toggle-task', taskId, completed }), [dispatchAction]);
  const handleDialogClose = useCallback(() => dispatchAction({ type: 'close-dialog' }), [dispatchAction]);
  const handleSaveTask = useCallback((taskId: string, data: EditTaskDialogData) => dispatchAction({ type: 'save-task', taskId, data }), [dispatchAction]);

  return (
    <AppLayout user={true} breadcrumbs={[{ label: 'Agenda', url: '/today', key: 'agenda' }]}>
      <EditTaskDialog
       task={tasks.find(t => t.id === state.dialog?.taskId)}
       onClose={handleDialogClose}
       onSave={handleSaveTask}
       allTags={state.allTags}
       isOpen={!!state.dialog?.taskId}
       />
      <ThreeSpotLayout>
        <Heading gridArea="a" UNSAFE_className="text-4xl" level={1}  justifySelf={{base: 'center', 'M': 'end'}}>
          {displayDate}
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <Flex gridArea="c" direction="column" width="100%" gap="size-100" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }}>
          {tasks.length > 0 ? tasks.map(task => (
            <AgendaTaskRow key={task.id} task={task} onDefer={handleDeferTask} onEdit={handleEditTask} onToggle={handleToggleTask} />
          )) : (
            <>No tasks for the day!</>
          )}
        </Flex>
      </ThreeSpotLayout>
    </AppLayout>
  );
}