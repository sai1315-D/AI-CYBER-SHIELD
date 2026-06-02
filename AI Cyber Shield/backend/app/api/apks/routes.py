from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.services.storage import save_uploaded_file

router = APIRouter(tags=["uploads"])


@router.post("/upload-apk", status_code=status.HTTP_201_CREATED)
async def upload_apk(file: UploadFile = File(...)):
    try:
        return await save_uploaded_file(file=file, file_type="apk")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upload APK. Please try again.",
        ) from exc
