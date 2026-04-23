'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/lib/types'
import { SourceCard } from './SourceCard'
import { ResearchPanel } from './ResearchPanel'

interface Props { message: Message }

const CONF_STYLE = {
  high:   { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  medium: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  low:    { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
}

export function MessageBubble({ message }: Props) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end message-enter">
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
             style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', color: '#fff', boxShadow: '0 2px 8px rgba(13,148,136,0.3)' }}>
          {message.content}
        </div>
      </div>
    )
  }

  const conf = message.confidence ? CONF_STYLE[message.confidence as keyof typeof CONF_STYLE] ?? CONF_STYLE.medium : null

  return (
    <div className="flex gap-3 items-start message-enter">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
           style={{ background: 'linear-gradient(135deg, #0d9488, #3b82f6)', boxShadow: '0 2px 8px rgba(13,148,136,0.3)', minWidth: '2rem' }}>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fff' }}>
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm"
             style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {message.report ? (
            <ResearchPanel report={message.report} />
          ) : (
            <>
              <div className="prose prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.isStreaming && (
                <span className="inline-block ml-0.5 rounded animate-pulse-teal"
                      style={{ width: 2, height: 16, background: '#14b8a6', verticalAlign: 'text-bottom' }} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!message.isStreaming && (
          <div className="flex items-center gap-2.5 mt-1.5 px-1">
            {conf && message.confidence && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>
                {message.confidence}
              </span>
            )}
            {message.citations && message.citations.length > 0 && !message.report && (
              <button onClick={() => setShowSources(!showSources)}
                      className="flex items-center gap-1 text-[11px] transition-colors"
                      style={{ color: showSources ? '#0d9488' : '#94a3b8' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                {message.citations.length} source{message.citations.length !== 1 ? 's' : ''}
              </button>
            )}
            <span className="text-[10px]" style={{ color: '#cbd5e1' }} suppressHydrationWarning>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Source cards */}
        {showSources && message.citations && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
            {message.citations.map((c, i) => <SourceCard key={i} citation={c} index={i + 1} />)}
          </div>
        )}
      </div>
    </div>
  )
}
