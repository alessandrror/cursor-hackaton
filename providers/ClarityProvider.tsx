'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface ClarityProviderProps {
  children: React.ReactNode
  projectId?: string
}

export function ClarityProvider({ children, projectId }: ClarityProviderProps) {
  const clarityId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
  const [shouldLoad, setShouldLoad] = useState(false)

  // Only initialize Clarity in production environment
  const isProduction = process.env.NODE_ENV === 'production'
  const shouldInitialize = isProduction && clarityId

  useEffect(() => {
    // Wait for DOM and theme to be fully loaded before initializing Clarity
    // This ensures Clarity records with correct styles applied
    if (shouldInitialize) {
      // Wait for next tick to ensure theme is applied
      const timer = setTimeout(() => {
        setShouldLoad(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouldInitialize])

  return (
    <>
      {shouldLoad && clarityId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}
      {children}
    </>
  )
}
