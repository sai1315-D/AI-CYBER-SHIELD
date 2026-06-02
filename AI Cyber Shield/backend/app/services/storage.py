from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import (
    ALLOWED_APK_EXTENSIONS,
    ALLOWED_IMAGE_EXTENSIONS,
    APK_UPLOAD_DIR,
    CHUNK_SIZE,
    IMAGE_UPLOAD_DIR,
    MAX_APK_SIZE,
    MAX_IMAGE_SIZE,
)
from app.services.reports import add_report, path_for_response
from app.services.steganalysis import ImageSteganographyDetector, SteganographyDetectionError

UPLOAD_RULES = {
    "image": {
        "directory": IMAGE_UPLOAD_DIR,
        "extensions": ALLOWED_IMAGE_EXTENSIONS,
        "max_size": MAX_IMAGE_SIZE,
    },
    "apk": {
        "directory": APK_UPLOAD_DIR,
        "extensions": ALLOWED_APK_EXTENSIONS,
        "max_size": MAX_APK_SIZE,
    },
}


def _validate_filename(filename: str | None) -> Path:
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename.",
        )

    original_name = Path(filename).name
    if not original_name or original_name in {".", ".."}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    return Path(original_name)


def _validate_extension(filename: Path, allowed_extensions: set[str]) -> str:
    extension = filename.suffix.lower()
    if extension not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed extensions: {allowed}.",
        )
    return extension


async def save_uploaded_file(file: UploadFile, file_type: str) -> dict:
    rules = UPLOAD_RULES.get(file_type)
    if not rules:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid upload type configuration.",
        )

    original_filename = _validate_filename(file.filename)
    extension = _validate_extension(original_filename, rules["extensions"])
    upload_dir = rules["directory"]
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_filename = f"{uuid4().hex}{extension}"
    saved_path = upload_dir / saved_filename
    bytes_written = 0

    try:
        with saved_path.open("wb") as destination:
            while chunk := await file.read(CHUNK_SIZE):
                bytes_written += len(chunk)
                if bytes_written > rules["max_size"]:
                    destination.close()
                    saved_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"{file_type.title()} file exceeds size limit.",
                    )
                destination.write(chunk)

        if bytes_written == 0:
            saved_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        report_payload = {
            "id": saved_path.stem,
            "type": file_type,
            "original_filename": original_filename.name,
            "stored_filename": saved_filename,
            "size_bytes": bytes_written,
            "content_type": file.content_type or "application/octet-stream",
            "path": path_for_response(saved_path),
            "status": "uploaded",
        }

        if file_type == "image":
            try:
                analysis = ImageSteganographyDetector().analyze(saved_path)
                report_payload["scan"] = {
                    "status": analysis.status,
                    "threat_score": analysis.risk_score,
                    "entropy": analysis.entropy,
                    "lsb_entropy": analysis.lsb_entropy,
                    "histogram_anomaly_score": analysis.histogram_anomaly_score,
                    "lsb_uniformity_score": analysis.lsb_uniformity_score,
                    "findings": analysis.findings,
                }
                report_payload["status"] = analysis.status
            except SteganographyDetectionError as exc:
                report_payload["scan"] = {
                    "status": "Scan Failed",
                    "threat_score": 0,
                    "findings": [str(exc)],
                }
                report_payload["status"] = "scan_failed"

        report = add_report(report_payload)

        return {
            "message": f"{file_type.title()} uploaded successfully.",
            "file": report,
        }
    finally:
        await file.close()
