'use client'
import type { ResearchDepth } from '@/lib/types'

interface Props { value: ResearchDepth; onChange: (d: ResearchDepth) => void; disabled?: boolean }

const DEPTHS = [
  { value: 'quick'  as ResearchDepth, label: 'Quick',  time: '~1s',  color: '#10b981' },
  { value: 'normal' as ResearchDepth, label: 'Normal', time: '~5s',  color: '#3b82f6' },
  { value: 'deep'   as ResearchDepth, label: 'Deep',   time: '~30s', color: '#8b5cf6' },
]

export function DepthToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1">
      {DEPTHS.map((d) => {
        const active = value === d.value
        return (
          <button key={d.value} onClick={() => !disabled && onChange(d.value)} disabled={disabled}
            title={`${d.label} — ${d.time}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: active ? `${d.color}18` : 'transparent',
              color: active ? d.color : '#94a3b8',
              border: `1px solid ${active ? d.color + '40' : 'transparent'}`,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}>
            {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />}
            {d.label}
            <span className="text-[10px]" style={{ opacity: 0.6 }}>{d.time}</span>
          </button>
        )
      })}
    </div>
  )
}
