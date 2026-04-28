import React from 'react'
import { Shield, Zap } from 'lucide-react'

export default function Navbar({ page, setPage }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'audit', label: 'Audit' },
    { id: 'about', label: 'How It Works' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-white">Fair<span className="text-blue-400">Lens</span></span>
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                page === l.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setPage('audit')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Run Audit
        </button>
      </div>
    </nav>
  )
}
