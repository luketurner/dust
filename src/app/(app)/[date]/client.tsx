'use client';

import { ActionButton, ActionMenu, Flex, Footer, Grid, Header, Heading, Item, Menu, MenuTrigger, Provider, ToggleButton, View, Link as SpectrumLink, defaultTheme, Breadcrumbs } from "@adobe/react-spectrum";
import { Agenda, AgendaTask, Task } from "@prisma/client";
import { DateTime } from "luxon";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import Link from "next/link";

export interface AgendaPageClientProps {
  date: string;
  agenda: (Agenda & { agendaTasks: (AgendaTask & { task: Task })[] }) | null;
}

export default function AgendaPageClient({ date, agenda }: AgendaPageClientProps) {
  const router = useRouter();

  const parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd');

  const tasks = agenda?.agendaTasks?.map(at => at.task);

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

  const handleTaskAction = useCallback((task: Task, key: string) => {
    // switch (key) {
    //   case 'logout':
    //     signOut();
    //     break;
    //   case 'manage':
    //     router.push('/manage');
    //     break;
    // }
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

  return (
    <Provider theme={defaultTheme} >
      <Grid
       areas={[
        'header header',
        'title tasks',
        'quote tasks',
        'footer footer'
       ]}
       columns={['2fr', '3fr']}
       rows={['max-content', '1fr', '4fr', 'max-content']}
       maxWidth="900px"
       marginX="auto"
       marginY="5px"
       gap='single-line-height'
      >
        <Header gridArea="header" width="100%">
          <Grid areas={['left right']} justifyContent='space-between' columns={["1fr", "max-content"]}>
            <Breadcrumbs gridArea="left" size="M" margin="space-25" showRoot onAction={handleBreadcrumbAction}>
              <Item key="asdf">DUST</Item>
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
        <Heading UNSAFE_className="text-3xl" level={1} gridArea="title" justifySelf="end">
          {date}
        </Heading>
        <View gridArea="quote" justifySelf="end">
          Lorem ipsum afoo abar<br />
          asdfasdf asdfasdf<br />
          fdsafdasf
        </View>
        <Flex gridArea="tasks" direction="column" gap="size-100" marginEnd="size-100">
          {tasks?.map(task => (
            <Grid areas={["toggle name actions",
                          "toggle tags actions"]}
                  rows={["1fr", "1fr"]}
                  columns={["max-content", "1fr", "max-content"]}
                  columnGap="size-100"
                  alignItems="center"
                  UNSAFE_className="rounded border shadow p-1">
              <View gridArea="toggle">
                <ToggleButton isEmphasized isQuiet>
                  <CheckmarkCircleOutline />
                </ToggleButton>
              </View>
              <View alignSelf="start" gridArea="name">{task.name}</View>
              <View gridArea="tags">#foo #bar</View>
              <View gridArea="actions">
                <ActionMenu isQuiet onAction={(key) => handleTaskAction(task, key)}>
                  <Item key="edit">Edit</Item>
                  <Item key="defer">Defer</Item>
                  <Item key="archive">Archive</Item>
                </ActionMenu>
              </View>

            </Grid>
          ))}
        </Flex>
        <Footer gridArea="footer">
          <Flex direction="row" wrap justifyContent="center">
            <a className="underline" href="https://github.com/luketurner/dust">Github</a>
          </Flex>
          <Flex direction="row" wrap justifyContent="center">
            <span>Copyright Luke Turner 2023</span>
          </Flex>
        </Footer>
      </Grid>
    </Provider>
  //   <div className="flex flex-col flex-nowrap items-center">
  //   <div className="mt-4 flex flex-row flex-nowrap items-center justify-center">
  //     <Link className="mx-2 text-xl" href={`/${dayBefore}`}>&lt;&lt;</Link>
  //     <h1 className="text-4xl">{date}</h1>
  //     <Link className="mx-2 text-xl" href={`/${dayAfter}`}>&gt;&gt;</Link>
  //   </div>
  //   {!isToday && (
  //     <Link className="m-2 text-xl p-2 rounded bg-slate-200 w-64 mt-4 block text-center" href={`/today`}>Back to Today</Link>
  //   )}
  //   <div className="mt-8">
  //     {agenda ? (
  //       (tasks && tasks.length !== 0) ? (
  //         <SimpleTaskList tasks={tasks} />
  //       ) : (
  //         <p>No tasks for {date}!</p>
  //       )
  //     ) : (
  //       <>
  //         <p>There is no agenda for this date. Create one?</p>
  //         <Button onPress={async () => { await upsertAgenda(date); router.refresh(); }}>
  //           Generate Agenda
  //         </Button>
  //       </>
  //     )}
  //   </div>
  //   <TaskEntry onSubmit={addTasksFromText} />
  // </div>
  );
}