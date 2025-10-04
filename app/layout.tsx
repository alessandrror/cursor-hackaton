import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300','400','500','600','700'],
})

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
      <body className={`${spaceGrotesk.variable} font-sans`} suppressHydrationWarning={true}>
        <SessionProvider>
          <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
