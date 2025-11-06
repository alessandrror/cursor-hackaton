'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import FirstTimeSetup from './FirstTimeSetup'

interface SetupWrapperProps {
  children: React.ReactNode
}

export default function SetupWrapper({ children }: SetupWrapperProps) {
  const pathname = usePathname()

  const [showSetup, setShowSetup] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if setup has been completed
    const setupComplete = localStorage.getItem('cerebryx-setup-complete')

    if (pathname === '/study') {
      setShowSetup(!setupComplete)
    } else {
      setShowSetup(false)
    }

    setIsLoaded(true)
  }, [pathname])

  const handleSetupComplete = () => {
    setShowSetup(false)
  }

  if (!isLoaded) {
    return null // Prevent hydration mismatch
  }

  return (
    <>
      {showSetup && <FirstTimeSetup onComplete={handleSetupComplete} />}
      {children}
    </>
  )
}
