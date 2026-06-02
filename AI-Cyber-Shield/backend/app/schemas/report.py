from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class ReportItem(BaseModel):
    id: str
    filename: str
    file_type: Literal["image", "apk"]
    size: int
    uploaded_at: datetime
    path: str
