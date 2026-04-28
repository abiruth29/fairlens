import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import BiasReport from './components/BiasReport'
import HowItWorks from './components/HowItWorks'
import { Toaster } from 'react-hot-toast'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function App() {
  const [page, setPage] = useState('home')
  const [auditResult, setAuditResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleResult = (result) => {
    setAuditResult(result)
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setAuditResult(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #475569' } }} />
      <Navbar page={page} setPage={(p) => { setPage(p); handleReset() }} />

      {page === 'home' && <Hero setPage={setPage} />}

      {page === 'about' && <HowItWorks />}

      {page === 'audit' && (
        <div className="min-h-screen pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto">

            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3">
                {auditResult ? 'Bias Audit Report' : 'Run a Bias Audit'}
              </h1>
              <p className="text-slate-400">
                {auditResult
                  ? `Showing results for: ${auditResult.sensitive_attribute} → ${auditResult.target_attribute}`
                  : 'Upload your dataset or try a sample to detect hidden bias in seconds.'}
              </p>
            </div>

            {auditResult ? (
              <>
                {/* Back button */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> New Audit
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm ml-4"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                </div>
                <BiasReport result={auditResult} />
              </>
            ) : (
              <UploadSection
                onResult={handleResult}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
