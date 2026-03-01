from fastapi import FastAPI

from app.config import get_settings
from app.db import check_db_connection

settings = get_settings()
app = FastAPI(title=settings.app_name)


@app.get("/healthz")
def healthz() -> dict:
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": settings.app_name,
        "environment": settings.app_env,
        "database": "up" if db_ok else "down",
    }


@app.get("/")
def root() -> dict:
    return {
        "message": "NexusChat API is running",
        "docs": "/docs",
    }
