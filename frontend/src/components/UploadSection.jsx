import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Database, ChevronRight, FileText, X } from 'lucide-react'
import { auditDataset, auditSampleDataset, getSampleDatasets } from '../utils/api'

const SAMPLE_DATASETS = [
  { id: 'compas', name: 'COMPAS Recidivism', domain: 'Criminal Justice', badge: 'bg-red-500/20 text-red-400', icon: '⚖️' },
  { id: 'adult_income', name: 'UCI Adult Income', domain: 'Employment', badge: 'bg-blue-500/20 text-blue-400', icon: '💼' },
  { id: 'credit', name: 'German Credit Risk', domain: 'Finance', badge: 'bg-green-500/20 text-green-400', icon: '💳' },
]

export default function UploadSection({ onResult, loading, setLoading }) {
  const [file, setFile] = useState(null)
  const [targetCol, setTargetCol] = useState('')
  const [sensitiveCol, setSensitiveCol] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('upload') // 'upload' | 'sample'

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  const handleAudit = async () => {
    if (!file || !targetCol.trim() || !sensitiveCol.trim()) {
      setError('Please provide a file, target column, and sensitive attribute column.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await auditDataset(file, targetCol.trim(), sensitiveCol.trim())
      onResult(result)
    } catch (e) {
      setError(e.response?.data?.detail || 'Audit failed. Please check your column names and CSV format.')
    } finally {
      setLoading(false)
    }
  }

  const handleSample = async (id) => {
    setLoading(true)
    setError('')
    try {
      const result = await auditSampleDataset(id)
      onResult(result)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load sample dataset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
        {[['upload', 'Upload CSV', Upload], ['sample', 'Sample Datasets', Database]].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : file
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/30'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  className="ml-2 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center hover:bg-red-500/30"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Drop your CSV here</p>
                <p className="text-slate-400 text-sm">or click to browse · CSV files only</p>
              </>
            )}
          </div>

          {/* Column inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Column *</label>
              <input
                type="text"
                value={targetCol}
                onChange={e => setTargetCol(e.target.value)}
                placeholder="e.g. income, hired, approved"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">The outcome the model predicts</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sensitive Attribute *</label>
              <input
                type="text"
                value={sensitiveCol}
                onChange={e => setSensitiveCol(e.target.value)}
                placeholder="e.g. race, gender, age_group"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">The protected characteristic to audit</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleAudit}
            disabled={loading || !file}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Bias Audit...
              </>
            ) : (
              <>Analyze for Bias <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm mb-4">
            Try FairLens on real-world datasets known for bias issues.
          </p>
          {SAMPLE_DATASETS.map(ds => (
            <button
              key={ds.id}
              onClick={() => handleSample(ds.id)}
              disabled={loading}
              className="w-full card p-5 flex items-center gap-4 hover:bg-slate-700/50 transition-all text-left group disabled:opacity-50"
            >
              <span className="text-2xl">{ds.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold">{ds.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ds.badge}`}>{ds.domain}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {ds.id === 'compas' && 'Famous for racial bias in recidivism prediction (Angwin et al., 2016)'}
                  {ds.id === 'adult_income' && 'Gender wage gap analysis on 1994 census data'}
                  {ds.id === 'credit' && 'Age-based discrimination in credit risk scoring'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>
          ))}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-4 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />
              Running bias audit...
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">{error}</div>
          )}
        </div>
      )}
    </div>
  )
}
