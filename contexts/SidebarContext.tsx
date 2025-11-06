'use client'

import { useWindow } from '@/hooks/use-window'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  sidebarRef: React.RefObject<HTMLElement>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { width } = useWindow()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const prevWidthRef = useRef(width)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    try {
      if (width < 768) {
        setIsCollapsed(true)
        return
      }

      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error)
      if (width < 768) setIsCollapsed(true)
    }
  }, [])

  useEffect(() => {
    try {
      if (width >= 768) {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
      }
    } catch (error) {
      console.error('Failed to save sidebar state:', error)
    }
  }, [isCollapsed, width])


  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  useEffect(() => {
    const wasDesktop = prevWidthRef.current >= 768
    const isDesktop = width >= 768

    if (wasDesktop && !isDesktop) {
      sidebarRef.current?.classList.add('!transition-none', '!duration-0')
      setIsCollapsed(true)
      setTimeout(() => {
        sidebarRef.current?.classList.remove('!transition-none', '!duration-0')
      }, 1000)
    }

    prevWidthRef.current = width
  }, [width])

  useEffect(() => {
    if (width < 768) {
      if (!isCollapsed) {
        document.body.classList.add('!overflow-y-hidden')
      } else {
        document.body.classList.remove('!overflow-y-hidden')
      }
    } else if (width >= 768) {
      document.body.classList.remove('!overflow-y-hidden')
    }
  }, [width, isCollapsed])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, sidebarRef }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
