'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Message, OutputMode, ResearchDepth, MultimodalAnalysis, AppSettings } from '@/lib/types'
import { streamChat, runResearch } from '@/lib/api'
import { MessageBubble } from './MessageBubble'
import { ModeToggle } from './ModeToggle'
import { DepthToggle } from './DepthToggle'
import { FileUpload } from './FileUpload'
import { DisclaimerBanner } from './DisclaimerBanner'

const WELCOME: Message = {
  id: 'welcome', role: 'assistant', timestamp: new Date(),
  content: `**Welcome to MedResearch AI.**

I can help you with:
- **Health Q&A** — answers grounded in medical literature with citations
- **Lab report analysis** — upload a PDF or image to extract and explain values
- **Live research** — searches PubMed, ClinicalTrials.gov, and trusted health sources
- **Deep research** — generates a full evidence-graded research report

*Select your depth below, then ask me anything.*`,
}

const QUICK_PROMPTS = [
  'What are normal cholesterol levels?',
  'Explain type 2 diabetes management',
  'What do elevated liver enzymes mean?',
  'How do statins work?',
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #0d9488, #3b82f6)', boxShadow: '0 2px 12px rgba(13,148,136,0.4)', minWidth: '2rem' }}>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fff' }}>
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold leading-none" style={{ color: '#fff' }}>
          MedResearch <span style={{ color: '#2dd4bf' }}>AI</span>
        </p>
        <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Health Intelligence</p>
      </div>
    </div>
  )
}

export function ChatWindow() {
  const [messages, setMessages]         = useState<Message[]>([WELCOME])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [showUpload, setShowUpload]     = useState(false)
  const [fileAnalysis, setFileAnalysis] = useState<MultimodalAnalysis | null>(null)
  const [settings, setSettings]         = useState<AppSettings>({
    mode: 'balanced', depth: 'quick', sessionId: uuidv4(),
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const id = uuidv4()
    setMessages(p => [...p, { ...msg, id, timestamp: new Date() }])
    return id
  }
  const updateMessage = (id: string, patch: Partial<Message>) =>
    setMessages(p => p.map(m => m.id === id ? { ...m, ...patch } : m))

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput(''); setLoading(true)
    if (inputRef.current) inputRef.current.style.height = 'auto'
    addMessage({ role: 'user', content: msg })

    if (settings.depth === 'deep') {
      const aid = addMessage({ role: 'assistant', content: 'Running deep research pipeline… this takes 20–40 seconds.', isStreaming: true })
      try {
        const report = await runResearch(msg, settings.mode, fileAnalysis?.file_id, settings.sessionId)
        updateMessage(aid, { content: report.executive_summary, report, citations: report.all_citations, confidence: report.overall_confidence, isStreaming: false })
      } catch (e) {
        updateMessage(aid, { content: `Research failed: ${e instanceof Error ? e.message : 'Unknown error'}`, isStreaming: false })
      }
      setLoading(false); return
    }

    const aid = addMessage({ role: 'assistant', content: '', isStreaming: true })
    abortRef.current = new AbortController()
    let streamed = ''
    await streamChat(
      { session_id: settings.sessionId, message: msg, mode: settings.mode, depth: settings.depth, file_id: fileAnalysis?.file_id },
      {
        onToken: (t) => { streamed += t; updateMessage(aid, { content: streamed }) },
        onDone:  (e) => { updateMessage(aid, { content: e.meta.full_text, citations: e.meta.citations, confidence: e.meta.confidence, isStreaming: false }); setLoading(false) },
        onError: (e) => { updateMessage(aid, { content: `Error: ${e}`, isStreaming: false }); setLoading(false) },
      },
      abortRef.current.signal,
    )
    setLoading(false)
  }, [input, loading, settings, fileAnalysis])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleStop = () => {
    abortRef.current?.abort(); setLoading(false)
    setMessages(p => p.map(m => m.isStreaming ? { ...m, isStreaming: false } : m))
  }

  const msgCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="flex h-screen" style={{ background: '#f0f4f8' }}>

      {/* Sidebar */}
      <aside className="w-64 flex-col hidden md:flex sidebar-scroll"
             style={{ background: 'linear-gradient(180deg, #04081a 0%, #080d24 60%, #0d1535 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Logo />
        </div>

        {/* Stats */}
        <div className="p-4 space-y-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Messages', value: msgCount.toString() },
            { label: 'Knowledge base', value: '11 documents' },
            ...(fileAnalysis ? [{ label: 'File loaded', value: `${fileAnalysis.lab_findings.length} values` }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                 style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Mode */}
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Output mode</p>
          <ModeToggle value={settings.mode} onChange={(mode) => setSettings(s => ({ ...s, mode }))} />
        </div>

        {/* Quick prompts */}
        <div className="p-4 flex-1 overflow-y-auto sidebar-scroll">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Quick prompts</p>
          <div className="space-y-1">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => send(q)} disabled={loading}
                      className="w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all duration-150"
                      style={{ color: 'rgba(255,255,255,0.55)', background: 'transparent', border: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          MedResearch AI · v1.0 · Capstone
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 shrink-0"
                style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="md:hidden"><Logo /></div>
          <div className="hidden md:flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#f59e0b' : '#22c55e', display: 'inline-block' }} />
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>
              {loading ? 'Generating…' : 'Ready'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DepthToggle value={settings.depth} onChange={(depth) => setSettings(s => ({ ...s, depth }))} disabled={loading} />
            <button onClick={() => setShowUpload(!showUpload)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: showUpload || fileAnalysis ? 'linear-gradient(135deg, #ccfbf1, #dbeafe)' : '#f8fafc',
                      color: showUpload || fileAnalysis ? '#0d9488' : '#64748b',
                      border: `1px solid ${showUpload || fileAnalysis ? '#99f6e4' : '#e2e8f0'}`,
                    }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              {fileAnalysis ? 'File loaded' : 'Upload'}
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {showUpload && (
            <div className="max-w-lg mx-auto">
              <FileUpload
                onAnalysis={(a) => { setFileAnalysis(a); setShowUpload(false) }}
                onClear={() => setFileAnalysis(null)}
                currentAnalysis={fileAnalysis}
              />
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="px-5 py-4 shrink-0" style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <div className="space-y-3 max-w-4xl mx-auto">
            <DisclaimerBanner />
            <div className="flex gap-2 items-end p-2 rounded-2xl transition-all"
                 style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                 onFocusCapture={e => (e.currentTarget.style.borderColor = '#14b8a6')}
                 onBlurCapture={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
              <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                        placeholder="Ask a health question…" rows={1} disabled={loading}
                        className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
                        style={{ color: '#1e293b', maxHeight: '140px', fontFamily: 'DM Sans, sans-serif' }} />
              {loading ? (
                <button onClick={handleStop}
                        className="shrink-0 rounded-xl flex items-center justify-center transition-colors"
                        style={{ width: 36, height: 36, minWidth: 36, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 5.5A.5.5 0 016 5h8a.5.5 0 01.5.5v8a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-8z"/>
                  </svg>
                </button>
              ) : (
                <button onClick={() => send()} disabled={!input.trim()}
                        className="shrink-0 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          width: 36, height: 36, minWidth: 36,
                          background: input.trim() ? 'linear-gradient(135deg, #0d9488, #0891b2)' : '#f1f5f9',
                          color: input.trim() ? '#fff' : '#cbd5e1',
                          boxShadow: input.trim() ? '0 2px 8px rgba(13,148,136,0.3)' : 'none',
                        }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
