'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import LandingNavbar from '@/components/LandingNavbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/auth'

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LandingNavbar />
        <main className="overflow-y-auto">{children}</main>
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-y-auto">
        <main>{children}</main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="ml-64 h-full flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

