'use client';

import { ActionButton, Grid, Header, Item, Menu, MenuTrigger, View, Breadcrumbs } from "@adobe/react-spectrum";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";
import { useIsEmbedded } from "@/hooks/isEmbedded";

export interface AppHeaderProps {
  breadcrumbs?: { key: string, url: string, label: string }[];
  user?: boolean;
}

export default function AppHeader({ breadcrumbs, user }: AppHeaderProps) {
  const router = useRouter();
  const isEmbedded = useIsEmbedded();

  const handleMenuAction = useCallback((key: string) => {
    if (isEmbedded) return;
    switch (key) {
      case 'login': return signIn('github');
      case 'logout': return signOut();
      case 'manage': return router.push('/manage');
      case 'today': return router.push('/today');
      case 'settings': return router.push('/settings');
    }
  }, [router, isEmbedded]);

  const handleBreadcrumbAction = useCallback((key: string) => {
    if (isEmbedded) return;
    const { url } = breadcrumbs.find(b => b.key === key) ?? {};
    if (url) router.push(url);
  }, [router, isEmbedded, breadcrumbs]);

  return (
    <Header gridArea="header" width="100%">
      <Grid areas={['left right']} justifyContent='space-between' columns={["1fr", "max-content"]}>
        {breadcrumbs && 
          <Breadcrumbs gridArea="left" size="M" showRoot onAction={handleBreadcrumbAction}>
            <Item key="home">DUST</Item>
            {breadcrumbs.map(({ key, label }) => <Item key={key}>{label}</Item>)}
          </Breadcrumbs>
        }
        <View gridArea="right">
          <MenuTrigger>
            <ActionButton isQuiet isDisabled={isEmbedded}>
              <ShowMenu />
            </ActionButton>
            <Menu onAction={handleMenuAction}>
              {user && <Item key="today">Daily agenda</Item>}
              {user && <Item key="manage">Manage tasks</Item>}
              {user && <Item key="settings">Settings</Item>}
              {user && <Item key="logout">Log out</Item>}
              {!user && <Item key="login">Log in</Item>}
            </Menu>
          </MenuTrigger>
        </View>
      </Grid>
    </Header>
  );
}