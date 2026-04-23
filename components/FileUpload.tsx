'use client'
import { useCallback, useState } from 'react'
import type { MultimodalAnalysis } from '@/lib/types'
import { uploadFile } from '@/lib/api'

interface Props {
  onAnalysis: (a: MultimodalAnalysis) => void
  onClear: () => void
  currentAnalysis: MultimodalAnalysis | null
}

export function FileUpload({ onAnalysis, onClear, currentAnalysis }: Props) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null); setLoading(true)
    try { onAnalysis(await uploadFile(file)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Upload failed') }
    finally { setLoading(false) }
  }, [onAnalysis])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [handleFile])

  if (currentAnalysis) {
    const bad = currentAnalysis.abnormal_flags.length
    return (
      <div className="rounded-xl p-3"
           style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #86efac' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                 style={{ background: '#dcfce7', minWidth: '1.75rem' }}>
              <svg width="14" height="14" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold" style={{ color: '#15803d' }}>
                  {currentAnalysis.document_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                {bad > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {bad} abnormal
                  </span>
                )}
                {currentAnalysis.lab_findings.length > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                    {currentAnalysis.lab_findings.length} values
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: '#166534' }}>{currentAnalysis.summary}</p>
            </div>
          </div>
          <button onClick={onClear} className="p-1 rounded-lg transition-colors hover:bg-white shrink-0"
                  style={{ color: '#6b7280' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200"
             style={{
               background: dragging ? 'rgba(45,212,191,0.08)' : 'rgba(248,250,252,0.8)',
               border: `1.5px dashed ${dragging ? '#2dd4bf' : '#e2e8f0'}`,
               pointerEvents: loading ? 'none' : 'auto',
               opacity: loading ? 0.7 : 1,
             }}
             onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
             onDragLeave={() => setDragging(false)}
             onDrop={onDrop}>
        <input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.txt"
               disabled={loading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {loading ? (
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="spinner">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}/>
              <path fill="currentColor" style={{ opacity: 0.75 }}
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Analysing document…
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #ccfbf1, #dbeafe)' }}>
              <svg width="18" height="18" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: '#374151' }}>Drop a medical document</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>PDF · PNG · JPG · TXT · up to 20 MB</p>
            </div>
          </>
        )}
      </label>
      {error && <p className="text-xs mt-1.5 pl-1" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  )
}
