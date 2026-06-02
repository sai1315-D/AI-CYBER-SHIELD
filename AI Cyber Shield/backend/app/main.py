from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.apks.routes import router as apk_router
from app.api.images.routes import router as image_router
from app.api.reports.routes import router as reports_router
from app.core.config import APK_UPLOAD_DIR, IMAGE_UPLOAD_DIR, REPORTS_FILE, UPLOAD_DIR

app = FastAPI(title="AI Cyber Shield API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def ensure_storage_directories():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    APK_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    if not REPORTS_FILE.exists():
        REPORTS_FILE.write_text("[]", encoding="utf-8")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


app.include_router(image_router)
app.include_router(apk_router)
app.include_router(reports_router)
