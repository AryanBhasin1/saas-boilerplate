'use client'
// components/document-manager.tsx
import { useState, useCallback } from 'react'
import { FileText, Upload, Trash2, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Doc {
  id: string; name: string; size: number
  status: string; createdAt: string
  _count?: { chunks: number }
}

const StatusDot = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    READY:      { color: 'var(--green)', icon: <CheckCircle size={13} /> },
    FAILED:     { color: 'var(--red)',   icon: <XCircle size={13} /> },
    PROCESSING: { color: 'var(--amber)', icon: <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> },
    PENDING:    { color: 'var(--fg-subtle)', icon: <Clock size={13} /> },
  }
  const s = map[status] ?? map.PENDING
  return <span style={{ color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}>{s.icon}</span>
}

const fmt = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`

export function DocumentManager({ initialDocuments }: { initialDocuments: Doc[] }) {
  const [docs, setDocs] = useState<Doc[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') { alert('Only PDF files are supported.'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      const doc = await res.json()
      if (!res.ok) throw new Error(doc.error)
      setDocs(p => [doc, ...p])
    } catch (e) {
      alert(`Upload failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally { setUploading(false) }
  }, [])

  const del = async (id: string) => {
    if (!confirm('Delete this document and all its embeddings?')) return
    const res = await fetch('/api/documents', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setDocs(p => p.filter(d => d.id !== id))
  }

  return (
    <div style={{ maxWidth: 760 }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--amber-dim)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '48px 32px',
          textAlign: 'center',
          background: dragOver ? 'var(--amber-glow)' : 'var(--bg-card)',
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          {uploading
            ? <Loader2 size={20} color="var(--amber)" style={{ animation: 'spin 1s linear infinite' }} />
            : <Upload size={20} color="var(--fg-muted)" />
          }
        </div>

        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>
          {uploading ? 'Processing & embedding…' : 'Drop a PDF here'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--fg-subtle)', marginBottom: 20 }}>PDF only · up to 10 MB</p>

        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 20px', borderRadius: 'var(--radius)',
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          color: 'var(--fg-muted)', fontSize: 13, fontWeight: 500,
          cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1,
          transition: 'border-color 0.15s, color 0.15s',
        }}>
          <Upload size={13} /> Browse files
          <input type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
            disabled={uploading} />
        </label>
      </div>

      {/* List */}
      {docs.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {docs.map((doc, i) => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < docs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={16} color="var(--red)" />
              </div>

              {/* Meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 2 }}>
                  {fmt(doc.size)}{doc._count?.chunks ? ` · ${doc._count.chunks} chunks` : ''} · {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Status + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <StatusDot status={doc.status} />
                <span style={{ fontSize: 12, color: 'var(--fg-subtle)', textTransform: 'capitalize' }}>
                  {doc.status.toLowerCase()}
                </span>
                <button onClick={() => del(doc.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--fg-subtle)', padding: 4, borderRadius: 6,
                  display: 'flex', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <p style={{ textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13, paddingTop: 8 }}>
          No documents yet.
        </p>
      )}
    </div>
  )
}
