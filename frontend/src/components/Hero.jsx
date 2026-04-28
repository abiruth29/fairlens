import React from 'react'
import { Shield, ArrowRight, ChevronRight, Users, AlertTriangle, CheckCircle } from 'lucide-react'

const STATS = [
  { value: '7+', label: 'Fairness Metrics' },
  { value: '< 5s', label: 'Audit Time' },
  { value: '3', label: 'Sample Datasets' },
  { value: 'Gemini', label: 'AI Powered' },
]

const FEATURES = [
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    title: 'Detect',
    desc: '7 bias metrics computed instantly: Demographic Parity, Disparate Impact, Equalized Odds, and more.',
    color: 'border-orange-500/30 bg-orange-500/5',
  },
  {
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    title: 'Explain',
    desc: 'Google Gemini AI translates complex fairness math into plain language insights your team can act on.',
    color: 'border-blue-500/30 bg-blue-500/5',
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    title: 'Mitigate',
    desc: 'One-click mitigation: reweighting and threshold calibration with before/after comparison.',
    color: 'border-green-500/30 bg-green-500/5',
  },
]

export default function Hero({ setPage }) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Google Solutions Challenge 2026 · Unbiased AI Decision
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            AI that audits<br />
            <span className="gradient-text">your AI for bias</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            FairLens detects hidden discrimination in automated decisions — hiring, lending, medical care —
            and fixes it before it harms real people.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => setPage('audit')}
            className="btn-primary flex items-center justify-center gap-2 text-lg py-4 px-8 pulse-glow"
          >
            Start Free Audit <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage('about')}
            className="btn-secondary flex items-center justify-center gap-2 text-lg py-4 px-8"
          >
            See How It Works <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(s => (
            <div key={s.label} className="card p-6 text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {FEATURES.map(f => (
            <div key={f.title} className={`card p-6 border ${f.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Real-world callout */}
        <div className="card p-8 border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Bias in AI is not theoretical</h3>
              <p className="text-slate-400 leading-relaxed">
                Amazon's hiring AI penalized women's resumes. Optum's healthcare algorithm gave Black patients
                lower health risk scores. COMPAS predicted higher recidivism for Black defendants.
                These aren't edge cases — they're what happens when bias goes undetected.
                <strong className="text-white"> FairLens stops it before deployment.</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
