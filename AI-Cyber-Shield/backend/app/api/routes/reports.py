from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from app.core.config import APK_DIR, IMAGE_DIR
from app.schemas.report import ReportItem

router = APIRouter(prefix="/reports", tags=["reports"])


def _build_report(file_path: Path, file_type: str) -> ReportItem:
    stat = file_path.stat()
    return ReportItem(
        id=f"{file_type}-{file_path.stem}-{int(stat.st_mtime)}",
        filename=file_path.name,
        file_type=file_type,
        size=stat.st_size,
        uploaded_at=datetime.fromtimestamp(stat.st_mtime),
        path=str(file_path),
    )


@router.get("", response_model=list[ReportItem])
def get_reports():
    try:
        reports = []
        for file_path in sorted(IMAGE_DIR.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True):
            if file_path.is_file():
                reports.append(_build_report(file_path, "image"))

        for file_path in sorted(APK_DIR.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True):
            if file_path.is_file():
                reports.append(_build_report(file_path, "apk"))

        return reports
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load reports at this time.",
        ) from exc
