'use client';

import { ActionButton, Flex, Footer, Grid, Header, Heading, Item, Menu, MenuTrigger, Provider, View, defaultTheme, Breadcrumbs } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Task } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import { useImmerReducer } from "use-immer";
import AgendaTaskRow, { AgendaTaskRowAction } from "@/components/AgendaTaskRow";
import { updateTask } from "@/actions/task";
import { updateAgendaTask } from "@/actions/agendaTask";

export interface AgendaPageClientProps {
  date: string;
  agenda: (Agenda & { agendaTasks: (AgendaTask & { task: Task })[] }) | null;
}

interface AgendaPageClientState {
  tasks: Task[]
  agenda: Agenda | null;
}

type AgendaPageClientAction = AgendaTaskRowAction;

export default function AgendaPageClient({ date, agenda }: AgendaPageClientProps) {
  const router = useRouter();

  const [state, dispatchAction] = useImmerReducer<AgendaPageClientState, AgendaPageClientAction>((state, action) => {
    switch (action.type) {
      case 'toggle':
        const task = action.task;
        state.tasks.find(v => v.id === task.id)!.completed = !task.completed;
        break;
    }
    return state;
  }, {
    agenda,
    tasks: (agenda?.agendaTasks ?? []).filter(at => !at.deferred).map(at => at.task)
  });

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

  const handleTaskAction = useCallback((action: AgendaPageClientAction) => {
    switch (action.type) {
      case 'toggle':
        updateTask(action.task.id, {
          completed: !action.task.completed
        });
        break;
      case 'defer':
        if (agenda) {
          updateAgendaTask(agenda.id, action.task.id, {
            deferred: true
          });
        }
        break;
    }
    dispatchAction(action);
  }, [dispatchAction])

  return (
    <Provider theme={defaultTheme} >
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
          Lorem ipsum afoo abar<br />
          asdfasdf asdfasdf<br />
          fdsafdasf
        </View>
        <Flex gridArea="tasks" direction="column" width="100%" gap="size-100" maxWidth="size-5000" marginX={{ base: 'auto', 'M': 0 }}>
          {state.tasks.map(task => (
            <AgendaTaskRow key={task.id} task={task} onAction={handleTaskAction} />
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