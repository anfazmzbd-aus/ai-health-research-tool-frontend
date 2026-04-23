'use client'
import type { OutputMode } from '@/lib/types'

interface Props { value: OutputMode; onChange: (m: OutputMode) => void }

const MODES = [
  { value: 'patient'  as OutputMode, label: 'Patient',  color: '#10b981' },
  { value: 'balanced' as OutputMode, label: 'Balanced', color: '#3b82f6' },
  { value: 'clinical' as OutputMode, label: 'Clinical', color: '#8b5cf6' },
]

export function ModeToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
      {MODES.map((m) => {
        const active = value === m.value
        return (
          <button key={m.value} onClick={() => onChange(m.value)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.5)',
              border: active ? `1px solid ${m.color}55` : '1px solid transparent',
            }}>
            {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0, display: 'inline-block' }} />}
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
