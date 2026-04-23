// lib/types.ts — mirrors backend Pydantic models

export type OutputMode = 'patient' | 'clinical' | 'balanced'
export type ResearchDepth = 'quick' | 'normal' | 'deep'
export type FileType = 'pdf' | 'image' | 'text'
export type EvidenceGrade = 'high' | 'medium' | 'low'
export type WebSource = 'pubmed' | 'clinical_trials' | 'tavily'

// ── Chat ──────────────────────────────────────────────────────────────────

export interface ChatRequest {
  session_id?: string
  message: string
  mode?: OutputMode
  depth?: ResearchDepth
  file_id?: string
}

export interface Citation {
  source: string
  title: string
  url?: string
  year?: number
  relevance_score: number
  chunk_preview?: string
}

export interface ChatResponse {
  session_id: string
  answer: string
  citations: Citation[]
  confidence: 'high' | 'medium' | 'low'
  mode_used: OutputMode
  depth_used: ResearchDepth
  disclaimer: string
}

// ── SSE stream events ─────────────────────────────────────────────────────

export interface StreamTokenEvent {
  type: 'token'
  text: string
}

export interface StreamDoneEvent {
  type: 'done'
  meta: {
    session_id: string
    confidence: string
    mode: string
    citations: Citation[]
    full_text: string
  }
}

export interface StreamErrorEvent {
  type: 'error'
  message: string
}

export type StreamEvent = StreamTokenEvent | StreamDoneEvent | StreamErrorEvent

// ── Upload & multimodal ───────────────────────────────────────────────────

export interface LabFinding {
  test_name: string
  value: string
  unit?: string
  reference_range?: string
  status?: string
  flag: boolean
}

export interface MultimodalAnalysis {
  file_id: string
  file_type: FileType
  raw_text: string
  summary: string
  lab_findings: LabFinding[]
  abnormal_flags: string[]
  document_type: string
  confidence: string
  page_count: number
}

// ── Deep research ─────────────────────────────────────────────────────────

export interface GradedSource {
  citation: Citation
  sub_question: string
  relevance_score: number
  quality_score: number
  evidence_grade: EvidenceGrade
  grader_rationale?: string
}

export interface SubQuestionAnswer {
  question: string
  answer: string
  sources_used: string[]
  evidence_grade: EvidenceGrade
}

export interface ResearchReport {
  session_id: string
  original_query: string
  sub_questions: string[]
  executive_summary: string
  detailed_findings: SubQuestionAnswer[]
  clinical_implications: string
  limitations: string
  all_citations: Citation[]
  graded_sources: GradedSource[]
  overall_confidence: 'high' | 'medium' | 'low'
  sources_searched: string[]
  total_sources_found: number
  research_time_ms: number
  mode_used: OutputMode
  disclaimer: string
}

// ── UI state ──────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  confidence?: string
  isStreaming?: boolean
  report?: ResearchReport
  fileAnalysis?: MultimodalAnalysis
  timestamp: Date
}

export interface AppSettings {
  mode: OutputMode
  depth: ResearchDepth
  sessionId: string
}
