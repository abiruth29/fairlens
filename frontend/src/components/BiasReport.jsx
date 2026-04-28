import React, { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'
import { AlertTriangle, CheckCircle, Info, TrendingDown, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import GeminiExplainer from './GeminiExplainer'

const SEVERITY_CONFIG = {
  CRITICAL: { class: 'severity-critical', icon: <AlertTriangle className="w-4 h-4" />, label: 'Critical Bias' },
  HIGH:     { class: 'severity-high',     icon: <AlertTriangle className="w-4 h-4" />, label: 'High Bias' },
  MODERATE: { class: 'severity-moderate', icon: <Info className="w-4 h-4" />,          label: 'Moderate Bias' },
  LOW:      { class: 'severity-low',      icon: <CheckCircle className="w-4 h-4" />,   label: 'Low Bias' },
}

const METRIC_INFO = {
  demographic_parity_difference: {
    label: 'Demographic Parity Diff',
    description: 'Difference in positive decision rates between groups. 0 = fair.',
    threshold: 0.1,
  },
  disparate_impact_ratio: {
    label: 'Disparate Impact Ratio',
    description: 'Ratio of positive rates. Below 0.8 fails the 4/5ths rule.',
    threshold: 0.8,
    inverted: true,
  },
  equalized_odds_tpr_diff: {
    label: 'Equalized Odds (TPR)',
    description: 'Gap in true positive rates across groups. 0 = fair.',
    threshold: 0.1,
  },
  equalized_odds_fpr_diff: {
    label: 'Equalized Odds (FPR)',
    description: 'Gap in false positive rates across groups. 0 = fair.',
    threshold: 0.1,
  },
  predictive_parity_difference: {
    label: 'Predictive Parity',
    description: 'Difference in precision (PPV) across groups. 0 = fair.',
    threshold: 0.1,
  },
  group_accuracy_gap: {
    label: 'Accuracy Gap',
    description: 'Difference in model accuracy across groups.',
    threshold: 0.05,
  },
}

function MetricRow({ name, baseline, mitigated }) {
  const info = METRIC_INFO[name] || { label: name, description: '', threshold: 0.1 }
  const isBad = info.inverted ? baseline < info.threshold : baseline > info.threshold
  const improved = info.inverted
    ? mitigated >= baseline
    : mitigated < baseline

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-700/50 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-white">{info.label}</span>
          {isBad && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">⚠ Biased</span>}
        </div>
        <p className="text-xs text-slate-500">{info.description}</p>
      </div>
      <div className="text-right">
        <div className={`text-lg font-bold ${isBad ? 'text-red-400' : 'text-green-400'}`}>
          {baseline.toFixed(4)}
        </div>
        {mitigated !== undefined && (
          <div className={`text-xs ${improved ? 'text-green-400' : 'text-red-400'}`}>
            {improved ? '↓' : '↑'} {mitigated.toFixed(4)} after fix
          </div>
        )}
      </div>
    </div>
  )
}

export default function BiasReport({ result, onAskQuestion }) {
  const [showMitigated, setShowMitigated] = useState(false)
  const [expandGroups, setExpandGroups] = useState(false)

  const sev = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.MODERATE
  const metrics = result.metrics || {}
  const metricsMit = result.metrics_mitigated || {}
  const groups = result.group_stats || []
  const groupsMit = result.group_stats_mitigated || []

  // Radar chart data
  const radarData = [
    { subject: 'Dem. Parity', A: Math.min(metrics.demographic_parity_difference * 5, 1), fullMark: 1 },
    { subject: 'Disp. Impact', A: Math.max(1 - metrics.disparate_impact_ratio, 0), fullMark: 1 },
    { subject: 'Eq. Odds TPR', A: Math.min(metrics.equalized_odds_tpr_diff * 5, 1), fullMark: 1 },
    { subject: 'Eq. Odds FPR', A: Math.min(metrics.equalized_odds_fpr_diff * 5, 1), fullMark: 1 },
    { subject: 'Pred. Parity', A: Math.min(metrics.predictive_parity_difference * 5, 1), fullMark: 1 },
    { subject: 'Acc. Gap', A: Math.min(metrics.group_accuracy_gap * 10, 1), fullMark: 1 },
  ]

  // Group comparison bar data
  const groupBarData = groups.map((g, i) => ({
    name: g.group,
    'Positive Rate': parseFloat((g.positive_rate * 100).toFixed(1)),
    'Accuracy (%)': parseFloat((g.accuracy * 100).toFixed(1)),
    'True Positive Rate': parseFloat((g.tpr * 100).toFixed(1)),
  }))

  // Before/after comparison
  const comparisonData = [
    { name: 'Dem. Parity Diff', Before: metrics.demographic_parity_difference, After: metricsMit.demographic_parity_difference },
    { name: 'Disp. Impact Gap', Before: parseFloat((1 - metrics.disparate_impact_ratio).toFixed(4)), After: parseFloat((1 - metricsMit.disparate_impact_ratio).toFixed(4)) },
    { name: 'Eq. Odds TPR', Before: metrics.equalized_odds_tpr_diff, After: metricsMit.equalized_odds_tpr_diff },
  ]

  return (
    <div className="space-y-6">

      {/* Severity Banner */}
      <div className={`card p-5 flex items-start gap-4 ${sev.class}`}>
        <div className="mt-0.5">{sev.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{sev.label} Detected</h2>
            <span className="text-sm opacity-70">{result.sample_size?.toLocaleString()} samples · {result.sensitive_attribute}</span>
          </div>
          <p className="text-sm opacity-80 mt-1">
            Sensitive attribute: <strong>{result.sensitive_attribute}</strong> → Target: <strong>{result.target_attribute}</strong>
          </p>
        </div>
      </div>

      {/* Accuracy Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-extrabold text-white">{result.overall_accuracy}%</div>
          <div className="text-sm text-slate-400 mt-1">Overall Accuracy (Baseline)</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-extrabold text-green-400">{result.overall_accuracy_mitigated}%</div>
          <div className="text-sm text-slate-400 mt-1">Accuracy After Mitigation</div>
        </div>
      </div>

      {/* AI Explanation */}
      {result.ai_explanation && (
        <GeminiExplainer explanation={result.ai_explanation} auditResult={result} onAsk={onAskQuestion} />
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="card p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Bias Fingerprint
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar name="Bias Score" dataKey="A" stroke="#f87171" fill="#f87171" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 text-center mt-2">Higher = more biased. 0 = perfectly fair.</p>
        </div>

        {/* Group Comparison */}
        <div className="card p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Group Outcomes
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={groupBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="Positive Rate" fill="#60a5fa" radius={[4,4,0,0]} />
              <Bar dataKey="True Positive Rate" fill="#a78bfa" radius={[4,4,0,0]} />
              <Bar dataKey="Accuracy (%)" fill="#34d399" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Before / After Mitigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-400" />
            Bias Reduction After Mitigation
          </h3>
          <button
            onClick={() => setShowMitigated(!showMitigated)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            {showMitigated ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showMitigated ? 'Hide chart' : 'Show chart'}
          </button>
        </div>
        {showMitigated && (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="Before" fill="#f87171" radius={[4,4,0,0]} />
              <Bar dataKey="After" fill="#34d399" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 space-y-1">
          {Object.entries(metrics).map(([key, val]) => (
            <MetricRow key={key} name={key} baseline={val} mitigated={metricsMit[key]} />
          ))}
        </div>
      </div>

      {/* Group Stats Table */}
      <div className="card p-6">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setExpandGroups(!expandGroups)}
        >
          <h3 className="text-white font-bold">Per-Group Breakdown</h3>
          {expandGroups ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {expandGroups && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Group','Count','Positive Rate','Accuracy','TPR','FPR'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-700/20">
                    <td className="py-2 px-3 font-medium text-white">{g.group}</td>
                    <td className="py-2 px-3 text-slate-300">{g.count}</td>
                    <td className="py-2 px-3 text-slate-300">{(g.positive_rate * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-300">{(g.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-300">{(g.tpr * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-300">{(g.fpr * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
