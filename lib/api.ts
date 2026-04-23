// lib/api.ts — typed API client for the health research backend

import type {
  ChatRequest, ChatResponse,
  MultimodalAnalysis,
  ResearchReport,
  StreamEvent,
} from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Helpers ───────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${err}`)
  }
  return res.json()
}

// ── Chat (non-streaming) ──────────────────────────────────────────────────

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  return post('/api/chat', req)
}

// ── Streaming chat ────────────────────────────────────────────────────────

/**
 * Stream a chat response token-by-token.
 * Calls onToken for each text chunk, onDone when complete, onError on failure.
 */
export async function streamChat(
  req: ChatRequest,
  callbacks: {
    onToken: (text: string) => void
    onDone:  (meta: StreamEvent & { type: 'done' }) => void
    onError: (msg: string) => void
  },
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}/api/stream`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(req),
    signal,
  })

  if (!res.ok || !res.body) {
    callbacks.onError(`${res.status} ${res.statusText}`)
    return
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer    = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''   // keep incomplete last chunk in buffer

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      try {
        const event = JSON.parse(trimmed.slice(5).trim()) as StreamEvent
        if (event.type === 'token') callbacks.onToken(event.text)
        else if (event.type === 'done')  callbacks.onDone(event)
        else if (event.type === 'error') callbacks.onError(event.message)
      } catch {
        // Ignore malformed SSE lines
      }
    }
  }
}

// ── File upload ───────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<MultimodalAnalysis> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed ${res.status}: ${err}`)
  }
  return res.json()
}

// ── Deep research ─────────────────────────────────────────────────────────

export async function runResearch(
  query: string,
  mode: string = 'balanced',
  file_id?: string,
  session_id?: string,
): Promise<ResearchReport> {
  return post('/api/research', { query, mode, file_id: file_id ?? '', session_id: session_id ?? '' })
}

// ── Sources ───────────────────────────────────────────────────────────────

export async function getSources(): Promise<{ count: number; sources: string[]; total_chunks: number }> {
  const res = await fetch(`${BASE}/api/chat/sources`)
  return res.json()
}
