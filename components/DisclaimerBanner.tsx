'use client'
export function DisclaimerBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
         style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"
           style={{ color: '#f59e0b', flexShrink: 0 }}>
        <path fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"/>
      </svg>
      <span style={{ color: '#78350f' }}>
        Educational purposes only — not medical advice. Consult a qualified healthcare professional.
      </span>
    </div>
  )
}
