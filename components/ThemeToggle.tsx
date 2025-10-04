'use client'

import * as React from 'react'
import { Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      title="Dark mode only"
    >
      <Moon className="h-4 w-4" />
      <span className="sr-only">Dark mode only</span>
    </Button>
  )
}

