"""
FairLens Gemini AI Explainer
Uses Google Gemini 1.5 Pro to generate plain-language bias explanations,
actionable recommendations, and counterfactual analysis.
"""

import os
import json
from typing import Dict, Optional
import google.generativeai as genai

# Configure Gemini
_api_key = os.getenv("GEMINI_API_KEY", "")
if _api_key:
    genai.configure(api_key=_api_key)

_MODEL = "gemini-1.5-flash"


def _get_model():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(_MODEL)


def explain_bias_report(audit_result: Dict) -> Dict[str, str]:
    """
    Given a bias audit result dict, ask Gemini to:
    1. Explain findings in plain language
    2. Identify the most critical issue
    3. Give 3 concrete mitigation recommendations
    4. Estimate real-world impact
    """
    model = _get_model()
    if not model:
        return _fallback_explanation(audit_result)

    metrics = audit_result.get("metrics", {})
    severity = audit_result.get("severity", "UNKNOWN")
    sensitive = audit_result.get("sensitive_attribute", "unknown")
    groups = audit_result.get("group_stats", [])

    prompt = f"""You are a fairness AI expert analyzing a bias audit report for an automated decision system.

AUDIT RESULTS:
- Sensitive attribute: {sensitive}
- Severity Level: {severity}
- Demographic Parity Difference: {metrics.get('demographic_parity_difference', 'N/A')}
  (0 = perfect fairness, >0.1 = concerning, >0.2 = severe)
- Disparate Impact Ratio: {metrics.get('disparate_impact_ratio', 'N/A')}
  (1.0 = fair, <0.8 = fails 4/5ths rule, <0.6 = severe)
- Equalized Odds TPR Difference: {metrics.get('equalized_odds_tpr_diff', 'N/A')}
  (0 = fair, measures gap in true positive rates across groups)
- Group Statistics: {json.dumps(groups, indent=2)}

Provide a JSON response with exactly these keys:
{{
  "plain_summary": "2-3 sentence plain English explanation of what bias was found and what it means for people",
  "critical_issue": "The single most important fairness problem identified",
  "impact_statement": "What this bias means in the real world — who is harmed and how",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "positive_finding": "One thing the model does well or one silver lining",
  "compliance_risk": "EU AI Act / GDPR compliance risk assessment in one sentence"
}}

Be specific, accessible, and actionable. Avoid jargon. Output ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        return _fallback_explanation(audit_result)


def answer_bias_question(question: str, audit_result: Dict) -> str:
    """
    Conversational Q&A — answer a user question about the bias report.
    """
    model = _get_model()
    if not model:
        return "Gemini API key not configured. Please set GEMINI_API_KEY in .env to enable AI explanations."

    context = json.dumps(audit_result, indent=2)
    prompt = f"""You are FairLens AI, an expert in algorithmic fairness and bias detection.
A user is asking about their bias audit report.

AUDIT CONTEXT:
{context}

USER QUESTION: {question}

Answer clearly and helpfully in 2-4 sentences. Be specific to their data.
If you reference numbers, explain what they mean practically.
Focus on what the user should DO with this information."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Unable to generate AI explanation: {str(e)}"


def generate_mitigation_plan(audit_result: Dict) -> Dict:
    """
    Generate a structured mitigation plan with timeline and effort estimates.
    """
    model = _get_model()
    if not model:
        return _fallback_mitigation_plan(audit_result)

    metrics = audit_result.get("metrics", {})
    severity = audit_result.get("severity", "UNKNOWN")
    sensitive = audit_result.get("sensitive_attribute", "unknown")

    prompt = f"""You are an ML fairness engineer. Generate a mitigation plan for this bias audit.

Severity: {severity}
Sensitive Attribute: {sensitive}
Demographic Parity Difference: {metrics.get('demographic_parity_difference', 'N/A')}
Disparate Impact Ratio: {metrics.get('disparate_impact_ratio', 'N/A')}
Equalized Odds TPR Diff: {metrics.get('equalized_odds_tpr_diff', 'N/A')}

Return a JSON object with:
{{
  "immediate_actions": [
    {{"action": "...", "effort": "Low/Medium/High", "impact": "description", "timeline": "days"}}
  ],
  "short_term": [
    {{"action": "...", "effort": "Low/Medium/High", "impact": "description", "timeline": "weeks"}}
  ],
  "long_term": [
    {{"action": "...", "effort": "Low/Medium/High", "impact": "description", "timeline": "months"}}
  ],
  "monitoring_plan": "How to monitor fairness going forward"
}}

Be specific and technical. Output ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return _fallback_mitigation_plan(audit_result)


# ─── Fallback responses when Gemini API key is not configured ───────────────

def _fallback_explanation(audit_result: Dict) -> Dict[str, str]:
    metrics = audit_result.get("metrics", {})
    severity = audit_result.get("severity", "UNKNOWN")
    sensitive = audit_result.get("sensitive_attribute", "unknown")
    dpd = metrics.get("demographic_parity_difference", 0)
    di = metrics.get("disparate_impact_ratio", 1)

    return {
        "plain_summary": f"The model shows {severity.lower()} bias based on the '{sensitive}' attribute. "
                         f"The demographic parity difference is {dpd:.3f}, meaning groups have unequal positive decision rates. "
                         f"A disparate impact ratio of {di:.3f} {'fails' if di < 0.8 else 'passes'} the 4/5ths fairness rule.",
        "critical_issue": f"Demographic parity gap of {dpd:.3f} indicates systematic disparity in outcomes across {sensitive} groups.",
        "impact_statement": "People in disadvantaged groups may receive fewer positive outcomes (e.g., approvals, selections) than their qualifications warrant.",
        "recommendations": [
            "Apply sample reweighting during model training to balance group representation.",
            "Perform threshold calibration per group to equalize true positive rates.",
            "Audit the training data for historical discrimination and apply fairness constraints.",
        ],
        "positive_finding": f"Overall model accuracy is {audit_result.get('overall_accuracy', 'N/A')}%, showing the model has learned meaningful patterns.",
        "compliance_risk": "This bias level may trigger scrutiny under EU AI Act Article 10 (high-risk AI) and GDPR Article 22 (automated decision-making).",
    }


def _fallback_mitigation_plan(audit_result: Dict) -> Dict:
    return {
        "immediate_actions": [
            {"action": "Apply reweighting mitigation (available in FairLens dashboard)", "effort": "Low", "impact": "Reduces demographic parity gap by 30-50%", "timeline": "1 day"},
            {"action": "Audit training data for underrepresentation of minority groups", "effort": "Medium", "impact": "Identifies root cause of bias", "timeline": "2-3 days"},
        ],
        "short_term": [
            {"action": "Retrain model with fairness constraints using fairlearn GridSearch", "effort": "Medium", "impact": "Balances accuracy-fairness tradeoff", "timeline": "1-2 weeks"},
            {"action": "Implement per-group threshold calibration", "effort": "Low", "impact": "Equalizes true positive rates across groups", "timeline": "3-5 days"},
        ],
        "long_term": [
            {"action": "Establish a fairness review board and quarterly bias audits", "effort": "High", "impact": "Institutional safeguards for ongoing fairness", "timeline": "3 months"},
            {"action": "Collect representative data and implement feedback loops", "effort": "High", "impact": "Addresses root cause: biased historical data", "timeline": "6 months"},
        ],
        "monitoring_plan": "Schedule monthly FairLens audits and set alerts when demographic parity difference exceeds 0.1. Track fairness metrics alongside accuracy in your model registry.",
    }
