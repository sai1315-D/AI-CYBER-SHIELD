from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.core.config import ALLOWED_APK_TYPES
from app.services.upload_service import save_uploaded_file

router = APIRouter(prefix="/upload-apk", tags=["upload"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_apk(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No APK file provided.")
    if file.content_type not in ALLOWED_APK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid APK type. Please upload a valid .apk file.",
        )

    try:
        saved_path = await save_uploaded_file(file, subdir="apk")
        return {
            "success": True,
            "filename": saved_path.name,
            "content_type": file.content_type,
            "path": str(saved_path.relative_to(saved_path.parents[2])),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded APK.",
        ) from exc
