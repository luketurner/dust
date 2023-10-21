'use client';

import { useIsEmbedded } from "@/hooks/isEmbedded";
import { Content, Grid, Provider, defaultTheme } from "@adobe/react-spectrum";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import { ToastContainer, ToastQueue } from "@react-spectrum/toast";
import { User } from "@prisma/client";
import { setUserTimezone } from "@/actions/user";

export interface AppLayoutProps {
  breadcrumbs?: { key: string, url: string, label: string }[];
  children: React.ReactNode;
  user?: User | undefined | null;
  onAddTask?: () => void;
}

export default function AppLayout({ children, breadcrumbs, user, onAddTask }: AppLayoutProps) {
  const isEmbedded = useIsEmbedded();

  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (user && !user.timezone && browserZone) {
    // set timezone from the user's browser
    setUserTimezone(browserZone)
    .then(() => ToastQueue.info(`Your timezone has been set to: ${browserZone}.`))
    .catch(() => ToastQueue.negative(`Error setting your timezone. Please update in user settings.`));
  }

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
        <AppHeader user={user} breadcrumbs={breadcrumbs} onAddTask={onAddTask} />
        <Content gridArea="content">
          {children}
        </Content>
        <AppFooter />
      </Grid>
    </Provider>
  )
}