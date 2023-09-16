import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dust',
  description: 'Task management app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container">
      {children}
    </div>
  )
}
