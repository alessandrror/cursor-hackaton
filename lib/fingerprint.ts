'use client'

/**
 * Generates a stable browser fingerprint for anonymous user tracking.
 * Uses a combination of browser characteristics that persist across sessions.
 */
export async function generateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return ''
  }

  const components: string[] = []

  // User agent
  components.push(navigator.userAgent || '')

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`)

  // Color depth
  components.push(`${window.screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language || '')

  // Canvas fingerprint (basic hash)
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Fingerprint', 2, 2)
      const canvasData = canvas.toDataURL()
      components.push(canvasData.substring(0, 50)) // Use first 50 chars as hash
    }
  } catch (e) {
    // Canvas fingerprinting blocked, continue without it
  }

  // Hardware concurrency
  components.push(`${navigator.hardwareConcurrency || 0}`)

  // Platform
  components.push(navigator.platform || '')

  // Combine all components
  const combined = components.join('|')

  // Generate hash (simple hash function)
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(8, '0')
}


