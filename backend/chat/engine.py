"""
Chat Engine — RAG pipeline using Mistral API
- mistral-embed  : generate 1024-dim embeddings
- mistral-small-latest : chat / analysis (free tier, generous limits)
- pgvector : cosine similarity search
"""

import os
from typing import List, Dict
from dotenv import load_dotenv
from mistralai import Mistral
from database.connection import get_connection

load_dotenv()

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

EMBED_MODEL = "mistral-embed"
CHAT_MODEL  = "mistral-small-latest"


# ─── Embeddings ───────────────────────────────────────────────────────────────

def get_embedding(text: str) -> List[float]:
    """Get 1024-dim embedding from Mistral."""
    resp = client.embeddings.create(model=EMBED_MODEL, inputs=[text])
    return resp.data[0].embedding


# ─── Storage ──────────────────────────────────────────────────────────────────

def store_article(article: Dict, source_pdf: str = "loi_12-90.pdf", loi_version: str = "12-90"):
    """Embed article and store in PostgreSQL."""
    text = f"Article {article.get('article_number', '')} {article.get('titre', '')} {article['contenu']}"
    embedding = get_embedding(text)

    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        """
        INSERT INTO loi_articles (article_number, titre, contenu, embedding, source_pdf, loi_version)
        VALUES (%s, %s, %s, %s::vector, %s, %s)
        """,
        (
            article.get("article_number"),
            article.get("titre"),
            article["contenu"],
            str(embedding),
            source_pdf,
            loi_version,
        ),
    )
    conn.commit()
    cur.close()
    conn.close()


# ─── Semantic Search ──────────────────────────────────────────────────────────

def search_articles(query: str, top_k: int = 5) -> List[Dict]:
    """Find the most relevant articles using cosine similarity."""
    emb = get_embedding(query)
    emb_str = str(emb)

    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        """
        SELECT article_number, titre, contenu,
               1 - (embedding <=> %s::vector) AS similarity,
               loi_version
        FROM   loi_articles
        ORDER  BY embedding <=> %s::vector
        LIMIT  %s
        """,
        (emb_str, emb_str, top_k),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "article_number": r[0],
            "titre":          r[1],
            "contenu":        r[2],
            "similarity":     float(r[3]),
            "loi_version":    r[4],
        }
        for r in rows
    ]


def get_assistant_config():
    """Fetch assistant config from DB, fallback to defaults if not found."""
    default_temp = 0.15
    default_prompt = "Tu es un assistant utile."
    
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT key, value FROM assistant_config")
        rows = cur.fetchall()
        config = {r[0]: r[1] for r in rows}
        
        system_prompt = config.get("system_prompt", default_prompt)
        temperature = float(config.get("temperature", default_temp))
        return system_prompt, temperature
    except Exception as e:
        print(f"Error loading config: {e}")
        return default_prompt, default_temp
    finally:
        cur.close()
        conn.close()


# ─── Main Chat Function ───────────────────────────────────────────────────────

def _count_articles() -> int:
    """Count total articles in DB."""
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM loi_articles")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return count
    except Exception:
        return 0


def chat(query: str, session_id: str, history: List[Dict] = None, user_id: int = None, language: str = "ar") -> str:
    """
    RAG pipeline:
    1. Check DB has articles
    2. Embed user query
    3. Retrieve relevant law articles
    4. Build prompt with context
    5. Call Mistral chat
    6. Save to DB
    """
    if history is None:
        history = []

    # Step 1: Check DB is populated
    total_articles = _count_articles()
    if total_articles == 0:
        warning = (
            "⚠️ **قاعدة البيانات فارغة | Base de données vide**\n\n"
            "مازال ما loadedش PDF ديال القانون 12-90 ولا 25-90 فالنظام.\n"
            "Aucun article des lois 12-90 ou 25-90 n'est encore chargé dans la base.\n\n"
            "**خاصك دير:** panneau gauche → **Charger PDF (12-90 / 25-90)** → sélectionne le PDF\n\n"
            "OCR غادي يخدم في arrière-plan (~10-15 min) — من بعد يرجع للسؤال ديالك ✅"
        )
        _save_message(session_id, "user", query, user_id)
        _save_message(session_id, "assistant", warning, user_id)
        return warning

    # Step 1.5: Early Intent Detection (Routing)
    query_lower = query.strip().lower()
    salutations = ["salam", "bonjour", "salut", "hello", "merci", "chokran", "شكرا", "سلام"]
    is_greeting = query_lower in salutations or (len(query) < 15 and any(s in query_lower for s in salutations))
    
    translation_keywords = ["en ar", "en arabe", "en fr", "en français", "traduis", "traduction", "ترجم", "بالعربية", "بالفرنسية", "ar", "fr", "darija", "en darija"]
    is_translation = any(query_lower == kw or query_lower.startswith(f"{kw} ") for kw in translation_keywords) and len(query) < 40

    if is_greeting or is_translation:
        # Bypass RAG completely for small talk and translations
        relevant = []
        articles = []
    else:
        # Step 2: retrieve relevant articles
        articles = search_articles(query, top_k=10)
        relevant = [a for a in articles if a["similarity"] > 0.45]

    # Step 3: build context block
    db_used = False
    if relevant:
        db_used = True
        context_lines = []
        for a in relevant:
            snippet = a["contenu"][:700].replace("\n", " ")
            context_lines.append(
                f"• [Loi {a['loi_version']}] Article {a['article_number']} (score: {a['similarity']:.2f}): {snippet}"
            )
        context = "\n".join(context_lines)
    else:
        context = (
            "لم يتم العثور على مواد مباشرة تخص هذه الشكاية في قاعدة البيانات.\n"
            "Aucun article directement applicable trouvé pour cette plainte spécifique.\n"
            "IMPORTANT: Précise que tu ne trouves pas d'article direct et suggère de consulter un professionnel."
        )

    # Step 4: messages list
    system_prompt, temperature = get_assistant_config()
    messages = [{"role": "system", "content": system_prompt}]

    for msg in (history or [])[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Determine language instruction based on explicit user choice
    if language == "fr":
        lang_instruction = "[CONTEXTE DE L'INTERFACE: FRANÇAIS. Sauf si l'utilisateur demande explicitement une autre langue ou une traduction, réponds en français.]"
    else:
        # Default: Arabic/Darija — use auto-detection for dialect
        arabic_chars = sum(1 for c in query if '\u0600' <= c <= '\u06FF')
        ratio = arabic_chars / max(len(query.replace(' ', '')), 1)
        if ratio > 0.35:
            lang_instruction = "[LANGUE DÉTECTÉE: ARABE / DARIJA. Sauf si l'utilisateur demande explicitement une autre langue ou une traduction, réponds en DARIJA MAROCAINE (الدارجة المغربية).]"
        elif ratio == 0 and len(query.strip()) > 0:
            lang_instruction = "[LANGUE DÉTECTÉE: FRANÇAIS. L'utilisateur a posé sa question en français. Sauf s'il demande une traduction, réponds en FRANÇAIS, même si l'interface est en arabe.]"
        else:
            lang_instruction = "[CONTEXTE DE L'INTERFACE: ARABE. Sauf si l'utilisateur demande explicitement une autre langue ou une traduction, réponds en DARIJA MAROCAINE (الدارجة المغربية) par défaut.]"

    if is_greeting:
        user_content = f"L'utilisateur dit simplement une salutation ou un remerciement : '{query}'. Réponds brièvement avec politesse en 1 ou 2 phrases."
        db_used = False
    elif is_translation:
        user_content = f"L'utilisateur demande une TRADUCTION de ta réponse précédente. Instruction de l'utilisateur : '{query}'. TRADUIS ta réponse précédente avec précision dans la langue demandée. NE CONSIDÈRE PAS ce message comme une nouvelle question et IGNORE les règles de format strictes."
        db_used = False
    else:
        db_status = f"✅ {total_articles} articles chargés" if db_used else f"⚠️ {total_articles} articles disponibles mais aucun pertinent"
        user_content = (
            f"{lang_instruction}\n"
            f"Message de l'utilisateur : {query}\n\n"
            f"[DB Status: {db_status}]\n"
            f"--- Extraits de loi pertinents ---\n{context}"
        )

    messages.append({"role": "user", "content": user_content})

    # Step 5: call Mistral
    resp = client.chat.complete(
        model       = CHAT_MODEL,
        messages    = messages,
        max_tokens  = 1200,
        temperature = temperature,
    )
    answer = resp.choices[0].message.content


    # Step 6: persist
    _save_message(session_id, "user", query, user_id)
    _save_message(session_id, "assistant", answer, user_id)

    return answer


# ─── History ──────────────────────────────────────────────────────────────────

def get_history(session_id: str) -> List[Dict]:
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT role, content FROM chat_messages WHERE session_id = %s ORDER BY created_at",
        (session_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"role": r[0], "content": r[1]} for r in rows]


def _save_message(session_id: str, role: str, content: str, user_id: int = None):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "INSERT INTO chat_messages (session_id, role, content, user_id) VALUES (%s, %s, %s, %s)",
        (session_id, role, content, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()