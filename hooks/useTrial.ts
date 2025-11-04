'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { generateFingerprint } from '@/lib/fingerprint'
import { TrialStatus } from '@/types/trial'

const TRIAL_LIMIT = 3

export function useTrial() {
  const { user } = useAuth()
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    remaining: TRIAL_LIMIT,
    hasAccess: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Generate and cache fingerprint on mount
  useEffect(() => {
    let mounted = true

    async function initFingerprint() {
      try {
        const fp = await generateFingerprint()
        if (mounted) {
          setFingerprint(fp)
        }
      } catch (error) {
        console.error('Failed to generate fingerprint:', error)
      }
    }

    initFingerprint()

    return () => {
      mounted = false
    }
  }, [])

  // Check trial status
  const checkTrialStatus = useCallback(async (): Promise<TrialStatus> => {
    // Authenticated users have unlimited access
    if (user) {
      const status = {
        remaining: Infinity,
        hasAccess: true,
      }
      setTrialStatus(status)
      return status
    }

    // If fingerprint not ready, return default
    if (!fingerprint) {
      const status = {
        remaining: TRIAL_LIMIT,
        hasAccess: true,
      }
      setTrialStatus(status)
      return status
    }

    try {
      const response = await fetch('/api/trial/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint }),
      })

      if (!response.ok) {
        throw new Error('Failed to check trial status')
      }

      const data = await response.json()
      const status: TrialStatus = {
        remaining: data.remaining,
        hasAccess: data.hasAccess,
        fingerprint,
      }
      setTrialStatus(status)
      return status
    } catch (error) {
      console.error('Error checking trial status:', error)
      // Fail open - allow access on error
      const status = {
        remaining: TRIAL_LIMIT,
        hasAccess: true,
        fingerprint,
      }
      setTrialStatus(status)
      return status
    }
  }, [user, fingerprint])

  // Increment trial usage
  const incrementTrialUsage = useCallback(async (): Promise<void> => {
    // Don't increment for authenticated users
    if (user) {
      return
    }

    if (!fingerprint) {
      console.warn('Cannot increment trial usage: fingerprint not available')
      return
    }

    try {
      const response = await fetch('/api/trial/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint }),
      })

      if (!response.ok) {
        throw new Error('Failed to increment trial usage')
      }

      // Update local status after increment
      await checkTrialStatus()
    } catch (error) {
      console.error('Error incrementing trial usage:', error)
      // Silently fail - don't block user experience
    }
  }, [user, fingerprint, checkTrialStatus])

  // Check status on mount and when user/auth changes
  useEffect(() => {
    if (fingerprint !== null) {
      setIsLoading(true)
      checkTrialStatus().finally(() => {
        setIsLoading(false)
      })
    }
  }, [fingerprint, user, checkTrialStatus])

  return {
    trialStatus,
    checkTrialStatus,
    incrementTrialUsage,
    isLoading,
  }
}


