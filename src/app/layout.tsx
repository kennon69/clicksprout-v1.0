import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClickSprout v1.0 - Grow Traffic. Grow Sales.',
  description: 'Transform any product link into viral content.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
