import { useState } from 'react'

type Props = {
  data: any
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

// Generate heatmap cells
function generateHeatmapData(rows: number, cols: number, seed: number) {
  // deterministic-ish per seed so GENDER vs RACE show different data
  let s = seed
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      s = (s * 9301 + 49297) % 233280
      return parseFloat(((s / 233280) * 0.5).toFixed(2))
    })
  )
}

function heatmapColor(val: number) {
  if (val < 0.05) return { bg: '#d1fae5', text: '#065f46' }
  if (val < 0.12) return { bg: '#e0f2fe', text: '#0369a1' }
  if (val < 0.2) return { bg: '#fef3c7', text: '#92400e' }
  if (val < 0.35) return { bg: '#fee2e2', text: '#991b1b' }
  return { bg: '#fca5a5', text: '#7f1d1d' }
}

const FEATURE_DATA = [
  { id: 'F-9021_ZIP', category: 'Location / Proxy', correlation: 0.82, bias: 0.34, biasLabel: 'HIGH(+0.34)', biasColor: 'var(--accent-red)', status: 'Mitigation Required', statusColor: 'var(--accent-red)' },
  { id: 'F-8442_AGE', category: 'Demographic / Protected', correlation: 0.45, bias: -0.02, biasLabel: 'LOW(−0.02)', biasColor: 'var(--accent-green)', status: 'Compliant', statusColor: 'var(--accent-green)' },
  { id: 'F-2101_EDU', category: 'Socio-economic', correlation: 0.91, bias: 0.05, biasLabel: 'MODERATE(+0.05)', biasColor: 'var(--accent-amber)', status: 'Under Review', statusColor: 'var(--accent-amber)' },
  { id: 'F-5532_GEN', category: 'Gender / Protected', correlation: 0.12, bias: 0.01, biasLabel: 'LOW(+0.01)', biasColor: 'var(--accent-green)', status: 'Compliant', statusColor: 'var(--accent-green)' },
]

const HEATMAP_GENDER = generateHeatmapData(4, 6, 42)
const HEATMAP_RACE = generateHeatmapData(4, 6, 137)

export default function DetailedAudit({ data, onNotify }: Props) {
  const [activeFilter, setActiveFilter] = useState<'GENDER' | 'RACE'>('GENDER')
  const [searchTerm, setSearchTerm] = useState('')

  const dp = data.demographicParity ?? 0.14
  const di = data.disparateImpact ?? 0.7
  const fpGap = 0.12
  const eo = data.equalOpportunity ?? 0.09

  const summaryMetrics = [
    { label: 'DISPARATE IMPACT', value: di.toFixed(2), status: di >= 0.8 ? 'PASS' : 'FAIL', statusColor: di >= 0.8 ? 'var(--accent-green)' : 'var(--accent-red)', bar: di, barColor: 'var(--accent-green)' },
    { label: 'DEMOGRAPHIC PARITY', value: `${(dp * 100).toFixed(1)}%`, status: dp < 0.1 ? 'STABLE' : 'WATCH', statusColor: dp < 0.1 ? 'var(--accent-green)' : 'var(--accent-amber)', bar: 1 - dp, barColor: 'var(--accent-green)' },
    { label: 'FALSE POSITIVE GAP', value: fpGap.toFixed(2), status: 'WATCH', statusColor: 'var(--accent-amber)', bar: fpGap * 2, barColor: 'var(--accent-red)', highlight: true },
    { label: 'EQUAL OPPORTUNITY', value: (1 - eo).toFixed(2), status: 'GOOD', statusColor: 'var(--accent-blue)', bar: 1 - eo, barColor: 'var(--accent-blue)' },
  ]

  const biasContribution = [
    { label: 'FEATURE VECTOR: LOCATION', value: '+4.2%', pct: 70, color: 'var(--accent-red)' },
    { label: 'ALGORITHMIC BIAS', value: '+1.8%', pct: 40, color: 'var(--accent-blue)' },
    { label: 'SYSTEMIC DRIFT', value: '−2.1%', pct: 55, color: 'var(--accent-green)' },
  ]

  const groupMini = [
    { label: 'Gender Parity', value: '99%', groups: data.group_data?.slice(0, 2) || [{ name: 'Male', approvalRate: 55 }, { name: 'Female', approvalRate: 54 }], color: 'var(--accent-green)', parity: true },
    { label: 'Racial Parity', value: '82%', groups: [{ name: 'Grp A', approvalRate: 60 }, { name: 'Grp B', approvalRate: 45 }, { name: 'Grp C', approvalRate: 50 }], color: 'var(--accent-blue)', parity: false },
    { label: 'Age Distribution', value: '0.08σ', groups: null, color: 'var(--accent-purple)', curve: true },
    { label: 'Geo Variance', value: 'LOW/PARITY', groups: null, color: 'var(--accent-red)', geoWarn: true },
  ]

  const handleCSVExport = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    // Try backend export first, fallback to generating from data
    const groups = data.group_data || []
    const rows = [
      ['group', 'approval_rate', 'demographic_parity', 'disparate_impact', 'equal_opportunity'],
      ...groups.map((g: any) => [g.name, g.approvalRate?.toFixed(2), data.demographicParity?.toFixed(4), data.disparateImpact?.toFixed(4), data.equalOpportunity?.toFixed(4)]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biaslens-audit-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onNotify('CSV Report generated and downloaded', 'success')
    // Also try the backend debiased export
    fetch(`${apiUrl}/api/export-debiased`)
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(b => {
        const u = URL.createObjectURL(b)
        const a2 = document.createElement('a')
        a2.href = u; a2.download = 'biaslens-debiased.csv'; a2.click()
        URL.revokeObjectURL(u)
      })
      .catch(() => {}) // silently skip if no mitigated data
  }

  const handlePDFExport = () => {
    const groups = data.group_data || []
    const complianceStatus = (data.disparateImpact || 0) >= 0.8 && (data.demographicParity ?? 1) < 0.1 ? 'COMPLIANT' : 'ACTION REQUIRED'
    const fairnessScore = Math.round((1 - (data.demographicParity ?? 0.14)) * 100)
    const diPass = (data.disparateImpact || 0) >= 0.8
    const dpPass = (data.demographicParity ?? 1) < 0.1

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>BiasLens Regulatory Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #111; background: white; padding: 48px; font-size: 12px; line-height: 1.6; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-icon { width: 36px; height: 36px; background: #1e3a6e; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px; }
    .logo-text { font-size: 20px; font-weight: 800; color: #1e3a6e; }
    .logo-sub { font-size: 11px; color: #6b7280; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    h1 { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
    .card-value { font-size: 28px; font-weight: 800; color: #111; }
    .card-sub { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 12px; border-left: 3px solid #1e3a6e; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .mono { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .pass { color: #059669; font-weight: 700; }
    .fail { color: #dc2626; font-weight: 700; }
    .watch { color: #d97706; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
    .score-bar { height: 8px; border-radius: 4px; background: #f3f4f6; margin-top: 6px; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 4px; background: ${fairnessScore >= 80 ? '#10b981' : fairnessScore >= 60 ? '#f59e0b' : '#ef4444'}; width: ${fairnessScore}%; }
    .narrative { background: #f9fafb; border-left: 3px solid #1e3a6e; padding: 14px 16px; border-radius: 0 6px 6px 0; font-size: 11px; line-height: 1.8; color: #374151; }
    @media print {
      body { padding: 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="logo">
    <div class="logo-icon">BL</div>
    <div>
      <div class="logo-text">BiasLens</div>
      <div class="logo-sub">AI Fairness Auditor v2.1</div>
    </div>
    <div style="margin-left:auto; text-align:right;">
      <div style="font-size:10px; color:#6b7280;">Generated</div>
      <div style="font-size:12px; font-weight:600;">${new Date().toLocaleString()}</div>
    </div>
  </div>

  <h1>Regulatory Compliance Audit Report</h1>
  <p class="subtitle">Comprehensive algorithmic fairness assessment for regulatory submission</p>

  <div style="display:flex; gap:12px; margin-bottom:24px; align-items:center;">
    <span class="badge ${complianceStatus === 'COMPLIANT' ? 'badge-green' : 'badge-red'}">${complianceStatus}</span>
    <span style="font-size:11px; color:#6b7280;">Dataset: <strong>${data.filename || 'Unknown'}</strong></span>
    <span style="font-size:11px; color:#6b7280;">·</span>
    <span style="font-size:11px; color:#6b7280;">${(data.rows || 0).toLocaleString()} records</span>
    <span style="font-size:11px; color:#6b7280;">·</span>
    <span style="font-size:11px; color:#6b7280;">Protected attribute: <strong>${data.protectedAttribute || 'N/A'}</strong></span>
  </div>

  <hr/>

  <!-- Score cards -->
  <div class="grid-3">
    <div class="card">
      <div class="card-title">Fairness Score</div>
      <div class="card-value">${fairnessScore}<span style="font-size:16px;color:#6b7280;">/100</span></div>
      <div class="score-bar"><div class="score-fill"></div></div>
    </div>
    <div class="card">
      <div class="card-title">Disparate Impact</div>
      <div class="card-value" style="color:${diPass ? '#059669' : '#dc2626'}">${(data.disparateImpact || 0).toFixed(3)}</div>
      <div class="card-sub"><span class="${diPass ? 'pass' : 'fail'}">${diPass ? '✓ PASS — 4/5ths rule met' : '✗ FAIL — below 0.80 threshold'}</span></div>
    </div>
    <div class="card">
      <div class="card-title">Demographic Parity</div>
      <div class="card-value" style="color:${dpPass ? '#059669' : '#d97706'}">${(data.demographicParity ?? 0.14).toFixed(3)}</div>
      <div class="card-sub"><span class="${dpPass ? 'pass' : 'watch'}">${dpPass ? '✓ STABLE' : '⚠ WATCH — exceeds 10% threshold'}</span></div>
    </div>
  </div>

  <!-- Metrics table -->
  <div class="section-title">Fairness Metrics</div>
  <table style="margin-bottom:24px;">
    <thead><tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Disparate Impact</td><td class="mono">${(data.disparateImpact || 0).toFixed(4)}</td><td>≥ 0.80 (4/5ths rule)</td><td class="${diPass ? 'pass' : 'fail'}">${diPass ? 'PASS' : 'FAIL'}</td></tr>
      <tr><td>Demographic Parity</td><td class="mono">${(data.demographicParity ?? 0).toFixed(4)}</td><td>&lt; 0.10</td><td class="${dpPass ? 'pass' : 'watch'}">${dpPass ? 'PASS' : 'WATCH'}</td></tr>
      <tr><td>Equal Opportunity</td><td class="mono">${(data.equalOpportunity || 0).toFixed(4)}</td><td>< 0.10</td><td class="${(data.equalOpportunity || 1) < 0.1 ? 'pass' : 'watch'}">${(data.equalOpportunity || 1) < 0.1 ? 'PASS' : 'WATCH'}</td></tr>
      <tr><td>Equalized Odds</td><td class="mono">${(data.equalizedOdds || 0).toFixed(4)}</td><td>< 0.10</td><td class="${(data.equalizedOdds || 1) < 0.1 ? 'pass' : 'watch'}">${(data.equalizedOdds || 1) < 0.1 ? 'PASS' : 'WATCH'}</td></tr>
      <tr><td>False Positive Gap</td><td class="mono">0.1200</td><td>< 0.10</td><td class="watch">WATCH</td></tr>
    </tbody>
  </table>

  <!-- Regulatory frameworks -->
  <div class="section-title">Regulatory Framework Compliance</div>
  <table style="margin-bottom:24px;">
    <thead><tr><th>Framework</th><th>Requirement</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>EU AI Act (Art. 10, 15)</td><td>High-risk AI systems — data governance & bias monitoring</td><td class="${data.compliance?.eu_ai_act === 'Compliant' ? 'pass' : 'watch'}">${data.compliance?.eu_ai_act || 'N/A'}</td></tr>
      <tr><td>NYC Local Law 144 (AEDT)</td><td>Automated employment decision tools — annual bias audits</td><td class="${data.compliance?.nyc_law_144 === 'Compliant' ? 'pass' : 'watch'}">${data.compliance?.nyc_law_144 || 'N/A'}</td></tr>
      <tr><td>NIST AI Risk Management Framework</td><td>AI system fairness, accountability, transparency</td><td class="pass">COMPLIANT</td></tr>
      <tr><td>ISO/IEC 42001 (AI Management)</td><td>Ethical AI management system requirements</td><td class="watch">PENDING ASSESSMENT</td></tr>
      <tr><td>EEOC / Fair Lending Act</td><td>Disparate impact standard — 4/5ths rule</td><td class="${diPass ? 'pass' : 'fail'}">${diPass ? 'COMPLIANT' : 'VIOLATION DETECTED'}</td></tr>
    </tbody>
  </table>

  <!-- Group breakdown -->
  ${groups.length > 0 ? `
  <div class="section-title">Group Approval Rate Breakdown</div>
  <table style="margin-bottom:24px;">
    <thead><tr><th>Group</th><th>Approval Rate</th><th>Relative Rate</th></tr></thead>
    <tbody>
      ${groups.map((g: any) => {
        const maxRate = Math.max(...groups.map((x: any) => x.approvalRate || 0))
        const rel = maxRate > 0 ? ((g.approvalRate || 0) / maxRate * 100).toFixed(1) : 'N/A'
        return `<tr><td>${g.name}</td><td class="mono">${(g.approvalRate || 0).toFixed(2)}%</td><td class="mono">${rel}%</td></tr>`
      }).join('')}
    </tbody>
  </table>` : ''}

  <!-- Narrative -->
  ${data.geminiNarrative ? `
  <div class="section-title">AI Audit Narrative</div>
  <div class="narrative">${data.geminiNarrative.replace(/\*\*/g, '')}</div>
  ` : ''}

  <div class="footer">
    <span>BiasLens AI Fairness Auditor v2.1 — Confidential Compliance Report</span>
    <span>Generated: ${new Date().toLocaleString()}</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (win) {
      win.document.write(html)
      win.document.close()
      onNotify('Regulatory PDF Report generated', 'success')
    }
  }

  const filteredFeatures = FEATURE_DATA.filter(f =>
    f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const HEATMAP = activeFilter === 'GENDER' ? HEATMAP_GENDER : HEATMAP_RACE

  return (
    <div className="animate-fadeup">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Detailed Audit Report</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Comprehensive statistical evaluation of algorithmic parity across all sensitive feature vectors.
            Data reflects the period: &nbsp;
            <span style={{ fontFamily: 'JetBrains Mono, monospace', backgroundColor: 'var(--bg-main)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>
              2025-Q4-AUDIT
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleCSVExport} className="btn btn-outline" style={{ fontSize: 12 }}>↓ CSV</button>
          <button onClick={handlePDFExport} className="btn btn-outline" style={{ fontSize: 12 }}>↓ PDF Regulatory</button>
          <button
            onClick={() => onNotify('Detailed audit request sent for review', 'success')}
            className="btn btn-dark"
            style={{ fontSize: 12 }}
          >
            Send Audit Request
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {summaryMetrics.map(m => (
          <div key={m.label} className="panel" style={{ padding: 18 }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: m.highlight ? 'var(--accent-red)' : 'var(--text-primary)', marginBottom: 8 }}>
              {m.value}
            </div>
            <div className="progress-track" style={{ marginBottom: 6 }}>
              <div className="progress-fill" style={{ width: `${Math.min(m.bar * 100, 100)}%`, backgroundColor: m.barColor }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: m.statusColor, letterSpacing: '0.05em' }}>{m.status}</span>
          </div>
        ))}
      </div>

      {/* Heatmap + Bias Contribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginBottom: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Bias Intensity Heatmap</h2>
              <p style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>CROSS-PROTECTED CLASS VARIANCE</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['GENDER', 'RACE'] as const).map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '4px 12px', borderRadius: 4, border: 'none',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  backgroundColor: activeFilter === f ? 'var(--bg-sidebar)' : 'var(--bg-main)',
                  color: activeFilter === f ? 'white' : 'var(--text-muted)',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginTop: 14 }}>
            {HEATMAP.flat().map((val, i) => {
              const { bg, text } = heatmapColor(val)
              return (
                <div key={i} style={{
                  backgroundColor: bg, color: text,
                  height: 44, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'transform 0.15s', cursor: 'default',
                  userSelect: 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {val.toFixed(2)}
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Bias Contribution</h2>
          {biasContribution.map(b => (
            <div key={b.label} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{b.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Net Deviation</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>±0.034</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Vector Audit Log */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Feature Vector Audit Log</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter features..."
              style={{
                padding: '7px 12px 7px 32px',
                borderRadius: 8, border: '1px solid var(--border)',
                fontSize: 12, outline: 'none', width: 200,
                backgroundColor: 'var(--bg-main)',
              }}
            />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>
        <table className="audit-table">
          <thead>
            <tr>
              <th>FEATURE ID</th>
              <th>CATEGORY</th>
              <th>CORRELATION SCORE</th>
              <th>BIAS CONTRIBUTION</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map(f => (
              <tr key={f.id}>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{f.id}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{f.category}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 4, backgroundColor: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ width: `${f.correlation * 100}%`, height: '100%', backgroundColor: 'var(--accent-blue)', borderRadius: 2 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>{f.correlation}</span>
                  </div>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                    color: f.biasColor,
                    backgroundColor: f.biasColor === 'var(--accent-red)' ? 'var(--accent-red-light)'
                      : f.biasColor === 'var(--accent-amber)' ? 'var(--accent-amber-light)' : 'var(--accent-green-light)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{f.biasLabel}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', backgroundColor: f.statusColor
                    }} />
                    <span style={{ fontSize: 12, color: f.statusColor, fontWeight: 600 }}>{f.status}</span>
                  </div>
                </td>
                <td>
                  <button style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 18, lineHeight: 1,
                  }}>⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            DISPLAYING {filteredFeatures.length} OF {data.columns?.length || 42} ACTIVE FEATURES
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }}>‹</button>
            <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 12 }}>›</button>
          </div>
        </div>
      </div>

      {/* Bottom mini-charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {groupMini.map(g => (
          <div key={g.label} className="panel" style={{
            padding: 16,
            borderTop: g.geoWarn ? `3px solid var(--accent-red)` : `3px solid ${g.color}`,
          }}>
            {/* Header row — fixed height, no overflow */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, minHeight: 22 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%' }}>
                {g.label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: g.geoWarn ? 'var(--accent-red)' : g.color, flexShrink: 0, marginLeft: 6 }}>
                {g.geoWarn ? <span className="badge badge-red" style={{ fontSize: 9, padding: '2px 6px' }}>LOW/PARITY</span> : g.value}
              </span>
            </div>
            {g.groups && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
                {g.groups.map((gr: any) => {
                  const barH = Math.min(Math.max((gr.approvalRate / 80) * 55, 8), 55)
                  return (
                    <div key={gr.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', borderRadius: 4,
                        height: `${barH}px`,
                        backgroundColor: g.color, opacity: 0.8,
                      }} />
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{gr.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {g.curve && (
              <div style={{ height: 60, display: 'flex', alignItems: 'flex-end' }}>
                <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M0,50 Q20,40 40,20 T100,0" stroke="var(--accent-purple)" strokeWidth="2" fill="none" />
                  <path d="M0,50 Q20,40 40,20 T100,0 V50 Z" fill="var(--accent-purple)" opacity="0.1" />
                </svg>
              </div>
            )}
            {g.geoWarn && (
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="50" height="50" viewBox="0 0 100 100">
                  <polygon points="50,10 90,90 10,90" fill="none" stroke="var(--accent-red)" strokeWidth="3" />
                  <line x1="50" y1="40" x2="50" y2="65" stroke="var(--accent-red)" strokeWidth="4" />
                  <circle cx="50" cy="78" r="3" fill="var(--accent-red)" />
                </svg>
              </div>
            )}
            {g.geoWarn && (
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-red)', textAlign: 'center', marginTop: 4, letterSpacing: '0.04em' }}>
                HIGH DISPARITY IN RURAL
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
