import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'
import { Toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import CerebryxLogo from '@/components/branding/CerebryxLogo'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300','400','500','600','700'],
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
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans`} suppressHydrationWarning={true}>
        <SessionProvider>
          <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border/60">
              <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2">
                  <CerebryxLogo className="h-6 w-6" />
                  <span className="text-sm font-semibold tracking-wide">Cerebryx</span>
                </Link>
              </div>
            </header>
            <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
