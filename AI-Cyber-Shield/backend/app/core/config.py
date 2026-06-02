from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
IMAGE_DIR = UPLOAD_DIR / "images"
APK_DIR = UPLOAD_DIR / "apk"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
APK_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
]

ALLOWED_APK_TYPES = [
    "application/vnd.android.package-archive",
    "application/octet-stream",
]

APP_NAME = "AI Cyber Shield API"
APP_VERSION = "1.0.0"
