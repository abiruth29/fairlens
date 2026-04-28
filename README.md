# FairLens 🔍 — AI Bias Detection & Mitigation Platform

> **GDG Solutions Challenge 2026 · Unbiased AI Decision**
> Detect, explain, and fix bias in automated decision systems — before they harm real people.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5-4285F4.svg)](https://ai.google.dev)

---

## The Problem

AI models now make life-changing decisions: who gets hired, who receives a loan, who is flagged as a flight risk in criminal justice. These models learn from historically biased data and **silently amplify the same discrimination they were supposed to eliminate**.

- Amazon's hiring AI penalized women's CVs
- Optum's healthcare algorithm assigned lower risk scores to Black patients
- COMPAS recidivism scores were shown to be racially biased in ProPublica's 2016 investigation

Most organizations have **no tooling** to detect, measure, or fix this before deployment.

---

## The Solution

**FairLens** is a comprehensive bias audit platform that gives any organization:

1. **Detect** — 7 fairness metrics computed in under 5 seconds on any CSV dataset
2. **Explain** — Google Gemini 1.5 translates statistical findings into plain language with actionable insights
3. **Mitigate** — One-click reweighting and threshold calibration with before/after comparison
4. **Report** — Downloadable audit reports for EU AI Act and GDPR compliance

---

## Demo

> **Live MVP**: https://fairlens.web.app _(deploy with Firebase Hosting)_
> **Demo Video**: [3-minute walkthrough](#)

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Google Gemini API key ([get one free](https://makersuite.google.com/app/apikey))

### Backend Setup

```bash
cd fairlens/backend
cp .env.example .env
# Add your GEMINI_API_KEY to .env

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend Setup

```bash
cd fairlens/frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Docker (Full Stack)

```bash
# From project root
cp fairlens/backend/.env.example .env
# Add GEMINI_API_KEY to .env
docker-compose up --build
# App: http://localhost:3000 | API: http://localhost:8000
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FairLens Platform                         │
│                                                                  │
│  ┌─────────────────┐    REST API    ┌──────────────────────────┐ │
│  │  React Frontend │ ◄────────────► │   FastAPI Backend        │ │
│  │  Vite + Tailwind│                │   Python 3.11            │ │
│  │  Recharts       │                │                          │ │
│  │  Framer Motion  │                │  ┌──────────────────┐    │ │
│  └─────────────────┘                │  │  Bias Engine     │    │ │
│                                     │  │  - fairlearn     │    │ │
│                                     │  │  - scikit-learn  │    │ │
│                                     │  │  - numpy/pandas  │    │ │
│                                     │  └──────────────────┘    │ │
│                                     │                          │ │
│                                     │  ┌──────────────────┐    │ │
│                                     │  │  Gemini 1.5 Flash│    │ │
│                                     │  │  - Explanations  │    │ │
│                                     │  │  - Q&A Chat      │    │ │
│                                     │  │  - Mitigation    │    │ │
│                                     │  └──────────────────┘    │ │
│                                     └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Cloud Deployment:
├── Frontend: Firebase Hosting (CDN)
├── Backend:  Google Cloud Run (auto-scaling)
└── Auth:     Firebase Authentication (Google SSO)
```

---

## Fairness Metrics

| Metric | Description | Ideal Value |
|--------|-------------|-------------|
| Demographic Parity Difference | Equal positive rates across groups | = 0 |
| Disparate Impact Ratio | Ratio of positive rates (4/5ths rule) | ≥ 0.8 |
| Equalized Odds (TPR) | Equal true positive rates | = 0 |
| Equalized Odds (FPR) | Equal false positive rates | = 0 |
| Predictive Parity | Equal precision across groups | = 0 |
| Group Accuracy Gap | Equal model accuracy | = 0 |

### Severity Classification

| Level | Threshold | What It Means |
|-------|-----------|---------------|
| 🔴 Critical | DPD > 0.25 or DI < 0.6 | Severe discrimination — do not deploy |
| 🟠 High | DPD > 0.15 or DI < 0.7 | Significant bias — require immediate mitigation |
| 🟡 Moderate | DPD > 0.05 or DI < 0.8 | Concerning — monitor and mitigate |
| 🟢 Low | All metrics within thresholds | Acceptable fairness for deployment |

---

## Sample Datasets

FairLens ships with 3 real-world datasets known for bias:

| Dataset | Domain | Sensitive Attribute | Known Bias |
|---------|--------|---------------------|------------|
| COMPAS Recidivism | Criminal Justice | Race | Racial bias vs. Black defendants |
| UCI Adult Income | Employment | Sex | Gender pay gap |
| German Credit Risk | Finance | Age Group | Youth discrimination |

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit` | POST | Run full bias audit on uploaded CSV |
| `/api/ask` | POST | Ask Gemini a question about the report |
| `/api/mitigation-plan` | POST | Get structured mitigation plan |
| `/api/sample-audit/{id}` | POST | Run audit on built-in sample dataset |
| `/api/sample-datasets` | GET | List available sample datasets |
| `/health` | GET | Health check |

Full Swagger docs: `/docs`

---

## Mitigation Techniques

1. **Sample Reweighting** — Assigns higher weights to underrepresented group-outcome combinations during training. Reduces demographic parity gap by 30–50%.

2. **Threshold Calibration** — Computes per-group decision thresholds to equalize true positive rates. Addresses equalized odds violations post-hoc.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.11, Uvicorn |
| AI/ML | Google Gemini 1.5 Flash, fairlearn, scikit-learn |
| Data | pandas, numpy |
| Cloud | Google Cloud Run, Firebase Hosting, Firebase Auth |
| DevOps | Docker, docker-compose |

---

## Alignment With Responsible AI

FairLens is designed to help organizations comply with:

- **EU AI Act (2024)** — Art. 10 requires high-risk AI systems to use unbiased training data
- **GDPR Art. 22** — Individuals have the right not to be subject to purely automated decisions
- **US Executive Order on AI (Oct 2023)** — Requires testing AI systems for discrimination


---

## License

MIT License — see [LICENSE](LICENSE)

---

*Built with ❤️ for the GDG Solutions Challenge 2026 · Problem Statement: Unbiased AI Decision*
