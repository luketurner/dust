'use client';

import { Quote } from "@prisma/client"

export interface QuoteProps {
  quote: Quote;
}

export default function QuoteBlock({ quote }: QuoteProps) {
  return (
    <div>
      <pre style={{ font: 'inherit' }}>
        {quote.content}
      </pre>
      <p className="text-right" style={{maxWidth: '10rem'}}>
        {quote.author}
      </p>
    </div>
  )
}