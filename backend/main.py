"""
FairLens API — FastAPI Backend
Bias detection, Gemini AI explanations, and mitigation for automated decision systems.
"""

import os
import io
import json
import logging
from typing import Optional

import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from bias_engine import run_bias_audit
from gemini_explainer import explain_bias_report, answer_bias_question, generate_mitigation_plan

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fairlens")

app = FastAPI(
    title="FairLens API",
    description="AI Bias Detection & Mitigation Platform — Google Solutions Challenge 2026",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str
    audit_result: dict


class MitigationRequest(BaseModel):
    audit_result: dict


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "FairLens API",
        "version": "1.0.0",
        "status": "running",
        "description": "AI Bias Detection & Mitigation Platform",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))}


@app.post("/api/audit")
async def audit_dataset(
    file: UploadFile = File(...),
    target_col: str = Form(...),
    sensitive_col: str = Form(...),
    prediction_col: Optional[str] = Form(None),
):
    """
    Main audit endpoint.
    Upload a CSV, specify target and sensitive columns → get full bias report.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    if target_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target_col}' not found in CSV.")
    if sensitive_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Sensitive column '{sensitive_col}' not found in CSV.")

    logger.info(f"Auditing dataset: {file.filename} | target={target_col} | sensitive={sensitive_col}")

    try:
        audit_result = run_bias_audit(df, target_col, sensitive_col, prediction_col or None)
    except Exception as e:
        logger.error(f"Audit failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bias audit failed: {str(e)}")

    # Enrich with Gemini AI explanation
    try:
        explanation = explain_bias_report(audit_result)
        audit_result["ai_explanation"] = explanation
    except Exception as e:
        logger.warning(f"Gemini explanation failed: {e}")
        audit_result["ai_explanation"] = None

    return JSONResponse(content=audit_result)


@app.get("/api/columns")
async def get_columns(file: UploadFile = File(...)):
    """Return CSV column names for the frontend column picker."""
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")), nrows=5)
        return {"columns": df.columns.tolist(), "preview": df.head(3).to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ask")
async def ask_gemini(request: QuestionRequest):
    """Conversational AI — answer a question about the bias report."""
    answer = answer_bias_question(request.question, request.audit_result)
    return {"answer": answer}


@app.post("/api/mitigation-plan")
async def get_mitigation_plan(request: MitigationRequest):
    """Generate a structured mitigation plan for the bias findings."""
    plan = generate_mitigation_plan(request.audit_result)
    return plan


@app.get("/api/sample-datasets")
async def list_sample_datasets():
    """List available built-in sample datasets."""
    return {
        "datasets": [
            {
                "id": "compas",
                "name": "COMPAS Recidivism",
                "description": "Criminal justice recidivism scores — famous for racial bias",
                "sensitive_attribute": "race",
                "target": "two_year_recid",
                "rows": 6172,
                "domain": "Criminal Justice",
            },
            {
                "id": "adult_income",
                "name": "UCI Adult Income",
                "description": "Census income prediction — gender and race bias study",
                "sensitive_attribute": "sex",
                "target": "income",
                "rows": 32561,
                "domain": "Employment / Finance",
            },
            {
                "id": "credit",
                "name": "German Credit Risk",
                "description": "Credit approval decisions with age-based disparities",
                "sensitive_attribute": "age_group",
                "target": "credit_risk",
                "rows": 1000,
                "domain": "Finance",
            },
        ]
    }


@app.post("/api/sample-audit/{dataset_id}")
async def audit_sample_dataset(dataset_id: str):
    """Run bias audit on a built-in sample dataset."""
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    path = os.path.join(sample_dir, f"{dataset_id}.csv")

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Sample dataset '{dataset_id}' not found.")

    configs = {
        "compas": {"target_col": "two_year_recid", "sensitive_col": "race"},
        "adult_income": {"target_col": "income", "sensitive_col": "sex"},
        "credit": {"target_col": "credit_risk", "sensitive_col": "age_group"},
    }

    if dataset_id not in configs:
        raise HTTPException(status_code=400, detail="Unknown dataset ID.")

    df = pd.read_csv(path)
    cfg = configs[dataset_id]

    try:
        audit_result = run_bias_audit(df, cfg["target_col"], cfg["sensitive_col"])
        explanation = explain_bias_report(audit_result)
        audit_result["ai_explanation"] = explanation
        return JSONResponse(content=audit_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
