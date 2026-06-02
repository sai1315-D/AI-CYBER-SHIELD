import json
from pathlib import Path
from typing import Dict, List

try:
    from androguard.core.bytecodes.apk import APK
except ImportError as exc:
    raise ImportError(
        "Androguard is required for APK analysis. Install it with `pip install androguard`."
    ) from exc


SUSPICIOUS_PERMISSIONS = {
    "android.permission.READ_SMS",
    "android.permission.SEND_SMS",
    "android.permission.RECEIVE_SMS",
    "android.permission.RECORD_AUDIO",
    "android.permission.CAMERA",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.READ_CONTACTS",
    "android.permission.WRITE_CONTACTS",
    "android.permission.CALL_PHONE",
    "android.permission.READ_CALL_LOG",
    "android.permission.WRITE_CALL_LOG",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.BIND_ACCESSIBILITY_SERVICE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.REQUEST_INSTALL_PACKAGES",
}


def _safe_list(items: List[str]) -> List[str]:
    return sorted({item for item in (items or []) if item})


def _build_summary(apk: APK) -> Dict[str, object]:
    permissions = _safe_list(apk.get_permissions())
    activities = _safe_list(apk.get_activities())
    services = _safe_list(apk.get_services())

    summary = {
        "package_name": apk.get_package(),
        "app_name": apk.get_app_name(),
        "version_name": apk.get_androidversion_name(),
        "version_code": apk.get_androidversion_code(),
        "min_sdk_version": apk.get_min_sdk_version(),
        "target_sdk_version": apk.get_target_sdk_version(),
        "permissions": permissions,
        "activities": activities,
        "services": services,
        "main_activity": apk.get_main_activity(),
    }
    return summary


def _calculate_risk_score(permissions: List[str], activities: List[str], services: List[str]) -> int:
    score = 10
    score += min(len(permissions) * 2, 40)
    score += min(len(activities) * 1, 20)
    score += min(len(services) * 2, 20)

    suspicious_count = sum(1 for perm in permissions if perm in SUSPICIOUS_PERMISSIONS)
    score += min(suspicious_count * 5, 30)

    if any("android.intent.action.MAIN" in activity for activity in activities):
        score += 5

    if score > 100:
        score = 100

    return int(score)


def analyze_apk(path: str, as_json: bool = True) -> str:
    apk_path = Path(path)
    if not apk_path.exists() or not apk_path.is_file():
        raise FileNotFoundError(f"APK file not found: {apk_path}")
    if apk_path.suffix.lower() != ".apk":
        raise ValueError("The provided file must have an .apk extension.")

    apk = APK(str(apk_path))
    if not apk.is_valid_APK():
        raise ValueError("Unable to parse APK. The file may be corrupted or not a valid Android package.")

    summary = _build_summary(apk)
    summary["risk_score"] = _calculate_risk_score(
        summary["permissions"], summary["activities"], summary["services"]
    )
    summary["risk_level"] = _risk_level_from_score(summary["risk_score"])

    if as_json:
        return json.dumps(summary, indent=2)

    return summary


def _risk_level_from_score(score: int) -> str:
    if score >= 75:
        return "High"
    if score >= 45:
        return "Medium"
    return "Low"


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyze an APK file and generate a JSON risk report.")
    parser.add_argument("apk_path", help="Path to the APK file to analyze.")
    parser.add_argument("--pretty", action="store_true", help="Print formatted JSON output.")
    args = parser.parse_args()

    output = json.loads(analyze_apk(args.apk_path, as_json=True))
    print(json.dumps(output, indent=2 if args.pretty else None))
