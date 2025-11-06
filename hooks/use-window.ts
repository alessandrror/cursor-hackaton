'use client'

import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
}

export function useWindow(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {
      return
    }

    // Function to update window size
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    updateWindowSize()

    // Add event listener for resize events
    window.addEventListener('resize', updateWindowSize)

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', updateWindowSize)
    }
  }, [])

  return windowSize
}

