import React from 'react'

type CerebryxLogoProps = {
  className?: string
  title?: string
}

const CerebryxLogo: React.FC<CerebryxLogoProps> = ({ className, title = 'Cerebryx' }) => {
  return (
    <svg
      viewBox="0 0 80 80"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <path d="M40 15 Q50 25 40 35 Q30 25 40 15" fill="hsl(var(--primary))" fillOpacity="0.6"/>
      <path d="M40 35 Q50 45 40 55 Q30 45 40 35" fill="hsl(var(--secondary))" fillOpacity="0.6"/>
      <path d="M40 55 Q50 65 40 75 Q30 65 40 55" fill="hsl(var(--accent))" fillOpacity="0.6"/>
      <circle cx="40" cy="40" r="12" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
      <circle cx="40" cy="40" r="6" fill="hsl(var(--primary))"/>
    </svg>
  )
}

export default CerebryxLogo


