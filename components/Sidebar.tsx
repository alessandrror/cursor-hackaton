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
    <>
      {/* Toggle Button */}
      <div
        className={cn(
          'flex items-center fixed top-0 left-0 z-20 h-[65px] border-b md:border-b-0 md:border-r md:bg-card bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:backdrop-blur-none md:supports-[backdrop-filter]:bg-transparent transition-[width] duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
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
      <aside
        className={cn(
          'fixed left-0 top-16 z-20 h-screen border-t md:border-t-0 md:border-r bg-card overflow-y-auto transition-[width] duration-300 overflow-x-hidden',
          isCollapsed ? 'w-0 md:w-16' : 'w-0 md:w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav
            className={cn(
              'h-full flex md:static fixed z-11 top-16 border-t md:top-0 w-full md:w-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:bg-transparent md:backdrop-blur-none md:supports-[backdrop-filter]:bg-transparent transition-[transform] duration-300 md:transition-noe md:duration-0',
              isCollapsed
                ? '-translate-x-full md:-translate-x-0'
                : 'translate-x-0'
            )}
          >
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
    </>
  )
}
