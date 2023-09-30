'use client';

import { Grid } from "@adobe/react-spectrum";

export interface ThreeSpotLayoutProps {
  children: React.ReactNode
}

export default function ThreeSpotLayout({ children }: ThreeSpotLayoutProps) {

  return (
    <Grid
      areas={{
        'base': ['a', 'c', 'b'],
        'M': [
          'a c',
          'b c',
        ]
      }}
      columns={{base: ['1fr'], 'M': ['2fr', '3fr']}}
      rows={{
        base: ['max-content', '1fr', 'max-content'],
        'M': ['1fr', '4fr']
      }}
      gap="single-line-height"
      justifyItems="start"
    >
      {children}
    </Grid>
  );
}