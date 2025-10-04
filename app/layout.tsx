import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study Timer & Quiz',
  description: 'A study timer with AI-generated quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning={true}>
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-950 to-zinc-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {children}
            </div>
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
