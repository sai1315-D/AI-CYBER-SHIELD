from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.services.pdf_reports import generate_scan_pdf
from app.services.reports import get_report, get_reports

router = APIRouter(tags=["reports"])


@router.get("/reports")
async def reports():
    try:
        return {"reports": get_reports()}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load reports.",
        ) from exc


@router.get("/reports/{report_id}/pdf")
async def download_report_pdf(report_id: str):
    report = get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    try:
        pdf_buffer = generate_scan_pdf(report)
        filename = f"ai-cyber-shield-{report_id}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate PDF report.",
        ) from exc
