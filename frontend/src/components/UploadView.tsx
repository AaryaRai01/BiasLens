import { useState, useRef } from 'react'

type Props = { onComplete: (data: any) => void }

export default function UploadView({ onComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setFileName(file.name)
    setIsLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/upload`, { method: 'POST', body: formData })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Upload failed')
      }
      const data = await res.json()
      onComplete({
        filename: data.filename,
        rows: data.rows,
        columns: data.columns,
        protectedAttribute: data.protected_attribute_detected,
        demographicParity: data.metrics.demographic_parity,
        equalizedOdds: data.metrics.demographic_parity,
        equalOpportunity: data.metrics.equal_opportunity,
        disparateImpact: data.metrics.disparate_impact,
        compliance: data.compliance,
        group_data: data.group_data,
        geminiNarrative: data.narrative,
      })
    } catch (e: any) {
      setError(e.message || 'Failed to process file')
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }} className="animate-fadeup">
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 14px', borderRadius: 999,
          backgroundColor: 'var(--accent-blue-light)', color: 'var(--accent-blue)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          BiasLens Audit Engine v2.1
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
          Upload Your Dataset
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Provide a model prediction dataset with protected attributes. BiasLens calculates fairness metrics and generates a comprehensive audit report.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-blue)' : 'var(--border-dark)'}`,
          borderRadius: 16,
          backgroundColor: isDragging ? 'var(--accent-blue-light)' : 'white',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
      >
        <div style={{
          width: 60, height: 60, borderRadius: 12,
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        {isLoading ? (
          <div>
            <div style={{
              width: 36, height: 36, border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent-blue)',
              borderRadius: '50%', margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Analysing <span style={{ color: 'var(--accent-blue)' }}>{fileName}</span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Running fairness algorithms…
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Drop dataset file here, or <span style={{ color: 'var(--accent-blue)' }}>browse</span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Supports CSV, JSON, Excel — max 50MB
            </p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8,
          backgroundColor: 'var(--accent-red-light)', border: '1px solid #fca5a5',
          color: 'var(--accent-red)', fontSize: 13, fontWeight: 500, marginBottom: 24,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { title: 'Required Columns', desc: 'prediction, label, and one protected attribute (gender, race, age)', icon: '≡' },
          { title: 'Supported Formats', desc: 'CSV, JSON, and Excel files with standard tabular structure', icon: '⬡' },
          { title: 'Privacy Safe', desc: 'All processing done server-side. No raw data is stored or transmitted.', icon: '⬡' },
        ].map(item => (
          <div key={item.title} className="panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {item.title}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Sample data button */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Don't have a dataset? Use our sample data to explore the tool.
        </p>
        <button
          onClick={async () => {
            const sampleRes = await fetch('/sample_data.json').catch(() => null)
            if (sampleRes) {
              const blob = await sampleRes.blob()
              const file = new File([blob], 'sample_data.json', { type: 'application/json' })
              processFile(file)
            } else {
              // Inline sample fallback
              const sample = JSON.stringify(
                Array.from({ length: 200 }, (_, i) => ({
                  gender: i % 3 === 0 ? 'Female' : 'Male',
                  age: 25 + (i % 40),
                  prediction: i % 5 === 0 ? 0 : 1,
                  label: i % 4 === 0 ? 0 : 1,
                })),
                null, 2
              )
              const file = new File([sample], 'sample_data.json', { type: 'application/json' })
              processFile(file)
            }
          }}
          className="btn btn-outline"
          style={{ fontSize: 12 }}
        >
          Load Sample Dataset
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
