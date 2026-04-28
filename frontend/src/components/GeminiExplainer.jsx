import React, { useState } from 'react'
import { Bot, Send, Sparkles, ChevronDown, ChevronUp, Shield, AlertTriangle, TrendingUp } from 'lucide-react'
import { askQuestion } from '../utils/api'

export default function GeminiExplainer({ explanation, auditResult, onAsk }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    try {
      const ans = await askQuestion(question, auditResult)
      setAnswer(ans)
    } catch {
      setAnswer('Could not connect to Gemini API. Please check your API key configuration.')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Why is this biased?',
    'Which group is most affected?',
    'How do I fix this in production?',
    'What does disparate impact mean here?',
  ]

  return (
    <div className="card border border-purple-500/30 bg-purple-500/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold">Gemini AI Analysis</h3>
            <p className="text-xs text-slate-500">Powered by Google Gemini 1.5</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Plain Summary */}
          <div className="bg-slate-800/60 rounded-xl p-4">
            <p className="text-slate-200 leading-relaxed text-sm">{explanation.plain_summary}</p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Critical Issue</span>
              </div>
              <p className="text-sm text-slate-300">{explanation.critical_issue}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Real-World Impact</span>
              </div>
              <p className="text-sm text-slate-300">{explanation.impact_statement}</p>
            </div>
          </div>

          {/* Recommendations */}
          {explanation.recommendations && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Recommendations</span>
              </div>
              <ul className="space-y-2">
                {explanation.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Positive finding */}
          {explanation.positive_finding && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-sm text-green-300">✓ {explanation.positive_finding}</p>
            </div>
          )}

          {/* Compliance */}
          {explanation.compliance_risk && (
            <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-3">
              <p className="text-xs text-slate-400"><span className="text-yellow-400 font-semibold">⚖ Compliance: </span>{explanation.compliance_risk}</p>
            </div>
          )}

          {/* Q&A */}
          <div className="border-t border-slate-700/50 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Ask Gemini about your report</span>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setQuestion(s)}
                  className="text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="Ask anything about your bias report..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {answer && (
              <div className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 leading-relaxed">{answer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
