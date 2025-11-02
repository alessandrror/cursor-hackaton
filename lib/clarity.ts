'use client'

/**
 * Track events with Microsoft Clarity
 * Only works if Clarity is initialized
 */
export function trackClarityEvent(eventName: string, data?: Record<string, string | number>) {
  if (typeof window === 'undefined') return

  const clarity = (window as any).clarity
  if (!clarity) return

  try {
    clarity('event', eventName, data)
  } catch (error) {
    // Silently fail if Clarity is not available
    // Error tracking failed
  }
}

/**
 * Predefined event names for consistency
 */
export const ClarityEvents = {
  // Session events
  SESSION_START: 'session_start',
  SESSION_COMPLETE: 'session_complete',
  
  // Document events
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_PASTE: 'document_paste',
  DOCUMENT_SAVE: 'document_save',
  
  // Quiz events
  QUIZ_GENERATE: 'quiz_generate',
  QUIZ_COMPLETE: 'quiz_complete',
  QUIZ_PAGE_CHANGE: 'quiz_page_change',
  
  // Authentication events
  AUTH_SIGNIN: 'auth_signin',
  AUTH_SIGNOUT: 'auth_signout',
  AUTH_SIGNUP: 'auth_signup',
  AUTH_GOOGLE: 'auth_google',
  AUTH_OTP: 'auth_otp',
  
  // Goals events
  GOAL_CREATE: 'goal_create',
  GOAL_UPDATE: 'goal_update',
  GOAL_COMPLETE: 'goal_complete',
  
  // Navigation events
  NAV_LANDING: 'nav_landing',
  NAV_STUDY: 'nav_study',
  NAV_SAVED: 'nav_saved',
  NAV_GOALS: 'nav_goals',
} as const

