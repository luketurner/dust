'use client';

import { Grid } from "@adobe/react-spectrum";

export interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {

  return (
    <Grid
      areas={{
        'base': ['sidebar', 'content'],
        'M': ['sidebar content']
      }}
      columns={{base: ['1fr'], 'M': ['1fr', '3fr']}}
      rows={{base: ['fit-content', '1fr'], 'M': ['1fr']}}
      gap="single-line-height"
      justifyItems="start"
    >
      {children}
    </Grid>
  );
}