'use client'

import { useState, useEffect } from 'react'
import FirstTimeSetup from './FirstTimeSetup'

interface SetupWrapperProps {
  children: React.ReactNode
}

export default function SetupWrapper({ children }: SetupWrapperProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if setup has been completed
    const setupComplete = localStorage.getItem('cerebryx-setup-complete')
    setShowSetup(!setupComplete)
    setIsLoaded(true)
  }, [])

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
