'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilityState {
  textScale: number
  underlineLinks: boolean
  grayscale: boolean
  negativeContrast: boolean
  sepia: boolean
}

interface AccessibilityContextType {
  state: AccessibilityState
  increaseText: () => void
  decreaseText: () => void
  toggleUnderlineLinks: () => void
  toggleGrayscale: () => void
  toggleNegativeContrast: () => void
  toggleSepia: () => void
  reset: () => void
}

const defaultState: AccessibilityState = {
  textScale: 1,
  underlineLinks: false,
  grayscale: false,
  negativeContrast: false,
  sepia: false,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState(parsed)
      } catch (e) {
        // Invalid saved data, use defaults
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(state))
  }, [state])

  // Apply CSS classes to document based on state
  useEffect(() => {
    const html = document.documentElement

    // Remove all accessibility classes
    html.classList.remove(
      'accessibility-underline-links',
      'accessibility-grayscale',
      'accessibility-negative-contrast',
      'accessibility-sepia',
      'accessibility-text-scale-08',
      'accessibility-text-scale-09',
      'accessibility-text-scale-10',
      'accessibility-text-scale-11',
      'accessibility-text-scale-12',
      'accessibility-text-scale-13',
      'accessibility-text-scale-14',
      'accessibility-text-scale-15'
    )

    // Apply current state classes
    if (state.underlineLinks) {
      html.classList.add('accessibility-underline-links')
    }
    if (state.grayscale) {
      html.classList.add('accessibility-grayscale')
    }
    if (state.negativeContrast) {
      html.classList.add('accessibility-negative-contrast')
    }
    if (state.sepia) {
      html.classList.add('accessibility-sepia')
    }

    // Apply text scale
    const scaleClass = `accessibility-text-scale-${(state.textScale * 10).toFixed(0).padStart(2, '0')}`
    html.classList.add(scaleClass)
    html.style.setProperty('--text-scale', state.textScale.toString())
  }, [state])

  const increaseText = () => {
    setState((prev) => ({
      ...prev,
      textScale: Math.min(prev.textScale + 0.1, 1.5),
    }))
  }

  const decreaseText = () => {
    setState((prev) => ({
      ...prev,
      textScale: Math.max(prev.textScale - 0.1, 0.8),
    }))
  }

  const toggleUnderlineLinks = () => {
    setState((prev) => ({
      ...prev,
      underlineLinks: !prev.underlineLinks,
    }))
  }

  const toggleGrayscale = () => {
    setState((prev) => ({
      ...prev,
      grayscale: !prev.grayscale,
    }))
  }

  const toggleNegativeContrast = () => {
    setState((prev) => ({
      ...prev,
      negativeContrast: !prev.negativeContrast,
    }))
  }

  const toggleSepia = () => {
    setState((prev) => ({
      ...prev,
      sepia: !prev.sepia,
    }))
  }

  const reset = () => {
    setState(defaultState)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        state,
        increaseText,
        decreaseText,
        toggleUnderlineLinks,
        toggleGrayscale,
        toggleNegativeContrast,
        toggleSepia,
        reset,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

