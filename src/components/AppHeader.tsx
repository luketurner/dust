'use client';

import { ActionButton, Grid, Header, Item, Menu, MenuTrigger, View, Breadcrumbs, Button, Flex } from "@adobe/react-spectrum";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Key, useCallback } from "react";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import { useIsEmbedded } from "@/hooks/isEmbedded";
import { User } from "@prisma/client";

export interface AppHeaderProps {
  breadcrumbs?: { key: string, url: string, label: string }[];
  user?: User | undefined | null;
  onAddTask?: () => void;
}

export default function AppHeader({ breadcrumbs, user, onAddTask }: AppHeaderProps) {
  const router = useRouter();
  const isEmbedded = useIsEmbedded();

  // Clears the client-side Router Cache using router.refresh() after navigating.
  // this is necessary for the other page to get new data from the server, in case
  // mutations have happened.
  // TODO -- technically, this isn't always necessary, but I'm not sure which pages
  // have data dependencies on each other, so just refreshing every time.
  const navigate = useCallback((path: string) => { router.push(path); router.refresh(); }, [router])

  const handleMenuAction = useCallback((key: Key) => {
    if (isEmbedded) return;
    switch (key) {
      case 'login': return signIn('github');
      case 'logout': return signOut();
      case 'manage': return navigate('/manage');
      case 'agenda': return navigate('/agenda');
      case 'settings': return navigate('/settings');
      case 'manual': return navigate('/manual');
    }
  }, [navigate, isEmbedded]);

  const handleBreadcrumbAction = useCallback((key: Key) => {
    if (isEmbedded) return;
    if (key === 'home') return router.push('/');
    const { url } = breadcrumbs?.find(b => b.key === key) ?? {};
    if (url) router.push(url);
  }, [router, isEmbedded, breadcrumbs]);

  return (
    <Header gridArea="header" width="100%">
      <Grid areas={['left right']} justifyContent='space-between' columns={["1fr", "max-content"]}>
        <Flex gridArea="left" direction="row" gap="single-line-height" alignItems="center">
          {breadcrumbs && 
            <Breadcrumbs width={150} size="M" showRoot onAction={handleBreadcrumbAction}>
              {[{ key: 'home', label: 'DUST' }, ...breadcrumbs].map(({ key, label }) => <Item key={key}>{label}</Item>)}
            </Breadcrumbs>
          }
          {user && onAddTask && <Button variant="secondary" onPress={onAddTask}>Add Task</Button>}
        </Flex>
        <View gridArea="right">
          <MenuTrigger>
            <ActionButton isQuiet isDisabled={isEmbedded}>
              <ShowMenu />
            </ActionButton>
            <Menu onAction={handleMenuAction}>
              {user ? <Item key="agenda">Daily agenda</Item> : undefined!}
              {user ? <Item key="manage">Manage tasks</Item> : undefined!}
              {user ? <Item key="settings">Settings</Item> : undefined!}
              <Item key="manual">Manual</Item>
              {user ? <Item key="logout">Log out</Item> : undefined!}
              {!user ? <Item key="login">Log in</Item> : undefined!}
            </Menu>
          </MenuTrigger>
        </View>
      </Grid>
    </Header>
  );
}