import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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
      null

    // Check if record exists
    const { data: existing, error: selectError } = await supabase
      .from('anonymous_trial_usage')
      .select('id, usage_count')
      .eq('fingerprint', fingerprint)
      .single()

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('anonymous_trial_usage')
        .update({
          usage_count: existing.usage_count + 1,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating trial usage:', updateError)
        return NextResponse.json(
          { error: 'Failed to update usage' },
          { status: 500 }
        )
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('anonymous_trial_usage')
        .insert({
          fingerprint,
          ip_address: ipAddress,
          usage_count: 1,
          last_used_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error creating trial usage record:', insertError)
        return NextResponse.json(
          { error: 'Failed to create usage record' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in trial increment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


