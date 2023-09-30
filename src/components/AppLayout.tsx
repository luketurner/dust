'use client';

import { useIsEmbedded } from "@/hooks/isEmbedded";
import { Provider, defaultTheme } from "@adobe/react-spectrum";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isEmbedded = useIsEmbedded();
  return (
    <Provider minHeight={isEmbedded ? '0' : '100vh'} theme={defaultTheme}>
      {children}
    </Provider>
  )
}