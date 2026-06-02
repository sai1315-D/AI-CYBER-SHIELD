from pathlib import Path
from typing import Dict

import cv2
import numpy as np


def _compute_entropy_from_counts(counts: np.ndarray) -> float:
    counts = counts.astype(np.float64)
    total = counts.sum()
    if total <= 0:
        return 0.0
    probabilities = counts[counts > 0] / total
    return float(-np.sum(probabilities * np.log2(probabilities)))


def _calculate_image_entropy(image: np.ndarray) -> float:
    if image.ndim == 3 and image.shape[2] == 3:
        entropies = []
        for channel in range(3):
            hist = cv2.calcHist([image], [channel], None, [256], [0, 256]).flatten()
            entropies.append(_compute_entropy_from_counts(hist))
        return float(np.mean(entropies))

    hist = cv2.calcHist([image], [0], None, [256], [0, 256]).flatten()
    return _compute_entropy_from_counts(hist)


def _calculate_lsb_entropy(image: np.ndarray) -> float:
    if image.ndim == 3 and image.shape[2] == 3:
        entropies = []
        for channel in range(3):
            lsb_plane = image[:, :, channel] & 1
            counts = np.bincount(lsb_plane.flatten(), minlength=2)
            entropies.append(_compute_entropy_from_counts(counts))
        return float(np.mean(entropies))

    lsb_plane = image & 1
    counts = np.bincount(lsb_plane.flatten(), minlength=2)
    return _compute_entropy_from_counts(counts)


def _analyze_histogram(image: np.ndarray) -> Dict[str, float]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist_norm = hist / (hist.sum() + 1e-12)
    smoothed = cv2.GaussianBlur(hist_norm.reshape(-1, 1), (9, 1), 0).flatten()
    anomaly = float(np.mean(np.abs(hist_norm - smoothed)))
    peakiness = float(np.sum(hist_norm > hist_norm.mean() + 2.0 * hist_norm.std()) / 256.0)
    return {
        "histogram_anomaly": anomaly,
        "histogram_peakiness": peakiness,
    }


def _risk_level(score: int) -> str:
    if score >= 75:
        return "High"
    if score >= 45:
        return "Medium"
    return "Low"


def analyze_image(path: Path) -> Dict[str, object]:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Image file not found: {path}")

    image = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError("Unable to read image file for analysis.")

    entropy = _calculate_image_entropy(image)
    lsb_entropy = _calculate_lsb_entropy(image)
    histogram_metrics = _analyze_histogram(image)

    score = 10
    score += min(int((entropy - 4.5) * 10), 30)
    score += min(int((lsb_entropy - 0.5) * 50), 40)
    score += min(int(histogram_metrics["histogram_anomaly"] * 120), 30)
    score += min(int(histogram_metrics["histogram_peakiness"] * 120), 20)
    score = max(0, min(100, score))

    result = "Safe"
    if score >= 70:
        result = "Hidden Data Detected"
    elif score >= 40:
        result = "Suspicious"

    return {
        "threat_score": score,
        "analysis_result": result,
        "entropy": round(entropy, 4),
        "lsb_entropy": round(lsb_entropy, 4),
        **{k: round(v, 6) for k, v in histogram_metrics.items()},
        "risk_level": _risk_level(score),
    }
