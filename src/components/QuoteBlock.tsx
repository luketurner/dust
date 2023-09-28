import { Quote } from "@prisma/client"

export interface QuoteProps {
  quote: Quote;
}

export default function QuoteBlock({ quote }: QuoteProps) {
  return (
    <>
      <pre style={{ font: 'inherit' }}>
        {quote.content}
      </pre>
      <p className="text-right">
        {quote.author}
      </p>
    </>
  )
}