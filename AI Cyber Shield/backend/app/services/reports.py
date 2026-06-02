import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import REPORTS_FILE


def get_reports() -> list[dict[str, Any]]:
    if not REPORTS_FILE.exists():
        return []

    try:
        content = REPORTS_FILE.read_text(encoding="utf-8").strip()
        return json.loads(content) if content else []
    except json.JSONDecodeError:
        return []


def get_report(report_id: str) -> dict[str, Any] | None:
    return next((report for report in get_reports() if report.get("id") == report_id), None)


def add_report(report: dict[str, Any]) -> dict[str, Any]:
    reports = get_reports()
    report["uploaded_at"] = datetime.now(timezone.utc).isoformat()
    reports.insert(0, report)
    REPORTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORTS_FILE.write_text(json.dumps(reports, indent=2), encoding="utf-8")
    return report


def path_for_response(path: Path) -> str:
    return path.as_posix()
