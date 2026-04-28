"""
FairLens Bias Detection Engine
Computes multiple fairness metrics across sensitive attributes.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings("ignore")


# ─── Metric Computations ────────────────────────────────────────────────────

def demographic_parity_difference(y_pred: np.ndarray, sensitive: np.ndarray) -> float:
    """P(Ŷ=1|A=1) - P(Ŷ=1|A=0)"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return 0.0
    rates = [np.mean(y_pred[sensitive == g]) for g in groups]
    return float(max(rates) - min(rates))


def disparate_impact_ratio(y_pred: np.ndarray, sensitive: np.ndarray) -> float:
    """min(P(Ŷ=1|A=g)) / max(P(Ŷ=1|A=g)) — 1.0 is fair, <0.8 triggers 4/5ths rule"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return 1.0
    rates = [np.mean(y_pred[sensitive == g]) for g in groups]
    if max(rates) == 0:
        return 1.0
    return float(min(rates) / max(rates))


def equalized_odds_difference(
    y_true: np.ndarray, y_pred: np.ndarray, sensitive: np.ndarray
) -> Dict[str, float]:
    """Difference in TPR and FPR across groups"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return {"tpr_diff": 0.0, "fpr_diff": 0.0}

    tprs, fprs = [], []
    for g in groups:
        mask = sensitive == g
        yt, yp = y_true[mask], y_pred[mask]
        tp = np.sum((yt == 1) & (yp == 1))
        fn = np.sum((yt == 1) & (yp == 0))
        fp = np.sum((yt == 0) & (yp == 1))
        tn = np.sum((yt == 0) & (yp == 0))
        tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        tprs.append(tpr)
        fprs.append(fpr)

    return {
        "tpr_diff": float(max(tprs) - min(tprs)),
        "fpr_diff": float(max(fprs) - min(fprs)),
    }


def predictive_parity(
    y_true: np.ndarray, y_pred: np.ndarray, sensitive: np.ndarray
) -> float:
    """Difference in precision (PPV) across groups"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return 0.0
    ppvs = []
    for g in groups:
        mask = sensitive == g
        yt, yp = y_true[mask], y_pred[mask]
        tp = np.sum((yt == 1) & (yp == 1))
        fp = np.sum((yt == 0) & (yp == 1))
        ppv = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        ppvs.append(ppv)
    return float(max(ppvs) - min(ppvs))


def group_accuracy_gap(
    y_true: np.ndarray, y_pred: np.ndarray, sensitive: np.ndarray
) -> float:
    """Difference in accuracy across groups"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return 0.0
    accs = [accuracy_score(y_true[sensitive == g], y_pred[sensitive == g]) for g in groups]
    return float(max(accs) - min(accs))


def per_group_stats(
    y_true: np.ndarray, y_pred: np.ndarray, sensitive: np.ndarray, group_labels: Dict
) -> List[Dict]:
    """Per-group breakdown: count, positive rate, accuracy, TPR, FPR"""
    results = []
    for g in np.unique(sensitive):
        mask = sensitive == g
        yt, yp = y_true[mask], y_pred[mask]
        tp = int(np.sum((yt == 1) & (yp == 1)))
        fn = int(np.sum((yt == 1) & (yp == 0)))
        fp = int(np.sum((yt == 0) & (yp == 1)))
        tn = int(np.sum((yt == 0) & (yp == 0)))
        tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        results.append({
            "group": group_labels.get(g, str(g)),
            "count": int(np.sum(mask)),
            "positive_rate": float(np.mean(yp)),
            "accuracy": float(accuracy_score(yt, yp)),
            "tpr": float(tpr),
            "fpr": float(fpr),
        })
    return results


# ─── Severity Classifier ────────────────────────────────────────────────────

def classify_severity(dpd: float, di: float, eod_tpr: float) -> str:
    """Returns CRITICAL / HIGH / MODERATE / LOW based on metric thresholds"""
    if dpd > 0.25 or di < 0.6 or eod_tpr > 0.25:
        return "CRITICAL"
    if dpd > 0.15 or di < 0.7 or eod_tpr > 0.15:
        return "HIGH"
    if dpd > 0.05 or di < 0.8 or eod_tpr > 0.05:
        return "MODERATE"
    return "LOW"


# ─── Mitigation Engine ──────────────────────────────────────────────────────

def apply_reweighting(
    X: np.ndarray, y: np.ndarray, sensitive: np.ndarray
) -> np.ndarray:
    """Compute sample weights to balance sensitive group × outcome combinations"""
    n = len(y)
    weights = np.ones(n)
    for g in np.unique(sensitive):
        for label in [0, 1]:
            mask = (sensitive == g) & (y == label)
            if np.sum(mask) > 0:
                expected = (np.mean(sensitive == g) * np.mean(y == label))
                actual = np.mean(mask)
                weights[mask] = expected / actual if actual > 0 else 1.0
    return weights


def apply_threshold_calibration(
    proba: np.ndarray, sensitive: np.ndarray, y_true: np.ndarray
) -> np.ndarray:
    """Calibrate per-group thresholds to equalize TPR"""
    groups = np.unique(sensitive)
    if len(groups) < 2:
        return (proba >= 0.5).astype(int)

    thresholds = {}
    for g in groups:
        mask = sensitive == g
        best_t, best_score = 0.5, float("inf")
        for t in np.arange(0.3, 0.8, 0.05):
            pred = (proba[mask] >= t).astype(int)
            yt = y_true[mask]
            tp = np.sum((yt == 1) & (pred == 1))
            fn = np.sum((yt == 1) & (pred == 0))
            tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            score = abs(tpr - 0.7)
            if score < best_score:
                best_score = score
                best_t = t
        thresholds[g] = best_t

    result = np.zeros(len(proba), dtype=int)
    for g, t in thresholds.items():
        mask = sensitive == g
        result[mask] = (proba[mask] >= t).astype(int)
    return result


# ─── Main Audit Function ─────────────────────────────────────────────────────

def run_bias_audit(
    df: pd.DataFrame,
    target_col: str,
    sensitive_col: str,
    prediction_col: Optional[str] = None,
) -> Dict:
    """
    Full bias audit pipeline.
    If prediction_col is None, trains a Logistic Regression model internally.
    Returns a comprehensive metrics dict.
    """
    df = df.dropna(subset=[target_col, sensitive_col])

    # Encode target
    le_target = LabelEncoder()
    y_true = le_target.fit_transform(df[target_col].astype(str))

    # Encode sensitive attribute
    le_sens = LabelEncoder()
    sensitive = le_sens.fit_transform(df[sensitive_col].astype(str))
    group_labels = {i: label for i, label in enumerate(le_sens.classes_)}

    # Get or train predictions
    if prediction_col and prediction_col in df.columns:
        le_pred = LabelEncoder()
        y_pred = le_pred.fit_transform(df[prediction_col].astype(str))
        proba = y_pred.astype(float)
        y_pred_mit = y_pred
        proba_mit = proba
    else:
        # Train LR on non-sensitive features
        feature_cols = [c for c in df.columns if c not in [target_col, sensitive_col]]
        if not feature_cols:
            raise ValueError("No feature columns available for model training.")

        X = pd.get_dummies(df[feature_cols], drop_first=True).fillna(0).values
        X_train, X_test, y_train, y_test, s_train, s_test = train_test_split(
            X, y_true, sensitive, test_size=0.3, random_state=42
        )
        model = LogisticRegression(max_iter=500, random_state=42)
        model.fit(X_train, y_train)
        proba = model.predict_proba(X_test)[:, 1]
        y_pred = model.predict(X_test)
        y_true, sensitive = y_test, s_test

        # Mitigated predictions
        weights = apply_reweighting(X_train, y_train, s_train)
        model_mit = LogisticRegression(max_iter=500, random_state=42)
        model_mit.fit(X_train, y_train, sample_weight=weights)
        y_pred_mit = model_mit.predict(X_test)
        proba_mit = model_mit.predict_proba(X_test)[:, 1]

    # ── Compute metrics ──
    dpd = demographic_parity_difference(y_pred, sensitive)
    di  = disparate_impact_ratio(y_pred, sensitive)
    eod = equalized_odds_difference(y_true, y_pred, sensitive)
    pp  = predictive_parity(y_true, y_pred, sensitive)
    gap = group_accuracy_gap(y_true, y_pred, sensitive)
    severity = classify_severity(dpd, di, eod["tpr_diff"])

    # Mitigated metrics
    dpd_mit = demographic_parity_difference(y_pred_mit, sensitive)
    di_mit  = disparate_impact_ratio(y_pred_mit, sensitive)
    eod_mit = equalized_odds_difference(y_true, y_pred_mit, sensitive)

    # Per-group stats
    groups_baseline = per_group_stats(y_true, y_pred, sensitive, group_labels)
    groups_mitigated = per_group_stats(y_true, y_pred_mit, sensitive, group_labels)

    overall_acc = float(accuracy_score(y_true, y_pred))
    overall_acc_mit = float(accuracy_score(y_true, y_pred_mit))

    return {
        "severity": severity,
        "overall_accuracy": round(overall_acc * 100, 2),
        "overall_accuracy_mitigated": round(overall_acc_mit * 100, 2),
        "metrics": {
            "demographic_parity_difference": round(dpd, 4),
            "disparate_impact_ratio": round(di, 4),
            "equalized_odds_tpr_diff": round(eod["tpr_diff"], 4),
            "equalized_odds_fpr_diff": round(eod["fpr_diff"], 4),
            "predictive_parity_difference": round(pp, 4),
            "group_accuracy_gap": round(gap, 4),
        },
        "metrics_mitigated": {
            "demographic_parity_difference": round(dpd_mit, 4),
            "disparate_impact_ratio": round(di_mit, 4),
            "equalized_odds_tpr_diff": round(eod_mit["tpr_diff"], 4),
            "equalized_odds_fpr_diff": round(eod_mit["fpr_diff"], 4),
        },
        "group_stats": groups_baseline,
        "group_stats_mitigated": groups_mitigated,
        "sensitive_attribute": sensitive_col,
        "target_attribute": target_col,
        "group_labels": group_labels,
        "sample_size": len(y_true),
    }
