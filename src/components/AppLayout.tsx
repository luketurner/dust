'use client';

import { useIsEmbedded } from "@/hooks/isEmbedded";
import { Content, Grid, Provider, defaultTheme } from "@adobe/react-spectrum";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { ToastContainer } from "@react-spectrum/toast";

export interface AppLayoutProps {
  breadcrumbs?: { key: string, url: string, label: string }[];
  children: React.ReactNode;
  user?: boolean;
}

export default function AppLayout({ children, breadcrumbs, user }: AppLayoutProps) {
  const isEmbedded = useIsEmbedded();
  return (
    <Provider minHeight={isEmbedded ? '0' : '100vh'} theme={defaultTheme}>
      <ToastContainer />
      <Grid areas={['header', 'content', 'footer']}
            rows={['fit-content', '1fr', 'fit-content']}
            maxWidth="900px"
            marginX="auto"
            gap='single-line-height'
            UNSAFE_className="p-2"
      >
        <AppHeader user={user} breadcrumbs={breadcrumbs} />
        <Content gridArea="content">
          {children}
        </Content>
        <AppFooter />
      </Grid>
    </Provider>
  )
}