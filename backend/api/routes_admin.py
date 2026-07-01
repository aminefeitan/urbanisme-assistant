from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from auth.auth_middleware import get_admin_user
from database.connection import get_connection
from ocr.processor import ocr_pdf, parse_articles
from chat.engine import store_article
import time

router = APIRouter()


# --- Pydantic Models ---

class ConfigUpdateRequest(BaseModel):
    system_prompt: str
    temperature: float

class ArticleUpdateRequest(BaseModel):
    titre: str
    contenu: str


# --- Statistics ---

@router.get("/stats")
def get_stats(admin: dict = Depends(get_admin_user)):
    """Get platform statistics."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Total users (excluding admin)
        cur.execute("SELECT COUNT(*) FROM users WHERE is_admin = false")
        total_users = cur.fetchone()[0]

        # Verified users
        cur.execute("SELECT COUNT(*) FROM users WHERE is_verified = true AND is_admin = false")
        verified_users = cur.fetchone()[0]

        # Total conversations
        cur.execute("SELECT COUNT(*) FROM conversations")
        total_conversations = cur.fetchone()[0]

        # Total messages
        cur.execute("SELECT COUNT(*) FROM chat_messages")
        total_messages = cur.fetchone()[0]

        # Total articles indexed
        cur.execute("SELECT COUNT(*) FROM loi_articles")
        total_articles = cur.fetchone()[0]

        # Recent users (last 10)
        cur.execute("""
            SELECT id, email, first_name, last_name, is_verified, created_at
            FROM users WHERE is_admin = false
            ORDER BY created_at DESC LIMIT 10
        """)
        recent_users = [
            {
                "id": r[0], "email": r[1], "first_name": r[2],
                "last_name": r[3], "is_verified": r[4],
                "created_at": r[5].isoformat() if r[5] else None
            }
            for r in cur.fetchall()
        ]

        return {
            "total_users": total_users,
            "verified_users": verified_users,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_articles": total_articles,
            "recent_users": recent_users,
        }
    finally:
        cur.close()
        conn.close()


# --- Articles Management ---

@router.get("/articles")
def list_articles(limit: int = 50, offset: int = 0, loi_version: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    """List all law articles (paginated)."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        if loi_version:
            cur.execute("SELECT COUNT(*) FROM loi_articles WHERE loi_version = %s", (loi_version,))
            total = cur.fetchone()[0]
            cur.execute(
                """SELECT id, loi_version, article_number, titre, source_pdf, date_ajout
                   FROM loi_articles WHERE loi_version = %s ORDER BY id LIMIT %s OFFSET %s""",
                (loi_version, limit, offset)
            )
        else:
            cur.execute("SELECT COUNT(*) FROM loi_articles")
            total = cur.fetchone()[0]
            cur.execute(
                """SELECT id, loi_version, article_number, titre, source_pdf, date_ajout
                   FROM loi_articles ORDER BY id LIMIT %s OFFSET %s""",
                (limit, offset)
            )
            
        articles = [
            {
                "id": r[0], "loi_version": r[1], "article_number": r[2],
                "titre": r[3], "source_pdf": r[4],
                "date_ajout": r[5].isoformat() if r[5] else None
            }
            for r in cur.fetchall()
        ]
        return {"total": total, "articles": articles}
    finally:
        cur.close()
        conn.close()


@router.put("/articles/{article_id}")
def update_article(article_id: int, req: ArticleUpdateRequest, admin: dict = Depends(get_admin_user)):
    """Update a specific article's title and content."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        from chat.engine import get_embedding
        
        # We need to update the embedding since the text changed
        cur.execute("SELECT article_number, loi_version FROM loi_articles WHERE id = %s", (article_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Article non trouvé.")
        
        article_number, loi_version = row
        text = f"Article {article_number} {req.titre} {req.contenu}"
        embedding = get_embedding(text)
        
        cur.execute(
            """UPDATE loi_articles 
               SET titre = %s, contenu = %s, embedding = %s::vector
               WHERE id = %s""",
            (req.titre, req.contenu, str(embedding), article_id)
        )
        conn.commit()
        return {"message": f"Article {article_id} mis à jour."}
    finally:
        cur.close()
        conn.close()


@router.delete("/articles/{article_id}")
def delete_article(article_id: int, admin: dict = Depends(get_admin_user)):
    """Delete a specific article."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM loi_articles WHERE id = %s RETURNING id", (article_id,))
        deleted = cur.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Article non trouvé.")
        conn.commit()
        return {"message": f"Article {article_id} supprimé."}
    finally:
        cur.close()
        conn.close()


@router.delete("/articles")
def reset_all_articles(admin: dict = Depends(get_admin_user)):
    """Delete all articles."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("TRUNCATE TABLE loi_articles RESTART IDENTITY;")
        conn.commit()
        return {"message": "Tous les articles ont été supprimés."}
    finally:
        cur.close()
        conn.close()


@router.post("/upload-pdf")
async def admin_upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    loi_version: str = Form("12-90"),
    admin: dict = Depends(get_admin_user),
):
    """Upload a PDF for OCR processing (admin only)."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Le PDF semble trop petit ou vide.")

    background_tasks.add_task(_process_pdf, pdf_bytes, file.filename, loi_version)

    return {
        "message": f"'{file.filename}' reçu. L'OCR est en cours en arrière-plan.",
        "status": "processing",
    }


def _process_pdf(pdf_bytes: bytes, filename: str, loi_version: str):
    """Background task for OCR processing."""
    print(f"\n[ADMIN OCR] 🔍 Started: {filename} ({loi_version})")
    try:
        full_text = ocr_pdf(pdf_bytes=pdf_bytes, lang="fra+ara")
    except Exception as e:
        print(f"[ADMIN OCR] ❌ PDF→images failed: {e}")
        return

    if not full_text.strip():
        print("[ADMIN OCR] ❌ OCR returned empty text")
        return

    articles = parse_articles(full_text)
    print(f"[ADMIN OCR] 📄 Parsed {len(articles)} articles from {filename}")

    ok = 0
    for i, article in enumerate(articles, 1):
        try:
            store_article(article, source_pdf=filename, loi_version=loi_version)
            ok += 1
            print(f"[ADMIN OCR] ✅ {ok}/{len(articles)} — Article {article.get('article_number')}")
            time.sleep(1.5)
        except Exception as e:
            print(f"[ADMIN OCR] ⚠️  Article {i} skipped: {e}")

    print(f"[ADMIN OCR] ✨ Complete — {ok}/{len(articles)} articles stored\n")


# --- Assistant Config ---

@router.get("/config")
def get_config(admin: dict = Depends(get_admin_user)):
    """Get the AI assistant configuration."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT key, value FROM assistant_config")
        rows = cur.fetchall()
        config = {r[0]: r[1] for r in rows}
        return {
            "system_prompt": config.get("system_prompt", ""),
            "temperature": float(config.get("temperature", 0.15))
        }
    finally:
        cur.close()
        conn.close()


# --- Public content endpoint (no auth needed) ---

@router.get("/public/content/{key}")
def get_public_content(key: str):
    """Get app content publicly (for settings page display)."""
    if key not in ("privacy_policy", "terms", "about"):
        raise HTTPException(status_code=400, detail="Clé invalide.")

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT content_fr, content_ar FROM app_content WHERE key = %s", (key,))
        row = cur.fetchone()
        if not row:
            return {"key": key, "content_fr": "", "content_ar": ""}
        return {"key": key, "content_fr": row[0] or "", "content_ar": row[1] or ""}
    finally:
        cur.close()
        conn.close()


@router.put("/config")
def update_config(req: ConfigUpdateRequest, admin: dict = Depends(get_admin_user)):
    """Update the AI assistant configuration."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO assistant_config (key, value, updated_at) VALUES ('system_prompt', %s, NOW())
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()""",
            (req.system_prompt,)
        )
        cur.execute(
            """INSERT INTO assistant_config (key, value, updated_at) VALUES ('temperature', %s, NOW())
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()""",
            (str(req.temperature),)
        )
        conn.commit()
        return {"message": "Configuration de l'assistant mise à jour."}
    finally:
        cur.close()
        conn.close()


# --- User Management ---

@router.get("/users")
def list_users(limit: int = 50, offset: int = 0, admin: dict = Depends(get_admin_user)):
    """List all users."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM users WHERE is_admin = false")
        total = cur.fetchone()[0]

        cur.execute("""
            SELECT id, email, first_name, last_name, is_verified, created_at, last_login
            FROM users WHERE is_admin = false
            ORDER BY created_at DESC LIMIT %s OFFSET %s
        """, (limit, offset))
        users = [
            {
                "id": r[0], "email": r[1], "first_name": r[2], "last_name": r[3],
                "is_verified": r[4],
                "created_at": r[5].isoformat() if r[5] else None,
                "last_login": r[6].isoformat() if r[6] else None,
            }
            for r in cur.fetchall()
        ]
        return {"total": total, "users": users}
    finally:
        cur.close()
        conn.close()


@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(get_admin_user)):
    """Delete a user."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check if user exists and is not admin
        cur.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
        if row[0]:
            raise HTTPException(status_code=400, detail="Impossible de supprimer un administrateur.")
            
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return {"message": "Utilisateur supprimé avec succès."}
    finally:
        cur.close()
        conn.close()
