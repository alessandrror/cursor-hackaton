'use client'

import Link from 'next/link'
import { BookOpen, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xl font-bold transition-opacity hover:opacity-80"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cerebryx
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/study">
            <Button variant="ghost" size="sm">
              Get Started
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

