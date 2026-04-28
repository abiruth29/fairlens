import React from 'react'
import { Upload, Brain, BarChart3, Wrench, FileText, Shield } from 'lucide-react'

const STEPS = [
  {
    icon: <Upload className="w-6 h-6" />,
    color: 'text-blue-400 bg-blue-400/15',
    title: '1. Upload Your Data',
    desc: 'Upload a CSV containing model predictions or raw features. Specify your target outcome and sensitive attribute (race, gender, age, etc.).',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    color: 'text-purple-400 bg-purple-400/15',
    title: '2. Automated Bias Detection',
    desc: 'FairLens computes 7 fairness metrics across all demographic groups: Demographic Parity, Disparate Impact, Equalized Odds, Predictive Parity, and more.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-cyan-400 bg-cyan-400/15',
    title: '3. Visual Dashboard',
    desc: 'Explore your bias "fingerprint" — an interactive radar chart, group comparison bars, and per-group breakdowns showing exactly where disparities exist.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    color: 'text-green-400 bg-green-400/15',
    title: '4. Gemini AI Explains',
    desc: 'Google Gemini 1.5 translates complex fairness math into plain language. Ask follow-up questions conversationally to understand and act on findings.',
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    color: 'text-orange-400 bg-orange-400/15',
    title: '5. One-Click Mitigation',
    desc: 'Apply reweighting or threshold calibration and instantly see before/after comparison. Reduce bias without sacrificing significant accuracy.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    color: 'text-rose-400 bg-rose-400/15',
    title: '6. Audit Report',
    desc: 'Download a compliance-ready bias audit report citing EU AI Act and GDPR requirements. Share with stakeholders and legal teams.',
  },
]

const METRICS = [
  { name: 'Demographic Parity', desc: 'Are positive decisions equally distributed across groups?', formula: 'P(Ŷ=1|A=a) = P(Ŷ=1|A=b)' },
  { name: 'Disparate Impact', desc: 'Does the 4/5ths rule pass?', formula: 'min(P(Ŷ=1|A)) / max(P(Ŷ=1|A)) ≥ 0.8' },
  { name: 'Equalized Odds', desc: 'Are TPR and FPR equal across groups?', formula: 'TPR and FPR equal ∀ A' },
  { name: 'Predictive Parity', desc: 'Is precision (PPV) equal across groups?', formula: 'P(Y=1|Ŷ=1,A=a) = P(Y=1|Ŷ=1,A=b)' },
  { name: 'Accuracy Gap', desc: 'Is model accuracy equal for all groups?', formula: 'Acc(A=a) ≈ Acc(A=b)' },
  { name: 'Group Calibration', desc: 'Are predicted probabilities calibrated per group?', formula: 'P(Y=1|f(X)=s, A=a) = s ∀ a' },
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white mb-4">How FairLens Works</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A rigorous, end-to-end bias detection and mitigation pipeline — accessible to any organization.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {STEPS.map((step, i) => (
            <div key={i} className="card p-6 flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                {step.icon}
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Fairness Metrics We Compute</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {METRICS.map((m, i) => (
            <div key={i} className="card p-5">
              <h4 className="text-white font-semibold mb-1">{m.name}</h4>
              <p className="text-slate-400 text-sm mb-2">{m.desc}</p>
              <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded font-mono">{m.formula}</code>
            </div>
          ))}
        </div>

        {/* Architecture */}
        <div className="card p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">System Architecture</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { label: 'React Frontend', sub: 'Vite + TailwindCSS + Recharts', color: 'bg-blue-600' },
              { label: '→', sub: '', color: 'text-slate-500', arrow: true },
              { label: 'FastAPI Backend', sub: 'Python 3.11 + fairlearn', color: 'bg-purple-600' },
              { label: '→', sub: '', color: 'text-slate-500', arrow: true },
              { label: 'Google Gemini', sub: 'Gemini 1.5 Flash API', color: 'bg-green-600' },
            ].map((node, i) => (
              node.arrow ? (
                <div key={i} className="text-2xl text-slate-600 font-bold hidden md:block">→</div>
              ) : (
                <div key={i} className={`${node.color} rounded-xl p-4 text-center flex-1`}>
                  <div className="text-white font-bold">{node.label}</div>
                  <div className="text-white/70 text-xs mt-1">{node.sub}</div>
                </div>
              )
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
            <div><span className="text-slate-400">Bias Engine: </span><span className="text-white font-medium">fairlearn + scikit-learn</span></div>
            <div><span className="text-slate-400">Cloud: </span><span className="text-white font-medium">Google Cloud Run</span></div>
            <div><span className="text-slate-400">Auth: </span><span className="text-white font-medium">Firebase Auth</span></div>
          </div>
        </div>

      </div>
    </div>
  )
}
