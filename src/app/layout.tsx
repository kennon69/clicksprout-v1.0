import type { Metadata } from 'next'
import './globals.css'
import { SettingsProvider } from '@/contexts/SettingsContext'

export const metadata: Metadata = {
  title: 'ClickSprout v1.0 - Grow Traffic. Grow Sales.',
  description: 'Transform any product link into viral content. Auto-generate titles, descriptions, and hashtags. Schedule posts across platforms. Track performance with powerful analytics.',
  keywords: 'product promotion, viral content, social media automation, content marketing, SEO, backlinks, traffic generation',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevents zoom on input focus
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ClickSprout'
  },
  formatDetection: {
    telephone: false, // Prevents auto-linking phone numbers
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicons/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <SettingsProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  )
}
