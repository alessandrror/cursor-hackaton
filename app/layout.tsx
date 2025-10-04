import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import CerebryxLogo from '@/components/branding/CerebryxLogo'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Cerebryx • Study Timer & Quiz',
  description: 'Think deeper, remember longer.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} font-sans`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          <SessionProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
            </div>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
