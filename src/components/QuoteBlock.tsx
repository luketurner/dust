'use client';

import { View } from "@adobe/react-spectrum";
import { Quote } from "@prisma/client"

export interface QuoteProps {
  quote: Quote;
}

export default function QuoteBlock({ quote }: QuoteProps) {
  return (
    <View>
      <pre style={{ font: 'inherit', whiteSpace: 'pre-line' }}>
        {quote.content}
      </pre>
      <p className="text-right italic" style={{maxWidth: '16rem'}}>
        {quote.author} ({quote.source})
      </p>
    </View>
  )
}