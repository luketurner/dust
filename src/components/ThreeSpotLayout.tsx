'use client';

import { Grid } from "@adobe/react-spectrum";

export interface ThreeSpotLayoutProps {
  children: React.ReactNode
}

export default function ThreeSpotLayout({ children }: ThreeSpotLayoutProps) {

  return (
    <Grid
      areas={{
      'base': ['header', 'a', 'c', 'b', 'footer'],
      'M': [
        'header header',
        'a c',
        'b c',
        'footer footer'
      ]
      }}
      columns={{base: ['1fr'], 'M': ['2fr', '3fr']}}
      rows={{
      base: ['max-content', 'max-content', '1fr', 'max-content', 'max-content'],
      'M': ['max-content', '1fr', '4fr', 'max-content']
      }}
      maxWidth="900px"
      marginX="auto"
      gap='single-line-height'
      UNSAFE_className="p-2"
      justifyItems="start"
    >
      {children}
    </Grid>
  );
}