'use client';

import { Flex, Grid, Heading, View } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Quote, Task } from "@prisma/client";
import { useCallback } from "react";
import { useImmerReducer } from "use-immer";
import AgendaTaskRow, { AgendaTaskRowAction } from "@/components/AgendaTaskRow";
import { updateTask } from "@/actions/task";
import { updateAgendaTask } from "@/actions/agendaTask";
import EditTaskDialog from "@/components/EditTaskDialog";
import { DateTime } from "luxon";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { useIsEmbedded } from "@/hooks/isEmbedded";

export interface AgendaPageClientProps {
  date: string;
  agenda: (Agenda & { agendaTasks: (AgendaTask & { task: Task })[] }) | null;
  quote: Quote;
}

interface EditingTaskDialogState {
  task: Task
}

interface AgendaPageClientState {
  agenda: (Agenda & { agendaTasks: (AgendaTask & { task: Task })[] }) | null;
  dialog?: EditingTaskDialogState;
}

interface EditingTaskDialogAction {
  type: 'save-task';
  task: Task;
  data?: object;
}

interface DialogAction {
  type: 'close-dialog' | 'update-dialog-data';
  data?: object;
}

type AgendaPageClientAction = AgendaTaskRowAction | EditingTaskDialogAction | DialogAction;

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
        task: action.task,
      };
      break;
    case 'close-dialog':
      delete state.dialog;
      break;
    case 'save-task':
      (state?.agenda?.agendaTasks ?? []).find(v => v.taskId === action.task.id)!.task.name = action.data!.name;
      delete state.dialog;
      break;
  }
}

function serverActionHandler(action: AgendaPageClientAction) {
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
      updateTask(action.task.id, action.data ?? {});
      break;
  }
}

export default function AgendaPageClient({ date, agenda, quote }: AgendaPageClientProps) {
  const [state, dispatchAction] = useImmerReducer<AgendaPageClientState, AgendaPageClientAction>(clientReducer, {
    agenda,
  });

  const isEmbedded = useIsEmbedded();

  const tasks = (state.agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)

  const handleAction = useCallback((action: AgendaPageClientAction) => {
    if (isEmbedded) return;
    serverActionHandler(action);
    dispatchAction(action);
  }, [dispatchAction, isEmbedded]);

  const displayDate = DateTime.fromISO(date).toLocaleString({ month: 'short', day: 'numeric' });

  return (
    <AppLayout>
      <EditTaskDialog
       task={state.dialog?.task}
       onClose={() => handleAction({ type: 'close-dialog' })}
       onSave={(task, data) => handleAction({ type: 'save-task', task, data })}
       />
      <ThreeSpotLayout>
        <AppHeader user={true} breadcrumbs={[{ label: 'Agenda', url: '/today', key: 'agenda' }]} />
        <Heading gridArea="a" UNSAFE_className="text-4xl" level={1}  justifySelf={{base: 'center', 'M': 'end'}}>
          {displayDate}
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <Flex gridArea="c" direction="column" width="100%" gap="size-100" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }}>
          {tasks.map(task => (
            <AgendaTaskRow key={task.id} task={task} onAction={handleAction} />
          ))}
        </Flex>
        <AppFooter />
      </ThreeSpotLayout>
    </AppLayout>
  );
}