from datetime import datetime
from pydantic import BaseModel, Field
from typing import Dict, Optional


class PDFReportRequest(BaseModel):
    file_name: str = Field(..., description="The uploaded file name")
    scan_date: Optional[datetime] = Field(None, description="The ISO timestamp for the scan")
    threat_score: int = Field(..., ge=0, le=100, description="The threat score returned by analysis")
    ai_prediction: str = Field(..., description="AI prediction label for the scan")
    details: Optional[Dict[str, str]] = Field(None, description="Optional analysis detail key/value pairs")
