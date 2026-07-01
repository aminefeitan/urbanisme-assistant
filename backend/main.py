from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import init_db
from api.routes_chat import router as chat_router
from api.routes_ocr import router as ocr_router
from api.routes_auth import router as auth_router
from api.routes_admin import router as admin_router
from ocr.processor import diagnose

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    diagnose()
    yield

app = FastAPI(
    title="Assistant Urbanisme API",
    description="Chatbot pour les plaintes urbaines - Lois 12-90 et 25-90",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(ocr_router, prefix="/api/ocr", tags=["OCR"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
def health():
    return {"status": "ok", "project": "Assistant Urbanisme", "loi": "12-90 / 25-90"}

from fastapi import HTTPException
from database.connection import get_connection

@app.get("/api/content/{key}")
def get_public_content(key: str):
    """Get public app content by key."""
    if key not in ("privacy_policy", "terms", "about"):
        raise HTTPException(status_code=400, detail="Clé invalide.")
    
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT content_fr, content_ar, updated_at FROM app_content WHERE key = %s", (key,))
        row = cur.fetchone()
        if not row:
            return {"key": key, "content_fr": "", "content_ar": "", "updated_at": None}
        return {
            "key": key,
            "content_fr": row[0] or "",
            "content_ar": row[1] or "",
            "updated_at": row[2].isoformat() if row[2] else None,
        }
    finally:
        cur.close()
        conn.close()
