import json
from dataclasses import asdict, dataclass
from pathlib import Path

import cv2
import numpy as np


@dataclass
class SteganographyResult:
    filename: str
    status: str
    risk_score: int
    entropy: float
    lsb_entropy: float
    histogram_anomaly_score: float
    lsb_uniformity_score: float
    findings: list[str]

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)


class SteganographyDetectionError(Exception):
    """Raised when an image cannot be analyzed."""


class ImageSteganographyDetector:
    SAFE = "Safe"
    SUSPICIOUS = "Suspicious"
    HIDDEN_DATA_DETECTED = "Hidden Data Detected"

    def analyze(self, image_path: str | Path) -> SteganographyResult:
        path = Path(image_path)
        if not path.exists():
            raise SteganographyDetectionError(f"Image not found: {path}")
        if not path.is_file():
            raise SteganographyDetectionError(f"Path is not a file: {path}")

        image = cv2.imread(str(path), cv2.IMREAD_COLOR)
        if image is None:
            raise SteganographyDetectionError("Unsupported or corrupted image file.")

        entropy = self._calculate_entropy(image)
        lsb_entropy = self._calculate_lsb_entropy(image)
        histogram_anomaly_score = self._calculate_histogram_anomaly(image)
        lsb_uniformity_score = self._calculate_lsb_uniformity(image)
        risk_score, findings = self._score(
            entropy=entropy,
            lsb_entropy=lsb_entropy,
            histogram_anomaly_score=histogram_anomaly_score,
            lsb_uniformity_score=lsb_uniformity_score,
        )

        return SteganographyResult(
            filename=path.name,
            status=self._status_from_score(risk_score),
            risk_score=risk_score,
            entropy=round(entropy, 4),
            lsb_entropy=round(lsb_entropy, 4),
            histogram_anomaly_score=round(histogram_anomaly_score, 4),
            lsb_uniformity_score=round(lsb_uniformity_score, 4),
            findings=findings,
        )

    def analyze_json(self, image_path: str | Path) -> str:
        return self.analyze(image_path).to_json()

    def _calculate_entropy(self, image: np.ndarray) -> float:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        histogram = cv2.calcHist([gray], [0], None, [256], [0, 256]).ravel()
        probabilities = histogram / max(histogram.sum(), 1)
        probabilities = probabilities[probabilities > 0]
        return float(-np.sum(probabilities * np.log2(probabilities)))

    def _calculate_lsb_entropy(self, image: np.ndarray) -> float:
        lsb_plane = image & 1
        values, counts = np.unique(lsb_plane, return_counts=True)
        probabilities = counts.astype(np.float64) / counts.sum()
        return float(-np.sum(probabilities * np.log2(probabilities)))

    def _calculate_histogram_anomaly(self, image: np.ndarray) -> float:
        channel_scores = []

        for channel in cv2.split(image):
            histogram = cv2.calcHist([channel], [0], None, [256], [0, 256]).ravel()
            even_bins = histogram[0::2]
            odd_bins = histogram[1::2]
            pair_difference = np.abs(even_bins - odd_bins)
            pair_total = even_bins + odd_bins + 1e-9
            similarity = 1 - np.mean(pair_difference / pair_total)
            channel_scores.append(float(np.clip(similarity, 0, 1)))

        return float(np.mean(channel_scores))

    def _calculate_lsb_uniformity(self, image: np.ndarray) -> float:
        lsb_plane = image & 1
        ones_ratio = float(np.mean(lsb_plane))
        return 1 - min(abs(0.5 - ones_ratio) * 2, 1)

    def _score(
        self,
        entropy: float,
        lsb_entropy: float,
        histogram_anomaly_score: float,
        lsb_uniformity_score: float,
    ) -> tuple[int, list[str]]:
        score = 0
        findings = []

        if entropy >= 7.6:
            score += 25
            findings.append("High image entropy indicates unusually random pixel data.")
        elif entropy >= 7.2:
            score += 12
            findings.append("Moderately high image entropy observed.")

        if lsb_entropy >= 0.98:
            score += 30
            findings.append("Least-significant-bit entropy is close to random.")
        elif lsb_entropy >= 0.94:
            score += 15
            findings.append("Least-significant-bit entropy is elevated.")

        if histogram_anomaly_score >= 0.9:
            score += 25
            findings.append("Even/odd histogram bins are unusually similar.")
        elif histogram_anomaly_score >= 0.82:
            score += 12
            findings.append("Histogram bin similarity is mildly unusual.")

        if lsb_uniformity_score >= 0.95:
            score += 20
            findings.append("LSB distribution is highly uniform.")
        elif lsb_uniformity_score >= 0.88:
            score += 10
            findings.append("LSB distribution is somewhat uniform.")

        if not findings:
            findings.append("No strong steganography indicators detected.")

        return min(score, 100), findings

    def _status_from_score(self, score: int) -> str:
        if score >= 70:
            return self.HIDDEN_DATA_DETECTED
        if score >= 35:
            return self.SUSPICIOUS
        return self.SAFE


def analyze_image_steganography(image_path: str | Path) -> dict:
    return asdict(ImageSteganographyDetector().analyze(image_path))


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Detect possible image steganography.")
    parser.add_argument("image_path", help="Path to the image file to analyze.")
    args = parser.parse_args()

    detector = ImageSteganographyDetector()
    print(detector.analyze_json(args.image_path))
