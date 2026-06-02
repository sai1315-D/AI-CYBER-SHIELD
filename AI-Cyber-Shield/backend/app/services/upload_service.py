from pathlib import Path
from fastapi import UploadFile
from app.core.config import UPLOAD_DIR


async def save_uploaded_file(file: UploadFile, subdir: str) -> Path:
    safe_filename = Path(file.filename).name
    target_dir = UPLOAD_DIR / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / safe_filename

    try:
        with target_path.open("wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                buffer.write(chunk)
    finally:
        await file.close()

    return target_path
