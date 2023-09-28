'use client';

import { Provider, defaultTheme } from "@adobe/react-spectrum";

export interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Provider theme={defaultTheme}>
      {children}
    </Provider>
  )
}