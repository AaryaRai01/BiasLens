import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { View } from '../App'

type Props = {
  data: any
  setView: (v: View) => void
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function fairnessScore(dp: number) {
  return Math.round((1 - Math.min(dp, 1)) * 100)
}

function getColor(score: number) {
  if (score >= 85) return 'var(--accent-green)'
  if (score >= 65) return 'var(--accent-amber)'
  return 'var(--accent-red)'
}

export default function ExecutiveOverview({ data, setView, onNotify }: Props) {
  const [timeframe, setTimeframe] = useState('6 Months')
  const score = fairnessScore(data.demographicParity ?? 0.14)
  const dp = data.demographicParity ?? 0.14
  const di = data.disparateImpact ?? 0.7
  const eo = data.equalOpportunity ?? 0.1

  // Mock equity evolution data
  const evolutionData = MONTHS.map((m, i) => ({
    month: m,
    'Group Fairness': +(0.75 + i * 0.025 + Math.random() * 0.02).toFixed(2),
    'Individual Fairness': +(0.80 + i * 0.015 + Math.random() * 0.02).toFixed(2),
  }))

  const regulations = [
    { name: 'EU AI Act', sub: 'HIGH RISK CATEGORY', status: dp < 0.1 ? 'COMPLIANT' : 'HIGH RISK', color: dp < 0.1 ? 'green' : 'red' },
    { name: 'NYC Local Law 144', sub: 'AEDT DISCLOSURE', status: di >= 0.8 ? 'COMPLIANT' : 'WARNING', color: di >= 0.8 ? 'green' : 'amber' },
    { name: 'NIST AI Framework', sub: 'RISK MANAGEMENT', status: 'COMPLIANT', color: 'green' },
    { name: 'California CPRA', sub: 'DATA PRIVACY', status: 'PENDING', color: 'amber' },
  ]

  const stats = [
    { label: 'INDIVIDUAL FAIRNESS', value: (1 - eo).toFixed(2), color: 'var(--accent-green)' },
    { label: 'GROUP FAIRNESS', value: (1 - dp).toFixed(2), color: 'var(--accent-green)' },
    { label: 'ROBUSTNESS SCORE', value: (0.7 + Math.random() * 0.1).toFixed(2), color: 'var(--accent-blue)' },
    { label: 'EXPLAINABILITY INDEX', value: (0.5 + Math.random() * 0.2).toFixed(2), color: 'var(--accent-red)' },
  ]

  const riskGroups = [
    { label: data.group_data?.[0]?.name ? `${data.group_data[0].name} (Primary)` : 'Age 50+ (Financial)', var: '12%', pct: 75, color: 'var(--accent-red)' },
    { label: data.protectedAttribute ? `${data.protectedAttribute}: High-Risk Zone` : 'ZIP: 10021-10044', var: '08%', pct: 50, color: 'var(--accent-blue)' },
    { label: 'First-Gen Students', var: '04%', pct: 30, color: 'var(--accent-amber)' },
  ]

  const scoreColor = getColor(score)

  return (
    <div className="animate-fadeup">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Global Fairness Score */}
        <div className="panel" style={{ padding: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
            SYSTEM INTEGRITY
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.1 }}>
            Global Fairness<br />Score
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 360, marginBottom: 28 }}>
            Your AI model's current ethical performance baseline calculated across {data.rows || 48} demographic cross-sections.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.04em', color: scoreColor, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 24, color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ↗ +2.4%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Since last audit</div>
            </div>
          </div>
        </div>

        {/* Regulatory Shield */}
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Regulatory Shield</h2>
            <span style={{ color: 'var(--accent-green)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {regulations.map(reg => (
              <div key={reg.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{reg.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{reg.sub}</div>
                </div>
                <span className={`badge badge-${reg.color === 'green' ? 'green' : reg.color === 'red' ? 'red' : 'amber'}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
        {/* Equity Evolution */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Equity Evolution</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Historical performance across protected attributes</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['6 Months', '1 Year'].map((label) => {
                const isActive = timeframe === label
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setTimeframe(label)
                      onNotify(`Historical view updated for ${label}`, 'info')
                    }}
                    style={{
                      padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--bg-sidebar)' : 'white',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-main)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'white' }}
                  >{label}</button>
                )
              })}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolutionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0.6, 1]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="Group Fairness" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Individual Fairness" fill="#ccfbf1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Concentration */}
        <div style={{
          backgroundColor: 'var(--bg-sidebar)', borderRadius: 12, padding: 20, color: 'white'
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Risk Concentration</h2>
          <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5, marginBottom: 20 }}>
            Identified demographic groups with the highest disparate impact variance.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {riskGroups.map(g => (
              <div key={g.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#d1d5db' }}>{g.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: g.color }}>VAR: {g.var}</span>
                </div>
                <div style={{ height: 3, backgroundColor: '#2d3748', borderRadius: 2 }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', backgroundColor: g.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView('mitigation')}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              backgroundColor: '#1d4ed8', color: 'white',
              border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            ⚡ Initiate Real-time Mitigation
          </button>
        </div>
      </div>

      {/* Bottom stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map(s => (
          <div key={s.label} className="panel" style={{ padding: '16px 20px' }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: 32, marginBottom: 8 }}>{s.value}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${parseFloat(s.value) * 100}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
