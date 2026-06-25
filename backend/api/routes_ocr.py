from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from database.connection import get_connection
from ocr.processor import ocr_pdf, parse_articles, POPPLER_PATH
from chat.engine import store_article
import pytesseract
import os
import time

router = APIRouter()


# ─── Background Task ──────────────────────────────────────────────────────────

def process_and_store(pdf_bytes: bytes, filename: str, loi_version: str):
    print(f"\n[OCR] 🔍 Started: {filename} ({loi_version})")
    try:
        full_text = ocr_pdf(pdf_bytes=pdf_bytes, lang="fra+ara")
    except Exception as e:
        print(f"[OCR] ❌ PDF→images failed: {e}")
        print("[OCR] → Check Poppler is installed and in PATH")
        return

    if not full_text.strip():
        print("[OCR] ❌ OCR returned empty text — check Tesseract installation")
        return

    articles = parse_articles(full_text)
    print(f"[OCR] 📄 Parsed {len(articles)} articles from {filename}")

    ok = 0
    for i, article in enumerate(articles, 1):
        try:
            store_article(article, source_pdf=filename, loi_version=loi_version)
            ok += 1
            print(f"[OCR] ✅ {ok}/{len(articles)} — Article {article.get('article_number')}")
            time.sleep(1.5)  # Delay to prevent Mistral API 429 Rate Limit
        except Exception as e:
            print(f"[OCR] ⚠️  Article {i} skipped: {e}")

    print(f"[OCR] ✨ Complete — {ok}/{len(articles)} articles stored\n")


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/diagnose")
def ocr_diagnose():
    """Test Tesseract + Poppler availability — call this if OCR is not working."""
    result = {}

    # Tesseract
    try:
        result["tesseract_version"] = str(pytesseract.get_tesseract_version())
        result["tesseract_cmd"] = pytesseract.pytesseract.tesseract_cmd
        langs = pytesseract.get_languages()
        result["languages"] = langs
        result["arabic_ok"] = "ara" in langs
        result["french_ok"] = "fra" in langs
        result["tesseract_ok"] = True
    except Exception as e:
        result["tesseract_ok"] = False
        result["tesseract_error"] = str(e)
        result["fix"] = "Install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki and add to PATH"

    # Poppler
    result["poppler_path"] = POPPLER_PATH or "using system PATH"
    result["poppler_ok"] = POPPLER_PATH is not None or os.system("pdfinfo --version >nul 2>&1") == 0

    return result


@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    loi_version: str = Form("12-90"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) < 1000:
        raise HTTPException(status_code=400, detail="PDF seems too small or empty.")

    background_tasks.add_task(process_and_store, pdf_bytes, file.filename, loi_version)

    return {
        "message": f"'{file.filename}' received. OCR running in background.",
        "status": "processing",
        "tip": "Check GET /api/ocr/status to see when articles are ready.",
    }


@router.get("/status")
def ocr_status():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT source_pdf, COUNT(*) FROM loi_articles GROUP BY source_pdf ORDER BY source_pdf"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    total = sum(r[1] for r in rows)
    return {
        "total_articles": total,
        "ready": total > 0,
        "sources": [{"file": r[0], "articles": r[1]} for r in rows],
    }


@router.delete("/reset")
def reset_articles():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("TRUNCATE TABLE loi_articles RESTART IDENTITY;")
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "All articles cleared. Upload the new PDF to restart OCR."}


@router.get("/articles")
def list_articles(limit: int = 20, offset: int = 0):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, article_number, titre, source_pdf FROM loi_articles ORDER BY id LIMIT %s OFFSET %s",
        (limit, offset),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {
        "articles": [
            {"id": r[0], "article_number": r[1], "titre": r[2], "source": r[3]}
            for r in rows
        ]
    }
