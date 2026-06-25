from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.connection import init_db
from api.routes_chat import router as chat_router
from api.routes_ocr import router as ocr_router
from api.routes_auth import router as auth_router
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


@app.get("/")
def health():
    return {"status": "ok", "project": "Assistant Urbanisme", "loi": "12-90 / 25-90"}

