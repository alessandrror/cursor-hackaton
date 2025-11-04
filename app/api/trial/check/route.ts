import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const TRIAL_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const { fingerprint } = await request.json()

    if (!fingerprint || typeof fingerprint !== 'string') {
      return NextResponse.json(
        { error: 'Invalid fingerprint' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get IP address from request headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check if record exists
    const { data: existing, error: selectError } = await supabase
      .from('anonymous_trial_usage')
      .select('usage_count')
      .eq('fingerprint', fingerprint)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is expected for new users
      console.error('Error checking trial usage:', selectError)
      // Fail open - allow access if check fails
      return NextResponse.json({
        remaining: TRIAL_LIMIT,
        hasAccess: true,
      })
    }

    const usageCount = existing?.usage_count || 0
    const remaining = Math.max(0, TRIAL_LIMIT - usageCount)
    const hasAccess = remaining > 0

    return NextResponse.json({
      remaining,
      hasAccess,
    })
  } catch (error) {
    console.error('Error in trial check:', error)
    // Fail open - allow access on error
    return NextResponse.json({
      remaining: TRIAL_LIMIT,
      hasAccess: true,
    })
  }
}


