'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="flex items-center justify-between my-8 max-w-4xl mx-auto">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
        <BookOpen className="h-6 w-6" />
        <span>Study Timer & Quiz</span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/history">
          <Button
            variant={isActive('/history') ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </Link>
        <Link href="/settings">
          <Button
            variant={isActive('/settings') ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </nav>
  )
}

