from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime

from app.schemas.pdf_report import PDFReportRequest
from app.services.pdf_report import generate_pdf_report

router = APIRouter()


@router.post("/reports/pdf", summary="Generate PDF report")
async def create_pdf_report(report_request: PDFReportRequest):
    scan_date = report_request.scan_date or datetime.utcnow()

    try:
        pdf_bytes = generate_pdf_report(
            file_name=report_request.file_name,
            scan_date=scan_date,
            threat_score=report_request.threat_score,
            ai_prediction=report_request.ai_prediction,
            details=report_request.details,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    filename = report_request.file_name.replace(" ", "_").replace("/", "_").replace("\\", "_")
    content_disposition = f"attachment; filename=report_{filename}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": content_disposition},
    )
