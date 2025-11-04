'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import LandingNavbar from '@/components/LandingNavbar'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/auth'
  const { isCollapsed, toggleSidebar } = useSidebar()

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
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <Navbar isCollapsed={isCollapsed} />
      <main
        className={cn(
          'h-full flex flex-col transition-all duration-300',
          isCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
        )}
      >
        <div className="flex-1 pt-16">{children}</div>
      </main>
    </div>
  )
}

