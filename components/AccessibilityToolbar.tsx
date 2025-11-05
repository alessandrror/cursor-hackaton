'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import {
  Accessibility,
  Link as LinkIcon,
  Eye,
  Contrast,
  Palette,
  Type,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react'

export function AccessibilityToolbar() {
  const {
    state,
    increaseText,
    decreaseText,
    toggleUnderlineLinks,
    toggleGrayscale,
    toggleNegativeContrast,
    toggleSepia,
    reset,
  } = useAccessibility()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            aria-label="Herramientas de accesibilidad"
          >
            <Accessibility className="h-6 w-6 text-primary-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-card border-border"
          side="top"
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-semibold">
            Herramientas de accesibilidad
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Underline Links */}
          <DropdownMenuItem
            onClick={toggleUnderlineLinks}
            className="cursor-pointer"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>Subrayar enlaces</span>
            {state.underlineLinks && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          {/* Grayscale */}
          <DropdownMenuItem
            onClick={toggleGrayscale}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Escala de grises</span>
            {state.grayscale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          {/* Negative Contrast */}
          <DropdownMenuItem
            onClick={toggleNegativeContrast}
            className="cursor-pointer"
          >
            <Contrast className="mr-2 h-4 w-4" />
            <span>Contraste negativo</span>
            {state.negativeContrast && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          {/* Sepia */}
          <DropdownMenuItem onClick={toggleSepia} className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>Sepia</span>
            {state.sepia && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Increase Text */}
          <DropdownMenuItem onClick={increaseText} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Plus className="h-3 w-3" />
            </div>
            <span>A+ Aumentar texto</span>
          </DropdownMenuItem>

          {/* Decrease Text */}
          <DropdownMenuItem onClick={decreaseText} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Minus className="h-3 w-3" />
            </div>
            <span>A- Disminuir texto</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Reset */}
          <DropdownMenuItem
            onClick={reset}
            className="cursor-pointer !text-red-600 dark:!text-red-400 hover:!text-red-700 dark:hover:!text-red-300 focus:!text-red-600 dark:focus:!text-red-400"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Restablecer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

