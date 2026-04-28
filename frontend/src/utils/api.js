import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

export async function auditDataset(file, targetCol, sensitiveCol, predictionCol) {
  const form = new FormData()
  form.append('file', file)
  form.append('target_col', targetCol)
  form.append('sensitive_col', sensitiveCol)
  if (predictionCol) form.append('prediction_col', predictionCol)
  const { data } = await api.post('/api/audit', form)
  return data
}

export async function auditSampleDataset(datasetId) {
  const { data } = await api.post(`/api/sample-audit/${datasetId}`)
  return data
}

export async function getSampleDatasets() {
  const { data } = await api.get('/api/sample-datasets')
  return data.datasets
}

export async function askQuestion(question, auditResult) {
  const { data } = await api.post('/api/ask', { question, audit_result: auditResult })
  return data.answer
}

export async function getMitigationPlan(auditResult) {
  const { data } = await api.post('/api/mitigation-plan', { audit_result: auditResult })
  return data
}
