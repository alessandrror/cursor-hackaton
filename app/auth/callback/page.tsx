'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed) return
      setHasProcessed(true)

      try {
        // Check for error in URL
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          console.error('OAuth error:', error, errorDescription)
          toast({
            title: 'Authentication failed',
            description: errorDescription || 'Authentication failed',
            variant: 'destructive',
          })
          router.push('/auth')
          return
        }

        // Check for code in query params (PKCE flow)
        const code = searchParams.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            toast({
              title: 'Authentication failed',
              description: exchangeError.message,
              variant: 'destructive',
            })
            router.push('/auth')
            return
          }
          // Success - redirect to study page
          router.push('/study')
          return
        }

        // Check for hash fragments in URL (implicit flow)
        // Supabase client with detectSessionInUrl: true should handle this automatically
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          // Give Supabase time to process the hash and update session
          // The client should automatically handle this with detectSessionInUrl: true
          let attempts = 0
          const maxAttempts = 10
          const checkSession = setInterval(async () => {
            attempts++
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              clearInterval(checkSession)
              router.push('/study')
            } else if (attempts >= maxAttempts) {
              clearInterval(checkSession)
              toast({
                title: 'Authentication failed',
                description: 'Could not establish session',
                variant: 'destructive',
              })
              router.push('/auth')
            }
          }, 200)
          return
        }

        // Check if user already has a session (might have been redirected here manually)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/study')
          return
        }

        // No code, hash, or existing session - likely accessed directly
        // Silently redirect to auth page without showing error
        router.push('/auth')
      } catch (err) {
        console.error('Unexpected error:', err)
        toast({
          title: 'Authentication failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
        router.push('/auth')
      }
    }

    handleAuthCallback()
  }, [router, searchParams, toast, hasProcessed])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}

