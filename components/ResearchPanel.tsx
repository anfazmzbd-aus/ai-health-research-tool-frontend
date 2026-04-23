'use client'
import { useState } from 'react'
import type { ResearchReport } from '@/lib/types'
import { SourceCard } from './SourceCard'

interface Props { report: ResearchReport }

const GRADE = {
  high:   { bg: '#f0fdf4', color: '#15803d', border: '#86efac', dot: '#22c55e', label: 'High evidence' },
  medium: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', dot: '#f59e0b', label: 'Medium evidence' },
  low:    { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', dot: '#94a3b8', label: 'Low evidence' },
}
const CONF = {
  high:   { color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
  medium: { color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  low:    { color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
}

function Section({ title, badge, children, defaultOpen = true }: {
  title: string; badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{ background: open ? '#f8fafc' : '#fff' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{title}</span>
          {badge}
        </div>
        {/* Explicit width/height on SVG — no Tailwind w-/h- needed */}
        <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
             style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 border-t" style={{ borderColor: '#f1f5f9', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function ResearchPanel({ report }: Props) {
  const elapsed = (report.research_time_ms / 1000).toFixed(1)
  const conf = CONF[report.overall_confidence]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>
          {report.overall_confidence} confidence
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
          {elapsed}s · {report.total_sources_found} sources
        </span>
        {report.sources_searched.map(s => (
          <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide"
                style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>{s}</span>
        ))}
      </div>

      {/* Sub-questions */}
      {report.sub_questions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {report.sub_questions.map((q, i) => (
            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
              {q.length > 70 ? q.slice(0, 70) + '…' : q}
            </span>
          ))}
        </div>
      )}

      <Section title="Executive summary">
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{report.executive_summary}</p>
      </Section>

      {report.detailed_findings.length > 0 && (
        <Section title="Detailed findings">
          <div className="space-y-4">
            {report.detailed_findings.map((f, i) => {
              const g = GRADE[f.evidence_grade]
              return (
                <div key={i} className="pl-3" style={{ borderLeft: `2px solid ${g.dot}` }}>
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ background: g.bg, color: g.color, border: `1px solid ${g.border}` }}>
                      {g.label}
                    </span>
                    <p className="text-xs font-semibold" style={{ color: '#1e293b' }}>{f.question}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
                    {f.answer.slice(0, 400)}{f.answer.length > 400 ? '…' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {report.clinical_implications && (
        <Section title="Clinical implications">
          <div className="flex gap-3 p-3 rounded-lg" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm leading-relaxed" style={{ color: '#1d4ed8' }}>{report.clinical_implications}</p>
          </div>
        </Section>
      )}

      {report.limitations && (
        <Section title="Limitations & caveats" defaultOpen={false}>
          <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{report.limitations}</p>
        </Section>
      )}

      {report.all_citations.length > 0 && (
        <Section title="Sources" badge={
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
            {report.all_citations.length}
          </span>
        } defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.all_citations.map((c, i) => <SourceCard key={i} citation={c} index={i + 1} />)}
          </div>
        </Section>
      )}

      <p className="text-[10px] italic px-1" style={{ color: '#9ca3af' }}>{report.disclaimer}</p>
    </div>
  )
}
