'use client';

import { Button, ButtonGroup, Flex, Heading, View } from "@adobe/react-spectrum";
import { Quote, Tag, Task, User } from "@prisma/client";
import AgendaTaskRow from "@/components/AgendaTaskRow";
import { createTask, updateTask } from "@/actions/task";
import { updateAgendaTask, addAgendaTasks } from "@/actions/agendaTask";
import EditTaskDialog, { EditTaskDialogData } from "@/components/EditTaskDialog";
import { DateTime } from "luxon";
import AppLayout from "@/components/AppLayout";
import QuoteBlock from "@/components/QuoteBlock";
import ThreeSpotLayout from "@/components/ThreeSpotLayout";
import { EffectErrorAction, ServerErrorAction, useClientServerReducer } from "@/hooks/clientServerReducer";
import { ToastQueue } from "@react-spectrum/toast";
import { useCallback } from "react";
import { AgendaWithIncludes } from "@/models/agenda";

export interface AgendaPageClientProps {
  date: string;
  agenda: AgendaWithIncludes;
  quote: Quote;
  allTags: Tag[];
  user: User;
}

interface TaskDialogState {
  taskId?: string;
  type: 'add-task' | 'edit-task';
}

interface AgendaPageClientState {
  agenda: AgendaWithIncludes;
  dialog?: TaskDialogState;
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
    someday?: boolean;
  }
}

interface AddAgendaTasksAction {
  type: 'add-agenda-tasks';
  agendaId: string;
  num: number;
}

interface AddAgendaTasksFinishedAction {
  type: 'add-agenda-tasks-finished';
  agenda: AgendaWithIncludes;
}

export interface EditTaskAction { type: 'edit-task'; taskId: string; }
export interface OpenCreateTaskAction { type: 'open-create-task'; }
export interface CreateTaskAction { type: 'create-task'; data: Partial<Task>; }
export interface DeferTaskAction { type: 'defer-task'; taskId: string; agendaId: string; }
export interface ToggleTaskAction { type: 'toggle-task'; taskId: string; completed: boolean; }

type AgendaPageClientAction = OpenCreateTaskAction | CreateTaskAction | AddAgendaTasksFinishedAction | AddAgendaTasksAction | EditTaskAction | DeferTaskAction | ToggleTaskAction | SaveTaskAction | DialogAction | ServerErrorAction | EffectErrorAction;

function stateReducer(state: AgendaPageClientState, action: AgendaPageClientAction) {
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
        type: 'edit-task'
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
      taskToUpdate.someday = action.data.someday ?? false;
      if (Array.isArray(action.data.tags)) taskToUpdate.tags = action.data.tags.map(id => state.allTags.find((tag) => tag.id === id)!);
      delete state.dialog;
      break;
    case 'open-create-task':
      state.dialog = {
        type: 'add-task'
      };
      break;
    case 'create-task':
      delete state.dialog;
      break;
    case 'add-agenda-tasks-finished':
      if (action.agenda.id !== state.agenda.id) return;
      state.agenda = action.agenda;
      break;
  }
}

async function effectReducer(action: AgendaPageClientAction) {
  switch (action.type) {
    case 'create-task':
      ToastQueue.positive('Task created.')
      break;
    case 'server-error':
      ToastQueue.negative('Error: ' + (action.error as Error)?.message ?? 'Unknown error');
      break;
  }
}

async function serverReducer(action: AgendaPageClientAction) {
  switch (action.type) {
    case 'toggle-task':
      await updateTask(action.taskId, {
        completed: action.completed
      });
      break;
    case 'defer-task':
      await updateAgendaTask(action.agendaId, action.taskId, {
        deferred: true
      });
      break;
    case 'save-task':
      await updateTask(action.taskId, action.data);
      break;
    case 'create-task':
      await createTask(action.data);
      break;
    case 'add-agenda-tasks':
      const updatedAgenda = await addAgendaTasks(action.agendaId, action.num);
      return { type: 'add-agenda-tasks-finished', agenda: updatedAgenda } as AgendaPageClientAction
  }
}

export default function AgendaPageClient({ date, agenda, quote, allTags, user }: AgendaPageClientProps) {
  const [state, dispatchAction] = useClientServerReducer<AgendaPageClientState, AgendaPageClientAction>(stateReducer, effectReducer, serverReducer, {
    agenda,
    allTags
  });

  const tasks = (state.agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)

  const displayDate = DateTime.fromISO(date).toLocaleString({ month: 'short', day: 'numeric' });

  const handleDeferTask = useCallback((taskId: string) => dispatchAction({ type: 'defer-task', taskId, agendaId: agenda.id }), [dispatchAction, agenda.id]);
  const handleEditTask = useCallback((taskId: string) => dispatchAction({ type: 'edit-task', taskId }), [dispatchAction]);
  const handleOpenCreateTask = useCallback(() => dispatchAction({ type: 'open-create-task' }), [dispatchAction]);
  const handleToggleTask = useCallback((taskId: string, completed: boolean) => dispatchAction({ type: 'toggle-task', taskId, completed }), [dispatchAction]);
  const handleDialogClose = useCallback(() => dispatchAction({ type: 'close-dialog' }), [dispatchAction]);
  const handleAddOneTask = useCallback(() => dispatchAction({ type: 'add-agenda-tasks', agendaId: agenda.id, num: 1 }), [dispatchAction, agenda.id]);
  const handleAddTwoTasks = useCallback(() => dispatchAction({ type: 'add-agenda-tasks', agendaId: agenda.id, num: 2 }), [dispatchAction, agenda.id]);
  const handleAddThreeTasks = useCallback(() => dispatchAction({ type: 'add-agenda-tasks', agendaId: agenda.id, num: 3 }), [dispatchAction, agenda.id]);
  const handleSaveTask = useCallback(
    (taskId: string, data: EditTaskDialogData) => taskId ? dispatchAction({ type: 'save-task', taskId, data }) : dispatchAction({ type: 'create-task', data }),
    [dispatchAction]
  );

  return (
    <AppLayout user={user} breadcrumbs={[{ label: 'Agenda', url: '/agenda', key: 'agenda' }]} onAddTask={handleOpenCreateTask}>
      <EditTaskDialog
       task={tasks.find(t => t.id === state.dialog?.taskId)}
       onClose={handleDialogClose}
       onSave={handleSaveTask}
       allTags={state.allTags}
       isOpen={state.dialog?.type === 'add-task' || state.dialog?.type === 'edit-task'}
       isCreate={state.dialog?.type === 'add-task'}
       />
      <ThreeSpotLayout>
        <Heading gridArea="a" UNSAFE_className="text-4xl" level={1}  justifySelf={{base: 'center', 'M': 'end'}}>
          {displayDate}
        </Heading>
        <View gridArea="b" justifySelf={{base: 'center', 'M': 'end'}}>
          <QuoteBlock quote={quote} />
        </View>
        <View gridArea="c" width="100%" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }} >
          <Flex direction="column" width="100%" gap="size-100" alignItems="stretch">
            {tasks.map(task => (
              <AgendaTaskRow key={task.id} task={task} onDefer={handleDeferTask} onEdit={handleEditTask} onToggle={handleToggleTask} />
            ))}
          </Flex>
          {tasks.some(task => !task.completed) ? undefined : 
            <Flex direction="column" marginTop="single-line-height" alignSelf="center" alignItems="center" gap="size-100">
              <View marginBottom="size-200">Looks like you&apos;re done for the day! 🎉</View>
              <View>(If you want, you can add some more tasks to the agenda...)</View>
              <ButtonGroup>
                <Button variant="secondary" onPress={handleAddOneTask}>Add 1 task</Button>
                <Button variant="secondary" onPress={handleAddTwoTasks}>Add 2 tasks</Button>
                <Button variant="secondary" onPress={handleAddThreeTasks}>Add 3 tasks</Button>
              </ButtonGroup> 
            </Flex>
          }
        </View>

      </ThreeSpotLayout>
    </AppLayout>
  );
}