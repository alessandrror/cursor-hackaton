'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-2xl font-bold transition-opacity hover:opacity-80"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cerebryx
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/study">
            <Button
              variant={isActive('/study') ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'gap-2 transition-all',
                isActive('/study') && 'shadow-sm'
              )}
            >
              <BookOpen className="h-4 w-4" />
              Study
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={isActive('/history') ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'gap-2 transition-all',
                isActive('/history') && 'shadow-sm'
              )}
            >
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant={isActive('/settings') ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'gap-2 transition-all',
                isActive('/settings') && 'shadow-sm'
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

