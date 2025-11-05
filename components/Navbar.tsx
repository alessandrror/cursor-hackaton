'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/providers/AuthProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export default function Navbar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const isLandingPage = pathname === '/'

  if (isLandingPage) {
    return null // No navbar on landing page
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 transition-[left] duration-300',
        isCollapsed
          ? 'left-16'
          : 'left-16 md:left-64'
      )}
    >
      <nav className="flex h-16 items-center justify-between px-6 w-full">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold transition-opacity hover:opacity-80"
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cerebryx
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="!transition-none !duration-0"
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 !transition-none !duration-0"
              >
                <User className="h-4 w-4" />
                {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Guest User'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                Settings
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              )}
              {!user && (
                <DropdownMenuItem onClick={() => router.push('/auth')}>
                  Sign In
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
