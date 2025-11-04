import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { ClarityProvider } from '@/providers/ClarityProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { Toaster } from '@/components/ui/toaster'
import AppLayout from '@/components/AppLayout'
import SetupWrapper from '@/components/setup/SetupWrapper'

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
        <ClarityProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <AuthProvider>
              <SessionProvider>
                <SidebarProvider>
                  <SetupWrapper>
                    <AppLayout>{children}</AppLayout>
                  </SetupWrapper>
                  <Toaster />
                </SidebarProvider>
              </SessionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClarityProvider>
      </body>
    </html>
  )
}

