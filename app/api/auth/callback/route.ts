import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    redirect(`/auth?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`)
  }

  if (!code) {
    console.error('No authorization code provided')
    redirect('/auth?error=missing_code&message=No authorization code provided')
  }

  try {
    const supabase = await createServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      redirect(`/auth?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`)
    }

    // Successfully authenticated, redirect to study page
    redirect('/study')
  } catch (err) {
    console.error('Unexpected error in callback:', err)
    redirect('/auth?error=unexpected&message=An unexpected error occurred')
  }
}

