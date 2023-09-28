'use client';

import { ActionButton, Grid, Header, Item, Menu, MenuTrigger, View, Breadcrumbs } from "@adobe/react-spectrum";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";

export interface AppHeaderProps {
  breadcrumbs?: { key: string, url: string, label: string }[];
}

export default function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const router = useRouter();

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
    const { url } = breadcrumbs.find(b => b.key === key) ?? {};
    if (url) router.push(url);
  }, []);

  return (
    <Header gridArea="header" width="100%">
      <Grid areas={['left right']} justifyContent='space-between' columns={["1fr", "max-content"]}>
        <Breadcrumbs gridArea="left" size="M" showRoot onAction={handleBreadcrumbAction}>
        <Item key="home">DUST</Item>
          {breadcrumbs.map(({ key, label }) => <Item key={key}>{label}</Item>)}
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
  );
}