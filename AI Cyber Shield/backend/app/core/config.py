from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"
IMAGE_UPLOAD_DIR = UPLOAD_DIR / "images"
APK_UPLOAD_DIR = UPLOAD_DIR / "apks"
REPORTS_FILE = UPLOAD_DIR / "reports.json"

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_APK_EXTENSIONS = {".apk"}

MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_APK_SIZE = 150 * 1024 * 1024

CHUNK_SIZE = 1024 * 1024
