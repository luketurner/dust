'use client';

import { ActionButton, Flex, Footer, Grid, Header, Heading, Item, Menu, MenuTrigger, Provider, View, defaultTheme, Breadcrumbs, DialogContainer, Dialog, Content, ButtonGroup, Button, Form, TextField } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Quote, Task } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import { useImmerReducer } from "use-immer";
import AgendaTaskRow, { AgendaTaskRowAction } from "@/components/AgendaTaskRow";
import { updateTask } from "@/actions/task";
import { updateAgendaTask } from "@/actions/agendaTask";
import EditTaskDialog from "@/components/EditTaskDialog";

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
  const router = useRouter();

  const [state, dispatchAction] = useImmerReducer<AgendaPageClientState, AgendaPageClientAction>(clientReducer, {
    agenda,
  });

  const tasks = (state.agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)

  const handleMenuAction = useCallback((key: string) => {
    switch (key) {
      case 'logout':
        signOut();
        break;
      case 'manage':
        router.push('/manage');
        break;
    }
  }, []);

  const handleBreadcrumbAction = useCallback((key: string) => {
    switch (key) {
      case 'home':
        router.push('/');
        break;
      case 'today':
        router.push('/today');
        break;
    }
  }, []);

  const handleAction = useCallback((action: AgendaPageClientAction) => {
    serverActionHandler(action);
    dispatchAction(action);
  }, [dispatchAction]);

  return (
    <Provider theme={defaultTheme}>
      <EditTaskDialog
       task={state.dialog?.task}
       onClose={() => handleAction({ type: 'close-dialog' })}
       onSave={(task, data) => handleAction({ type: 'save-task', task, data })}
       />
      <Grid
       areas={{
        'base': ['header', 'title', 'quote', 'tasks', 'footer'],
        'M': [
          'header header',
          'title tasks',
          'quote tasks',
          'footer footer'
        ]
       }}
       columns={{base: ['1fr'], 'M': ['2fr', '3fr']}}
       rows={{
        base: ['max-content', 'max-content', 'max-content', '1fr', 'max-content'],
        'M': ['max-content', '1fr', '4fr', 'max-content']
       }}
       maxWidth="900px"
       marginX="auto"
       marginY="5px"
       gap='single-line-height'
       UNSAFE_className="p-2"
       justifyItems="start"
      >
        <Header gridArea="header" width="100%">
          <Grid areas={['left right']} justifyContent='space-between' columns={["1fr", "max-content"]}>
            <Breadcrumbs gridArea="left" size="M" showRoot onAction={handleBreadcrumbAction}>
              <Item key="home">DUST</Item>
              <Item key="today">Agenda</Item>
            </Breadcrumbs>
            <View gridArea="right">
              <MenuTrigger>
                <ActionButton isQuiet>
                  <ShowMenu />
                </ActionButton>
                <Menu onAction={handleMenuAction}>
                  <Item key="manage">Manage tasks</Item>
                  <Item key="logout">Log out</Item>
                </Menu>
              </MenuTrigger>
            </View>
          </Grid>
        </Header>
        <Heading UNSAFE_className="text-3xl" level={1} gridArea="title" justifySelf={{base: 'center', 'M': 'end'}}>
          {date}
        </Heading>
        <View gridArea="quote" justifySelf={{base: 'center', 'M': 'end'}}>
          <pre style={{ font: 'inherit' }}>
            {quote.content}
          </pre>
          <p className="text-right">
            {quote.author}
          </p>
        </View>
        <Flex gridArea="tasks" direction="column" width="100%" gap="size-100" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }}>
          {tasks.map(task => (
            <AgendaTaskRow key={task.id} task={task} onAction={handleAction} />
          ))}
        </Flex>
        <Footer gridArea="footer" width="100%">
          <Flex direction="row" wrap justifyContent="center">
            <a className="underline" href="https://github.com/luketurner/dust">Github</a>
          </Flex>
          <Flex direction="row" wrap justifyContent="center">
            <span>Copyright Luke Turner 2023</span>
          </Flex>
        </Footer>
      </Grid>
    </Provider>
  );
}