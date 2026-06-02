from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.core.config import ALLOWED_IMAGE_TYPES
from app.services.image_analysis import analyze_image
from app.services.upload_service import save_uploaded_file

router = APIRouter(prefix="/upload-image", tags=["upload"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No image file provided.")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Accepted formats: PNG, JPG, WEBP, GIF.",
        )

    try:
        saved_path = await save_uploaded_file(file, subdir="images")
        analysis = analyze_image(saved_path)
        return {
            "success": True,
            "filename": saved_path.name,
            "content_type": file.content_type,
            "path": str(saved_path.relative_to(saved_path.parents[2])),
            "threat_score": analysis["threat_score"],
            "analysis_result": analysis["analysis_result"],
            "risk_level": analysis["risk_level"],
            "details": {
                "entropy": analysis["entropy"],
                "lsb_entropy": analysis["lsb_entropy"],
                "histogram_anomaly": analysis["histogram_anomaly"],
                "histogram_peakiness": analysis["histogram_peakiness"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save or analyze the uploaded image.",
        ) from exc
