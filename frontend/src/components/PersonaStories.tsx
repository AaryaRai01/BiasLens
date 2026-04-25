import { useState } from 'react'
import type { View } from '../App'

type Props = {
  data: any
  setView: (v: View) => void
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

type Story = {
  id: string
  title: string
  subtitle: string
  caseId: string
  narrative: string
  biasMechanism: string
  scoreLabel: string
  scoreVerdict: 'DENY' | 'APPROVE'
  scoreDetails: { label: string; value: string; color: string }[]
  realityLabel: string
  realityVerdict: 'DENY' | 'APPROVE'
  realityDetails: { label: string; value: string }[]
  similarPatterns: { persona: string; role: string; identityFactor: string; biasType: string; biasColor: string; impactPct: number }[]
}

function buildStories(data: any): Story[] {
  const attr = data.protectedAttribute || 'demographic'
  const groups = data.group_data || []
  const g1 = groups[0]?.name || 'Group A'
  const g2 = groups[1]?.name || 'Group B'
  const g1Rate = groups[0]?.approvalRate ?? 55
  const g2Rate = groups[1]?.approvalRate ?? 42
  const dp = (data.demographicParity || 0.14).toFixed(3)
  const di = (data.disparateImpact || 0.7).toFixed(2)
  const eo = (data.equalOpportunity || 0.1).toFixed(3)
  const rows = (data.rows || 1000).toLocaleString()

  // Determine which group is disadvantaged
  const disadvantaged = g2Rate < g1Rate ? g2 : g1
  const advantaged = g2Rate < g1Rate ? g1 : g2
  const disadvantagedRate = Math.min(g1Rate, g2Rate).toFixed(1)
  const advantagedRate = Math.max(g1Rate, g2Rate).toFixed(1)
  const disparity = (parseFloat(advantagedRate) - parseFloat(disadvantagedRate)).toFixed(1)

  // Use real Gemini narrative if available
  const narrativeParts = data.geminiNarrative
    ? data.geminiNarrative.split('\n\n').filter((p: string) => p.trim().length > 20)
    : []

  const storyOneNarrative = narrativeParts[0]?.replace(/\*\*/g, '') ||
    `Across ${rows} records in your dataset, applicants identified as "${disadvantaged}" have an average approval rate of ${disadvantagedRate}% — compared to ${advantagedRate}% for the "${advantaged}" group. This ${dp} Demographic Parity gap is not random: it reflects a systematic model bias against the "${disadvantaged}" demographic on the protected attribute "${attr}". This ${disparity} percentage-point gap means thousands of qualified applications may be incorrectly flagged.`

  const storyTwoNarrative = narrativeParts[1]?.replace(/\*\*/g, '') ||
    `The model's Equal Opportunity gap of ${eo} reveals that even when a "${disadvantaged}" applicant is genuinely qualified, the model approves them at a statistically lower rate. The Disparate Impact ratio of ${di} ${parseFloat(di) < 0.8 ? 'falls below the legal 4/5ths (0.80) threshold — this model may violate employment and lending anti-discrimination regulations' : 'currently passes the 4/5ths legal threshold, though the underlying bias is still statistically significant and ethically concerning'}.`

  return [
    {
      id: 'story1',
      title: `The Invisible Wall: "${disadvantaged}" Group Profile`,
      subtitle: `Algorithmic exclusion on protected attribute: ${attr}`,
      caseId: `#BL-${Math.abs(Math.round(parseFloat(dp) * 99999))}`,
      narrative: storyOneNarrative,
      biasMechanism: `The model exhibits a Demographic Parity gap of **${dp}** on the "${attr}" attribute, meaning the "${disadvantaged}" group receives positive predictions at a rate ${disparity}pp lower than the "${advantaged}" group. The Disparate Impact ratio of **${di}** ${parseFloat(di) < 0.8 ? '**violates the legal 4/5ths standard (0.80)**' : 'is above the 0.80 legal floor but statistical bias remains present'}. The Equal Opportunity gap of **${eo}** further shows this extends to qualified applicants being denied.`,
      scoreLabel: 'THE SCORE',
      scoreVerdict: 'DENY',
      scoreDetails: [
        { label: `"${disadvantaged}" Approval Rate`, value: `${disadvantagedRate}%`, color: 'var(--accent-red)' },
        { label: 'Demographic Parity Gap', value: dp, color: 'var(--accent-red)' },
        { label: 'Protected Attribute', value: attr, color: 'var(--accent-red)' },
      ],
      realityLabel: 'THE REALITY',
      realityVerdict: 'APPROVE',
      realityDetails: [
        { label: `"${advantaged}" Approval Rate`, value: `${advantagedRate}%` },
        { label: 'Rate Disparity', value: `${disparity}pp gap` },
        { label: 'Total Records', value: rows },
      ],
      similarPatterns: [
        { persona: `${attr} Signal`, role: 'Primary Protected Factor', identityFactor: `${attr} Identity`, biasType: 'Demographic Bias', biasColor: 'var(--accent-red)', impactPct: Math.min(Math.round(parseFloat(dp) * 700), 95) },
        { persona: 'Proxy Variables', role: 'Indirect Discrimination', identityFactor: 'Correlated Features', biasType: 'Proxy Bias', biasColor: 'var(--accent-amber)', impactPct: Math.min(Math.round(parseFloat(eo) * 500), 70) },
        { persona: 'Historical Data', role: 'Training Corpus Shift', identityFactor: 'Data Representation', biasType: 'Historical Bias', biasColor: 'var(--accent-amber)', impactPct: 30 },
      ]
    },
    {
      id: 'story2',
      title: `The Systemic Advantage: "${advantaged}" Group Profile`,
      subtitle: 'Inherited privilege in algorithmic scoring',
      caseId: `#BL-${Math.abs(Math.round(parseFloat(di) * 78234))}`,
      narrative: storyTwoNarrative,
      biasMechanism: `The model's training data over-represents the "${advantaged}" group with positive outcomes, creating a feedback loop. An Equal Opportunity gap of **${eo}** means that true-positive rates differ across groups. Even when both groups are equally qualified, the "${disadvantaged}" group is approved at a ${dp} lower rate — a **measurable, systematic, and correctable form of algorithmic discrimination** that can be addressed using mitigation techniques available in the Sandbox.`,
      scoreLabel: 'THE SCORE',
      scoreVerdict: 'APPROVE',
      scoreDetails: [
        { label: `"${advantaged}" Approval Rate`, value: `${advantagedRate}%`, color: 'var(--accent-green)' },
        { label: 'Disparate Impact Ratio', value: di, color: parseFloat(di) >= 0.8 ? 'var(--accent-green)' : 'var(--accent-amber)' },
        { label: 'Equal Opportunity Gap', value: eo, color: parseFloat(eo) < 0.1 ? 'var(--accent-green)' : 'var(--accent-amber)' },
      ],
      realityLabel: 'THE REALITY',
      realityVerdict: 'APPROVE',
      realityDetails: [
        { label: `"${disadvantaged}" Group Rate`, value: `${disadvantagedRate}%` },
        { label: 'Disparity', value: `${disparity}pp higher for "${advantaged}"` },
        { label: 'Rows Analysed', value: rows },
      ],
      similarPatterns: [
        { persona: 'Intersectional', role: `${attr} × Other Factor`, identityFactor: 'Compound Identity', biasType: 'Intersectional Bias', biasColor: 'var(--accent-amber)', impactPct: 35 },
        { persona: 'Age Interaction', role: 'Lifecycle Variable', identityFactor: `${attr} × Age`, biasType: 'Lifecycle Bias', biasColor: 'var(--accent-amber)', impactPct: 22 },
        { persona: 'Geographic', role: 'Location Signal', identityFactor: 'Region Proxy', biasType: 'Proxy Bias', biasColor: 'var(--accent-green)', impactPct: 12 },
      ]
    }
  ]
}


export default function PersonaStories({ data, setView, onNotify }: Props) {
  const stories = buildStories(data)
  const [idx, setIdx] = useState(0)
  const story = stories[idx]

  return (
    <div className="animate-fadeup">
      {/* Dataset context breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 14px', backgroundColor: 'var(--bg-sidebar)', borderRadius: 8, width: 'fit-content' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
          {data.filename || 'dataset'}
        </span>
        <span style={{ color: '#374151', fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{(data.rows || 0).toLocaleString()} records</span>
        <span style={{ color: '#374151', fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{data.protectedAttribute || 'demographic'}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-blue">PERSONA IMPACT STORY</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Case ID: {story.caseId}</span>
            {/* Story counter badge */}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Story {idx + 1} of {stories.length}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {story.title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{story.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setIdx(idx === 0 ? stories.length - 1 : idx - 1)} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>← Prev</button>
          <button onClick={() => setIdx((idx + 1) % stories.length)} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>Next →</button>
          <button onClick={() => setView('mitigation')} className="btn btn-outline">
            Apply Mitigation Strategy
          </button>
          <button
            onClick={() => onNotify('Audit request sent to senior compliance officer', 'success')}
            className="btn btn-dark"
          >
            Send Audit Request
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 20 }}>
        {/* Left: Narrative + Bias Mechanism */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Narrative */}
          <div className="panel" style={{ padding: 24 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {story.narrative}
            </p>
          </div>

          {/* Bias Mechanism */}
          <div className="panel" style={{ padding: 24, backgroundColor: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>The Bias Mechanism</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {story.biasMechanism.split('**').map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          </div>

          {/* Score vs Reality */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Score */}
            <div className="panel" style={{
              padding: 20,
              borderLeft: `4px solid ${story.scoreVerdict === 'DENY' ? 'var(--accent-red)' : 'var(--accent-green)'}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                {story.scoreLabel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontSize: 26, fontWeight: 800,
                  color: story.scoreVerdict === 'DENY' ? 'var(--accent-red)' : 'var(--accent-green)',
                }}>
                  {story.scoreVerdict}
                </span>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: story.scoreVerdict === 'DENY' ? 'var(--accent-red)' : 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'white', fontWeight: 700,
                }}>
                  {story.scoreVerdict === 'DENY' ? '!' : '✓'}
                </div>
              </div>
              {story.scoreDetails.map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Reality */}
            <div className="panel" style={{
              padding: 20,
              borderLeft: `4px solid var(--accent-green)`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                {story.realityLabel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent-green)' }}>
                  {story.realityVerdict}
                </span>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'white', fontWeight: 700,
                }}>
                  ✓
                </div>
              </div>
              {story.realityDetails.map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Data summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: 'var(--bg-sidebar)', borderRadius: 12, padding: 20, color: 'white'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 16, textTransform: 'uppercase' }}>
              Case Profile
            </div>
            {[
              { k: 'Protected Attribute', v: data.protectedAttribute || 'Gender' },
              { k: 'Dataset', v: data.filename || 'audit_dataset.csv' },
              { k: 'Total Records', v: (data.rows || 1000).toLocaleString() },
              { k: 'Columns', v: data.columns?.length || 10 },
            ].map(item => (
              <div key={item.k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{item.k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb' }}>{item.v}</div>
              </div>
            ))}
            {/* Mini metrics */}
            <div style={{ borderTop: '1px solid #1d2432', paddingTop: 16, marginTop: 4 }}>
              {[
                { k: 'Demographic Parity', v: (data.demographicParity || 0.14).toFixed(3), warn: data.demographicParity > 0.1 },
                { k: 'Disparate Impact', v: (data.disparateImpact || 0.7).toFixed(3), warn: data.disparateImpact < 0.8 },
                { k: 'Equal Opportunity', v: (data.equalOpportunity || 0.1).toFixed(3), warn: data.equalOpportunity > 0.1 },
              ].map(m => (
                <div key={m.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{m.k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.warn ? '#f87171' : '#34d399' }} className="mono">{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Bias Patterns */}
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Similar Bias Patterns</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Identifying other personas impacted by proxy-variable weighting.
            </p>
          </div>
          <button className="btn btn-outline" style={{ fontSize: 12 }}>≡ Expand Filter</button>
        </div>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Identity Factor</th>
              <th>Bias Type</th>
              <th>Impact Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {story.similarPatterns.map(p => (
              <tr key={p.persona}>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.persona}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.role}</div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.identityFactor}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 4, color: p.biasColor,
                    backgroundColor: p.biasColor === 'var(--accent-red)' ? 'var(--accent-red-light)'
                      : p.biasColor === 'var(--accent-amber)' ? 'var(--accent-amber-light)' : 'var(--accent-green-light)',
                  }}>
                    {p.biasType}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, backgroundColor: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ width: `${p.impactPct}%`, height: '100%', backgroundColor: p.biasColor, borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 16, fontWeight: 700 }}>→</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        <button onClick={() => setIdx(0)} className="btn btn-outline">← Previous Story</button>
        <button onClick={() => setIdx(1)} className="btn btn-outline">Next Story →</button>
      </div>
    </div>
  )
}
