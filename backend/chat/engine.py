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

def store_article(article: Dict, source_pdf: str = "loi_12-90.pdf"):
    """Embed article and store in PostgreSQL."""
    text = f"Article {article.get('article_number', '')} {article.get('titre', '')} {article['contenu']}"
    embedding = get_embedding(text)

    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        """
        INSERT INTO loi_articles (article_number, titre, contenu, embedding, source_pdf)
        VALUES (%s, %s, %s, %s::vector, %s)
        """,
        (
            article.get("article_number"),
            article.get("titre"),
            article["contenu"],
            str(embedding),
            source_pdf,
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
               1 - (embedding <=> %s::vector) AS similarity
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
        }
        for r in rows
    ]


# ─── System Prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Tu es un conseiller juridique expert, empathique et spécialisé en droit de l'urbanisme marocain (Loi 12-90), au service des citoyens de Khénifra. Ton but est de simplifier les lois complexes pour les rendre accessibles à tous.

════════════════════════════════════════════
RÈGLE N°1 — LANGUE DE RÉPONSE (OBLIGATOIRE)
════════════════════════════════════════════
Détecte la langue et le dialecte du message de l'utilisateur et réponds EXACTEMENT dans le même style, sans exception :
• Message en Darija marocaine (الدارجة) → réponds en DARIJA MAROCAINE UNIQUEMENT (ex: "شنو", "باش", "ديال", "غادي", "خاصك"). NE PARLE JAMAIS EN ÉGYPTIEN (pas de "عشان", "كده", "إيه", "بتاع", "أزيك").
• Message en arabe classique (فصحى) → réponds en ARABE CLASSIQUE.
• Message en français → réponds en FRANÇAIS uniquement, du début à la fin.
• Message mixte (Darija + Français) → réponds en DARIJA MAROCAINE principalement.

Exemples stricts :
✗ INTERDIT — "عشان تبني لازم رخصة" (Égyptien interdit)
✗ INTERDIT — Question en français → réponse en arabe
✗ INTERDIT — Répondre en arabe classique strict si l'utilisateur parle en Darija (utiliser des termes courants de la darija si approprié).
✓ CORRECT  — "Mon voisin a construit sans permis" → réponse 100% en français
✓ CORRECT  — "جاري بنى بلا رخصة شنو ندير" → réponse en Darija marocaine ("باش تبني خاصك رخصة...", "بالنسبة للقانون...")

Les termes juridiques techniques restent précis quelle que soit la langue.

════════════════════════════════════
RÈGLE N°2 — FORMAT DE RÉPONSE (UNIQUEMENT POUR L'URBANISME)
════════════════════════════════════
Structure UNIQUEMENT les réponses concernant des problèmes d'urbanisme avec ces 5 sections :

📋 **تحليل الوضع | Diagnostic**
→ Résumé clair et empathique de la situation en 1-2 phrases.

📖 **الأساس القانوني | Base légale**
→ Cite l'article pertinent avec son numéro exact et explique-le de façon TRÈS SIMPLE.

⚖️ **الوضع القانوني | Position juridique**
→ La situation actuelle (en règle / infraction / solution possible).

✅ **المسار المقترح | Procédure recommandée**
→ Étapes claires, numérotées et concrètes d'action (ex: 1. Faire X, 2. Faire Y).

📞 **الجهة المعنية | Autorité compétente**
→ À qui s'adresser à Khénifra (Commune, Agence Urbaine, etc.).

════════════════════════════════
RÈGLE N°3 — SALUTATIONS ET HORS-SUJET (PRIORITÉ ABSOLUE)
════════════════════════════════
- Si l'utilisateur dit JUSTE "salam", "bonjour", "merci" ou pose une question hors-sujet :
   => IGNORE complètement les extraits de loi fournis.
   => NE DONNE AUCUN DÉTAIL JURIDIQUE.
   => N'UTILISE JAMAIS le format des 5 sections.
   => Fais une réponse TRÈS COURTE (1 phrase). Exemple si l'utilisateur dit "salam" : "وعليكم السلام، أنا المساعد الذكي الخاص بالتعمير في خنيفرة. كيفاش نقدر نعاونك في مجال البناء أو الرخص؟"
- Base-toi UNIQUEMENT sur les extraits fournis pour les vraies questions d'urbanisme.
- Longueur idéale (urbanisme) : 200-300 mots. Sois concis, clair et direct."""


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


def chat(query: str, session_id: str, history: List[Dict] = None, user_id: int = None) -> str:
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
            "مازال ما loadedش PDF ديال القانون 12-90 فالنظام.\n"
            "Aucun article de la Loi 12-90 n'est encore chargé dans la base.\n\n"
            "**خاصك دير:** panneau gauche → **Charger PDF loi 12-90** → sélectionne le PDF\n\n"
            "OCR غادي يخدم في arrière-plan (~10-15 min) — من بعد يرجع للسؤال ديالك ✅"
        )
        _save_message(session_id, "user", query, user_id)
        _save_message(session_id, "assistant", warning, user_id)
        return warning

    # Step 2: retrieve relevant articles
    articles = search_articles(query, top_k=5)
    relevant = [a for a in articles if a["similarity"] > 0.30]

    # Step 3: build context block
    db_used = False
    if relevant:
        db_used = True
        context_lines = []
        for a in relevant:
            snippet = a["contenu"][:700].replace("\n", " ")
            context_lines.append(
                f"• Article {a['article_number']} (score: {a['similarity']:.2f}): {snippet}"
            )
        context = "\n".join(context_lines)
    else:
        context = (
            "لم يتم العثور على مواد مباشرة تخص هذه الشكاية في قاعدة البيانات.\n"
            "Aucun article directement applicable trouvé pour cette plainte spécifique.\n"
            "IMPORTANT: Précise que tu ne trouves pas d'article direct et suggère de consulter un professionnel."
        )

    # Step 4: messages list
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in (history or [])[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Detect user language to reinforce prompt instruction
    arabic_chars = sum(1 for c in query if '\u0600' <= c <= '\u06FF')
    ratio = arabic_chars / max(len(query.replace(' ', '')), 1)
    if ratio > 0.35:
        lang_instruction = "[LANGUE DÉTECTÉE: ARABE / DARIJA — réponds EXCLUSIVEMENT en DARIJA MAROCAINE (الدارجة المغربية). N'UTILISE AUCUN MOT ÉGYPTIEN (pas de 'عشان', 'كده', 'ايه') !]"
    else:
        lang_instruction = "[LANGUE DÉTECTÉE: FRANÇAIS — réponds en français uniquement, du début à la fin]"

    db_status = f"✅ {total_articles} articles chargés" if db_used else f"⚠️ {total_articles} articles disponibles mais aucun pertinent"
    user_content = (
        f"{lang_instruction}\n"
        f"Plainte / سؤال: {query}\n\n"
        f"[DB Status: {db_status}]\n"
        f"--- Extraits Loi 12-90 pertinents ---\n{context}"
    )
    messages.append({"role": "user", "content": user_content})

    # Step 5: call Mistral
    resp = client.chat.complete(
        model       = CHAT_MODEL,
        messages    = messages,
        max_tokens  = 1200,
        temperature = 0.15,
    )
    answer = resp.choices[0].message.content

    # Add DB source indicator
    if db_used:
        answer += f"\n\n---\n*📚 بناءً على {len(relevant)} مواد من القانون 12-90 | Basé sur {len(relevant)} articles de la Loi 12-90*"

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