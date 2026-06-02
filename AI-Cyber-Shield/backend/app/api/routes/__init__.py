from fastapi import APIRouter
from .upload_image import router as upload_image_router
from .upload_apk import router as upload_apk_router
from .reports import router as reports_router
from .report_pdf import router as report_pdf_router

router = APIRouter()
router.include_router(upload_image_router)
router.include_router(upload_apk_router)
router.include_router(reports_router)
router.include_router(report_pdf_router)
