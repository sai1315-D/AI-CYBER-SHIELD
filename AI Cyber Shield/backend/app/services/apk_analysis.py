import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

try:
    from androguard.misc import AnalyzeAPK
except ImportError:  # pragma: no cover - handled at runtime for clearer API errors
    AnalyzeAPK = None


HIGH_RISK_PERMISSIONS = {
    "android.permission.READ_SMS",
    "android.permission.SEND_SMS",
    "android.permission.RECEIVE_SMS",
    "android.permission.CALL_PHONE",
    "android.permission.READ_CALL_LOG",
    "android.permission.WRITE_CALL_LOG",
    "android.permission.RECORD_AUDIO",
    "android.permission.CAMERA",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.READ_CONTACTS",
    "android.permission.WRITE_CONTACTS",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.MANAGE_EXTERNAL_STORAGE",
    "android.permission.REQUEST_INSTALL_PACKAGES",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.BIND_DEVICE_ADMIN",
    "android.permission.QUERY_ALL_PACKAGES",
}

MEDIUM_RISK_PERMISSIONS = {
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.ACCESS_WIFI_STATE",
    "android.permission.CHANGE_WIFI_STATE",
    "android.permission.BLUETOOTH",
    "android.permission.BLUETOOTH_ADMIN",
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.WAKE_LOCK",
    "android.permission.VIBRATE",
    "android.permission.POST_NOTIFICATIONS",
}

SUSPICIOUS_COMPONENT_KEYWORDS = {
    "admin",
    "boot",
    "receiver",
    "background",
    "spy",
    "sms",
    "payload",
    "shell",
    "inject",
    "remote",
}


@dataclass
class APKAnalysisResult:
    file_name: str
    package_name: str | None
    app_name: str | None
    version_name: str | None
    version_code: str | None
    permissions: list[str]
    activities: list[str]
    services: list[str]
    risk_score: int
    risk_level: str
    findings: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


class APKAnalysisError(Exception):
    """Raised when an APK cannot be analyzed."""


class APKAnalyzer:
    def analyze(self, apk_path: str | Path) -> APKAnalysisResult:
        path = Path(apk_path)
        self._validate_path(path)

        if AnalyzeAPK is None:
            raise APKAnalysisError(
                "Androguard is not installed. Install it with: pip install androguard"
            )

        try:
            apk, _, _ = AnalyzeAPK(str(path))
        except Exception as exc:
            raise APKAnalysisError(f"Unable to parse APK: {exc}") from exc

        permissions = sorted(self._safe_list(apk.get_permissions))
        activities = sorted(self._safe_list(apk.get_activities))
        services = sorted(self._safe_list(apk.get_services))

        risk_score, findings = self._calculate_risk_score(
            permissions=permissions,
            activities=activities,
            services=services,
        )

        return APKAnalysisResult(
            file_name=path.name,
            package_name=self._safe_value(apk.get_package),
            app_name=self._safe_value(apk.get_app_name),
            version_name=self._safe_value(apk.get_androidversion_name),
            version_code=self._safe_value(apk.get_androidversion_code),
            permissions=permissions,
            activities=activities,
            services=services,
            risk_score=risk_score,
            risk_level=self._risk_level(risk_score),
            findings=findings,
        )

    def analyze_json(self, apk_path: str | Path) -> str:
        return self.analyze(apk_path).to_json()

    def _validate_path(self, path: Path) -> None:
        if not path.exists():
            raise APKAnalysisError(f"APK file not found: {path}")
        if not path.is_file():
            raise APKAnalysisError(f"Path is not a file: {path}")
        if path.suffix.lower() != ".apk":
            raise APKAnalysisError("File must use the .apk extension.")

    def _safe_list(self, getter) -> list[str]:
        try:
            value = getter()
            return [str(item) for item in value if item]
        except Exception:
            return []

    def _safe_value(self, getter) -> str | None:
        try:
            value = getter()
            return str(value) if value not in (None, "") else None
        except Exception:
            return None

    def _calculate_risk_score(
        self,
        permissions: list[str],
        activities: list[str],
        services: list[str],
    ) -> tuple[int, list[str]]:
        score = 0
        findings = []

        high_risk = sorted(set(permissions) & HIGH_RISK_PERMISSIONS)
        medium_risk = sorted(set(permissions) & MEDIUM_RISK_PERMISSIONS)

        if high_risk:
            score += min(len(high_risk) * 9, 45)
            findings.append(f"High-risk permissions requested: {', '.join(high_risk)}")

        if medium_risk:
            score += min(len(medium_risk) * 3, 18)
            findings.append(f"Network or background permissions found: {', '.join(medium_risk)}")

        if len(permissions) >= 20:
            score += 15
            findings.append("Large permission set increases review priority.")
        elif len(permissions) >= 10:
            score += 8
            findings.append("Moderate permission set detected.")

        if len(services) >= 8:
            score += 12
            findings.append("Many services declared, including possible background behavior.")
        elif len(services) >= 4:
            score += 6
            findings.append("Multiple services declared.")

        suspicious_components = self._find_suspicious_components(activities + services)
        if suspicious_components:
            score += min(len(suspicious_components) * 5, 20)
            findings.append(
                "Suspicious component names: " + ", ".join(suspicious_components[:8])
            )

        if not findings:
            findings.append("No obvious APK risk indicators detected.")

        return min(score, 100), findings

    def _find_suspicious_components(self, components: list[str]) -> list[str]:
        matches = []
        for component in components:
            lowered = component.lower()
            if any(keyword in lowered for keyword in SUSPICIOUS_COMPONENT_KEYWORDS):
                matches.append(component)
        return sorted(set(matches))

    def _risk_level(self, score: int) -> str:
        if score >= 70:
            return "High"
        if score >= 35:
            return "Medium"
        return "Low"


def analyze_apk(apk_path: str | Path) -> dict[str, Any]:
    return APKAnalyzer().analyze(apk_path).to_dict()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyze APK permissions and components.")
    parser.add_argument("apk_path", help="Path to the APK file to analyze.")
    args = parser.parse_args()

    analyzer = APKAnalyzer()
    print(analyzer.analyze_json(args.apk_path))
