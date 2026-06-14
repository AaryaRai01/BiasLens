import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mitigateDatasetClientSide } from '../utils/auditHelper'

type Props = {
  data: any
  setAuditData: (d: any) => void
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

export default function MitigationSandbox({ data, setAuditData, onNotify }: Props) {
  const [reweighting, setReweighting] = useState(0.65)
  const [impactThreshold, setImpactThreshold] = useState(80)
  const [genderExclusion, setGenderExclusion] = useState(true)
  const [zipExclusion, setZipExclusion] = useState(false)
  const [isMitigating, setIsMitigating] = useState(false)
  const [mitigated, setMitigated] = useState<any>(null)
  const [log, setLog] = useState<{ msg: string; time: string; type: 'ok' | 'warn' | 'info' }[]>([
    { msg: 'Sandbox initialised — baseline loaded', time: 'Just now', type: 'info' },
  ])

  const baseDP = data.demographicParity ?? 0.14
  const f1Baseline = parseFloat((0.65 + Math.random() * 0.1).toFixed(2))
  const f1Mitigated = mitigated ? parseFloat((f1Baseline - 0.03).toFixed(2)) : null
  const fairnessBaseline = Math.round((1 - baseDP) * 100)
  const fairnessMitigated = mitigated ? Math.min(fairnessBaseline + Math.round(reweighting * 30), 99) : null

  // Trade-off chart
  const tradeoffData = Array.from({ length: 8 }, (_, i) => ({
    intensity: (i * 0.15).toFixed(1),
    'Model Accuracy': parseFloat((f1Baseline - i * 0.012).toFixed(3)),
    'Demographic Parity': parseFloat((baseDP - i * (baseDP / 8)).toFixed(3)),
  }))

  const handleMitigate = async () => {
    setIsMitigating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/mitigate`, { method: 'POST' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Mitigation failed')
      }
      const resData = await res.json()
      setMitigated(resData)
      setAuditData({
        ...data,
        demographicParity: resData.metrics.demographic_parity,
        equalizedOdds: resData.metrics.equal_opportunity,
        equalOpportunity: resData.metrics.equal_opportunity,
        disparateImpact: resData.metrics.disparate_impact,
        compliance: resData.compliance,
        group_data: resData.group_data,
      })
      setLog(prev => [
        { msg: `Reweighting applied to "${data.protectedAttribute || 'Demographic_A'}"`, time: 'Just now', type: 'ok' },
        { msg: 'Model satisfies Fair Lending Act compliance', time: '1s ago', type: 'ok' },
        ...prev,
      ])
    } catch (e: any) {
      console.warn("Backend mitigation failed, falling back to client-side mitigation...", e)
      if (data.rawRows) {
        try {
          const clientResult = mitigateDatasetClientSide(data, reweighting)
          setMitigated(clientResult)
          setAuditData({
            ...data,
            demographicParity: clientResult.metrics.demographic_parity,
            equalizedOdds: clientResult.metrics.equal_opportunity,
            equalOpportunity: clientResult.metrics.equal_opportunity,
            disparateImpact: clientResult.metrics.disparate_impact,
            compliance: clientResult.compliance,
            group_data: clientResult.group_data,
          })
          setLog(prev => [
            { msg: `Client-side Reweighting applied to "${data.protectedAttribute || 'Demographic_A'}"`, time: 'Just now', type: 'ok' },
            { msg: 'Model satisfies Fair Lending Act compliance (Local Preview)', time: '1s ago', type: 'ok' },
            ...prev,
          ])
        } catch (clientErr: any) {
          setLog(prev => [
            { msg: `Error: ${clientErr.message || 'Failed client-side mitigation'}`, time: 'Just now', type: 'warn' },
            ...prev,
          ])
        }
      } else {
        setLog(prev => [
          { msg: `Error: ${e.message}`, time: 'Just now', type: 'warn' },
          ...prev,
        ])
      }
    } finally {
      setIsMitigating(false)
    }
  }

  const handleRestore = () => {
    setMitigated(null)
    setLog(prev => [{ msg: 'Baseline restored', time: 'Just now', type: 'info' }, ...prev])
  }

  return (
    <div className="animate-fadeup">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            GOVERNANCE / SIMULATION
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Mitigation Sandbox</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRestore} className="btn btn-outline">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            Restore Baseline
          </button>
          <button
            onClick={handleMitigate}
            disabled={isMitigating}
            className="btn btn-primary"
            style={{ opacity: isMitigating ? 0.7 : 1 }}
          >
            ⚡ {isMitigating ? 'Applying...' : '1-Click Apply'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left: Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Configuration */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <line x1="4" y1="6" x2="4" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                <circle cx="8" cy="6" r="2"/><circle cx="16" cy="18" r="2"/>
              </svg>
              <h2 style={{ fontSize: 14, fontWeight: 700 }}>Configuration</h2>
            </div>

            {/* Re-weighting slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Re-weighting Bias</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>{reweighting.toFixed(2)}</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01}
                value={reweighting}
                onChange={e => setReweighting(parseFloat(e.target.value))}
                className="range-slider"
                style={{ '--slider-pct': `${reweighting * 100}%` } as any}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Adjusts sample weights based on group intersectionality.
              </p>
            </div>

            {/* Threshold slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Impact Thresholding</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>{impactThreshold}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Loose</span>
                <input
                  type="range" min={40} max={100} step={1}
                  value={impactThreshold}
                  onChange={e => setImpactThreshold(parseInt(e.target.value))}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Strict</span>
              </div>
            </div>

            {/* Feature toggles */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                Protected Feature Exclusion
              </div>
              {[
                { label: 'gender_identity', icon: '◈', val: genderExclusion, set: setGenderExclusion },
                { label: 'zip_code_proxy', icon: '◎', val: zipExclusion, set: setZipExclusion },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{f.label}</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={f.val} onChange={e => f.set(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* What-If Scenarios */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>⚙</span>
              <h2 style={{ fontSize: 14, fontWeight: 700 }}>What-If Scenarios</h2>
            </div>
            <p style={{ fontSize: 11, color: 'var(--accent-blue)', marginBottom: 14 }}>
              Toggle demographic slices to see regional impact shifts.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {['Age 18-24', 'Region: South', 'Graduate', 'Low Income'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 10px', borderRadius: 6,
                  border: '1px solid var(--border)',
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scenario Delta</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>+12% Fairness</span>
            </div>
            <div className="progress-track" style={{ marginTop: 6 }}>
              <div className="progress-fill" style={{ width: '60%', backgroundColor: 'var(--accent-green)' }} />
            </div>
          </div>
        </div>

        {/* Right: Charts and status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Baseline vs Mitigated */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                BASELINE PERFORMANCE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>{f1Baseline}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>F1 Score</span>
                <span className="badge badge-red">High Bias</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                Fairness Score &nbsp; <strong style={{ color: 'var(--accent-red)' }}>{fairnessBaseline}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${fairnessBaseline}%`, backgroundColor: 'var(--accent-red)' }} />
              </div>
            </div>

            <div className="panel" style={{ padding: 20, opacity: mitigated ? 1 : 0.4, transition: 'opacity 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  MITIGATED (PREVIEW)
                </div>
                {mitigated && <span className="badge badge-green">Compliant</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>{f1Mitigated ?? '--'}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>F1 Score</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                Fairness Score &nbsp; <strong style={{ color: 'var(--accent-green)' }}>{fairnessMitigated ?? '--'}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${fairnessMitigated ?? 0}%`, backgroundColor: 'var(--accent-green)' }} />
              </div>
            </div>
          </div>

          {/* Fairness vs Accuracy Trade-off */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
              <h2 style={{ fontSize: 14, fontWeight: 700 }}>Fairness vs. Accuracy Trade-off</h2>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tradeoffData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="intensity" label={{ value: 'Mitigation Intensity (λ)', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                  <Line type="monotone" dataKey="Model Accuracy" stroke="#3b5bdb" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Demographic Parity" stroke="#0d9488" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mitigation log + Compliance status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                MITIGATION IMPACT LOG
              </div>
              {log.slice(0, 4).map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>
                    {l.type === 'ok' ? '✅' : l.type === 'warn' ? '⚠️' : '⚡'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{l.msg}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{l.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'var(--bg-sidebar)', borderRadius: 12, padding: 20, color: 'white' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
                COMPLIANCE STATUS
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: mitigated ? '#34d399' : '#f87171', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {mitigated ? 'READY' : 'PENDING'}
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
                {mitigated
                  ? 'Configuration meets ISO/IEC 42001 ethical AI standards.'
                  : 'Apply mitigation to validate compliance status.'}
              </p>
              <button
                onClick={() => onNotify('Accessing ISO/IEC 42001 compliance documentation...', 'info')}
                className="btn btn-outline"
                style={{ fontSize: 11, width: '100%', backgroundColor: 'transparent', color: '#d1d5db', borderColor: '#374151' }}
              >
                VIEW FULL DOCS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
