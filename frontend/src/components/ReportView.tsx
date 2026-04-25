import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertTriangle, CheckCircle, BrainCircuit, Download, ShieldCheck, Wand2, Activity, FileText } from 'lucide-react'

import { useState } from 'react'

export default function ReportView({ data: initialData }: { data: any }) {
  const [mitigatedData, setMitigatedData] = useState<any>(null)
  const [isMitigating, setIsMitigating] = useState(false)
  const [showMitigated, setShowMitigated] = useState(false)

  const data = showMitigated && mitigatedData ? mitigatedData : initialData

  if (!initialData) return <div>No data available</div>

  const handleMitigate = async () => {
    setIsMitigating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/mitigate`, { method: 'POST' })
      if (!response.ok) throw new Error('Mitigation failed')
      const resData = await response.json()
      setMitigatedData({
        ...initialData,
        demographicParity: resData.metrics.demographic_parity,
        equalizedOdds: resData.metrics.equal_opportunity,
        disparateImpact: resData.metrics.disparate_impact,
        equalOpportunity: resData.metrics.equal_opportunity,
        compliance: resData.compliance,
      })
      setShowMitigated(true)
    } catch (e) {
      console.error(e)
      alert("Failed to mitigate bias")
    } finally {
      setIsMitigating(false)
    }
  }

  const handleExportDebiased = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/api/export-debiased`, '_blank')
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#2dd4bf', '#f43f5e', '#eab308']
  const safeGroupData = data?.group_data || []
  const pieData = safeGroupData.map((g: any) => ({
    name: g.name,
    value: Math.random() * 100 + 50 // Mocking population size for the donut chart
  }))

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-primary w-7 h-7" />
            Model Monitoring
          </h1>
          <p className="text-slate-400 text-sm mt-1">Monitoring fairness and transparency in AI models</p>
        </div>
        
        <div className="flex items-center gap-3">
          {mitigatedData && (
            <div className="flex items-center bg-[#151821] border border-white/5 p-1 rounded-lg mr-2">
              <button 
                onClick={() => setShowMitigated(false)}
                className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${!showMitigated ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Original
              </button>
              <button 
                onClick={() => setShowMitigated(true)}
                className={`px-4 py-1.5 text-sm rounded-md transition-all font-medium ${showMitigated ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
              >
                Mitigated
              </button>
            </div>
          )}
          
          <button className="px-4 py-2 bg-success/10 text-success border border-success/20 rounded-lg text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live Monitoring
          </button>

          {!mitigatedData && (
             <button 
              onClick={handleMitigate}
              disabled={isMitigating}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 border border-primary rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              {isMitigating ? "Applying Fix..." : "1-Click Mitigate"}
            </button>
          )}
          {mitigatedData && (
            <button 
              onClick={handleExportDebiased}
              className="px-4 py-2 bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20 border border-success rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Dataset
            </button>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Demographic Parity" value={data.demographicParity} threshold={0.1} trend="+2.4%" />
        <MetricCard title="Equalized Odds" value={data.equalizedOdds} threshold={0.1} trend="-1.2%" />
        <MetricCard title="Equal Opportunity" value={data.equalOpportunity} threshold={0.1} trend="+4.6%" />
        <MetricCard title="Disparate Impact" value={data.disparateImpact} threshold={0.8} invert trend="-0.8%" />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-2">
        {/* MAIN CHART COLUMN */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 h-[400px] flex flex-col">
            <h2 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              Approval Rates by Group
            </h2>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeGroupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151821', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="approvalRate" name="Approval %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {safeGroupData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* NARRATIVE */}
          <div className="glass-panel p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Auditor Insights</h2>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed relative z-10 whitespace-pre-wrap font-mono bg-black/20 p-4 rounded-lg border border-white/5">
              {data.geminiNarrative}
            </div>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* DONUT CHART */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold text-slate-300 w-full mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              Protected Attributes
            </h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151821', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {pieData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* COMPLIANCE ALERTS */}
          <div className="glass-panel p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-500" />
              Compliance Alerts
            </h2>
            <div className="flex justify-between items-center px-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border-4 border-success/20 flex items-center justify-center bg-success/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <span className="text-success font-bold text-lg">{data.compliance?.nyc_law_144 === 'COMPLIANT' ? '1' : '0'}</span>
                </div>
                <span className="text-xs text-slate-400">Low Risk</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border-4 border-warning/20 flex items-center justify-center bg-warning/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <span className="text-warning font-bold text-lg">0</span>
                </div>
                <span className="text-xs text-slate-400">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border-4 border-danger/20 flex items-center justify-center bg-danger/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <span className="text-danger font-bold text-lg">{data.compliance?.eu_ai_act !== 'COMPLIANT' ? '1' : '0'}</span>
                </div>
                <span className="text-xs text-slate-400">High Risk</span>
              </div>
            </div>
            
            {data.compliance && (
              <div className="mt-8 space-y-3">
                 <div className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${data.compliance.eu_ai_act === 'COMPLIANT' ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                  {data.compliance.eu_ai_act === 'COMPLIANT' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  <div>
                    <div className="font-semibold mb-0.5">EU AI Act</div>
                    <div className="opacity-80 text-xs">{data.compliance.eu_ai_act === 'COMPLIANT' ? 'Model aligns with acceptable variance.' : 'Structural bias detected. High Risk.'}</div>
                  </div>
                 </div>
                 <div className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${data.compliance.nyc_law_144 === 'COMPLIANT' ? 'bg-success/5 border-success/20 text-success' : 'bg-warning/5 border-warning/20 text-warning'}`}>
                  {data.compliance.nyc_law_144 === 'COMPLIANT' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  <div>
                    <div className="font-semibold mb-0.5">NYC Local Law 144</div>
                    <div className="opacity-80 text-xs">{data.compliance.nyc_law_144 === 'COMPLIANT' ? 'Passes the 4/5ths Rule threshold.' : 'Fails to meet disparate impact standard.'}</div>
                  </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* BOTTOM ROW: MODEL OVERVIEW */}
      <div className="glass-panel p-6 mt-2">
        <h2 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Model Compliance Overview
        </h2>
        <div className="grid grid-cols-4 gap-8">
           <ComplianceBar modelName="Baseline Model" score={82} color="bg-slate-600" />
           <ComplianceBar modelName="Current Model" score={Math.round((1 - data.disparateImpact) * 100)} color="bg-primary" />
           <ComplianceBar modelName="Mitigated Model" score={mitigatedData ? Math.round((1 - mitigatedData.disparateImpact) * 100) : 0} color="bg-success" />
           <ComplianceBar modelName="Target Benchmark" score={95} color="bg-accent" />
        </div>
      </div>

    </div>
  )
}

function MetricCard({ title, value, threshold, invert = false, trend = "+0.0%" }: any) {
  
  // Create a percentage for the progress bar based on how close it is to ideal (0 or 1 depending on metric)
  let progress = 0;
  if (title === 'Disparate Impact') {
     progress = Math.min((value / 1.0) * 100, 100);
  } else {
     // for distance metrics like DP, EO, lower is better. 0 is ideal.
     progress = Math.max(100 - (value * 100), 0);
  }
  
  const isPositiveTrend = trend.startsWith('+')
  
  return (
    <div className="metric-card group">
      <div className="flex justify-between items-start mb-3">
        <div className="text-sm font-medium text-slate-400 flex items-center gap-1">{title}</div>
        <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      
      <div className="flex items-end gap-3 mb-4">
        <div className="text-3xl font-bold text-white tracking-tight">{typeof value === 'number' ? value.toFixed(3) : value}</div>
        <div className={`text-xs font-medium mb-1 flex items-center ${isPositiveTrend ? 'text-success' : 'text-danger'}`}>
          {isPositiveTrend ? '↗' : '↘'} {trend}
        </div>
      </div>
      
      <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

function ComplianceBar({ modelName, score, color }: { modelName: string, score: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-2">
        <span className="text-slate-300">{modelName}</span>
        <span className={score > 80 ? 'text-success' : 'text-warning'}>{score}%</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  )
}
