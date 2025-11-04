'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/contexts/SidebarContext'

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
}: {
  isCollapsed: boolean
  toggleSidebar: () => void
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/study', label: 'Start Study', icon: BookOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card overflow-y-auto transition-[width] duration-300 overflow-x-hidden',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex items-center border-b">
          <div className="flex px-4 py-3.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-8 gap-3"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 flex-shrink-0" />
              ) : (
                <ChevronLeft className="h-5 w-5 flex-shrink-0" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex h-full">
          <div className="flex flex-col gap-y-2 px-4 py-3.5 w-full">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} className="w-full">
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'gap-3 !justify-start !px-2.5 transition-[max-width] duration-200 min-w-9 w-auto',
                      isCollapsed ? '!max-w-9 w-auto' : '!max-w-full w-full',
                      active && 'bg-secondary font-semibold'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={cn(
                        'transition-[opacity,max-width,overflow] duration-200 overflow-hidden whitespace-nowrap',
                        isCollapsed
                          ? 'max-w-0 opacity-0'
                          : 'max-w-xs opacity-100'
                      )}
                    >
                      {item.label}
                    </span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
