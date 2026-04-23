'use client'
import type { Citation } from '@/lib/types'

interface Props { citation: Citation; index: number }

const SOURCE_STYLES: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  PUBMED:          { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  RAG:             { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', dot: '#8b5cf6' },
  TAVILY:          { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
  CLINICAL_TRIALS: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', dot: '#f97316' },
  DEFAULT:         { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
}

function getStyle(source: string) {
  return SOURCE_STYLES[source.toUpperCase()] ?? SOURCE_STYLES.DEFAULT
}

export function SourceCard({ citation, index }: Props) {
  const s = getStyle(citation.source)
  const pct = Math.round(citation.relevance_score * 100)
  const barColor = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e2e8f0'

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
         style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="h-0.5" style={{ background: s.dot }} />
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md mt-0.5 shrink-0"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            [{index}] {citation.source}
          </span>
        </div>
        <p className="text-xs font-medium leading-snug mb-2" style={{ color: '#1e293b' }}>
          {citation.title}
          {citation.year && <span className="ml-1.5 font-normal" style={{ color: '#94a3b8' }}>({citation.year})</span>}
        </p>
        {citation.chunk_preview && (
          <p className="text-[11px] leading-relaxed mb-2.5 line-clamp-2" style={{ color: '#64748b' }}>
            {citation.chunk_preview}
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full" style={{ background: '#f1f5f9' }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <span className="text-[10px] font-medium tabular-nums" style={{ color: '#94a3b8' }}>{pct}%</span>
        </div>
        {citation.url && (
          <a href={citation.url} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1 mt-2 text-[10px] truncate hover:underline"
             style={{ color: s.dot }}>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            {citation.url.replace(/^https?:\/\//, '').slice(0, 48)}
          </a>
        )}
      </div>
    </div>
  )
}
