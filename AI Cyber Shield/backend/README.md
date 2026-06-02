# AI Cyber Shield Backend

FastAPI backend for local image/APK uploads and threat report history.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `POST /upload-image`
- `POST /upload-apk`
- `GET /reports`
- `GET /health`
