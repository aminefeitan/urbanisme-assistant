import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Amine%402005@localhost:5432/khenifra_urban"
)


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Enable pgvector extension
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Articles table — populated by OCR
    cur.execute("""
        CREATE TABLE IF NOT EXISTS loi_articles (
            id            SERIAL PRIMARY KEY,
            loi_version   VARCHAR(50)  DEFAULT '12-90',
            article_number VARCHAR(30),
            titre         TEXT,
            contenu       TEXT NOT NULL,
            embedding     vector(1024),
            source_pdf    VARCHAR(255),
            date_ajout    TIMESTAMP DEFAULT NOW()
        );
    """)

    # IVFFlat index for fast cosine similarity (needs ≥ 100 rows to be useful)
    cur.execute("""
        CREATE INDEX IF NOT EXISTS articles_embedding_idx
        ON loi_articles
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 50);
    """)

    # Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            password_hash VARCHAR(255),
            is_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            last_login TIMESTAMP
        );
    """)

    # OTP codes table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS otp_codes (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Chat history
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id         SERIAL PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            role       VARCHAR(20)  NOT NULL,
            content    TEXT         NOT NULL,
            user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Conversations table — groups chat_messages by session for a user
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id VARCHAR(100) PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) DEFAULT 'Nouvelle conversation',
            pinned BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    """)

    # Try to add user_id column if table already existed without it
    conn.commit() # Commit the creations first
    try:
        cur.execute("ALTER TABLE chat_messages ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;")
        conn.commit()
    except psycopg2.Error:
        conn.rollback() # Ignore if column already exists

    # Migrate existing users table — add new columns if missing
    new_columns = [
        ("first_name", "VARCHAR(255)"),
        ("last_name", "VARCHAR(255)"),
        ("password_hash", "VARCHAR(255)"),
        ("is_verified", "BOOLEAN DEFAULT false"),
        ("is_admin", "BOOLEAN DEFAULT false"),
    ]
    for col_name, col_type in new_columns:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            conn.commit()
        except psycopg2.Error:
            conn.rollback()

    # App content table (privacy policy, terms, about)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS app_content (
            key         VARCHAR(50) PRIMARY KEY,
            content_fr  TEXT DEFAULT '',
            content_ar  TEXT DEFAULT '',
            updated_at  TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit()

    # Seed default content rows if they don't exist
    for key in ('privacy_policy', 'terms', 'about'):
        try:
            cur.execute(
                "INSERT INTO app_content (key) VALUES (%s) ON CONFLICT (key) DO NOTHING",
                (key,)
            )
            conn.commit()
        except psycopg2.Error:
            conn.rollback()

    # Suggestions table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS suggestions (
            id          SERIAL PRIMARY KEY,
            session_id  VARCHAR(100),
            user_email  VARCHAR(255),
            summary     TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit()

    # Assistant Config table
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS assistant_config (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)
        conn.commit()
    except psycopg2.Error:
        conn.rollback()

    # Seed default assistant config
    default_prompt = """Tu es un conseiller juridique expert, empathique et spécialisé en droit de l'urbanisme marocain (Lois 12-90 et 25-90), au service des citoyens de Khénifra. Ton but est de simplifier les lois complexes pour les rendre accessibles à tous.

════════════════════════════════════════════
RÈGLE N°1 — LANGUE DE RÉPONSE (PRIORITÉ À L'UTILISATEUR)
════════════════════════════════════════════
Si l'utilisateur demande explicitement une langue, une traduction, ou un format précis (ex: "Traduis en arabe", "Réponds en anglais"), OBÉIS TOUJOURS À SA DEMANDE en priorité absolue.

Sinon, détecte la langue et le dialecte du message de l'utilisateur et réponds par défaut dans le même style :
• Message en Darija marocaine (الدارجة) → réponds en DARIJA MAROCAINE UNIQUEMENT (ex: "شنو", "باش", "ديال", "غادي", "خاصك"). NE PARLE JAMAIS EN ÉGYPTIEN (pas de "عشان", "كده", "إيه", "بتاع", "أزيك").
• Message en arabe classique (فصحى) → réponds en ARABE CLASSIQUE.
• Message en français → réponds en FRANÇAIS.
• Message mixte (Darija + Français) → réponds en DARIJA MAROCAINE principalement.

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
RÈGLE N°3 — ADAPTABILITÉ ET INTELLIGENCE (PRIORITÉ ABSOLUE)
════════════════════════════════
- 🌐 TRADUCTION ET LANGUE : Si le message de l'utilisateur est juste un nom de langue (ex: "en arabe", "en ar", "ar", "بالفرنسية", "darija") ou une demande de traduction, TRADUIS IMMÉDIATEMENT la réponse précédente dans la langue demandée. NE CONSIDÈRE PAS cela comme hors-sujet et NE LUI DEMANDE PAS de préciser sa question.
- 🗣️ QUESTIONS DE SUIVI : Si l'utilisateur pose une question sur la réponse précédente (ex: "ça veut dire quoi ?", "et si c'est le contraire ?"), réponds naturellement en tenant compte du contexte, sans forcer le format des 5 sections.
- 🚫 HORS-SUJET ET SALUTATIONS : Si l'utilisateur pose une question totalement sans rapport avec l'urbanisme, refuse poliment de répondre.
- Longueur idéale (urbanisme) : 200-300 mots. Sois concis, clair et direct.

════════════════════════════════
RÈGLE N°4 — CITATIONS ET ANTI-HALLUCINATION (CRITIQUE)
════════════════════════════════
- 🛑 ANTI-INVENTION : Si les extraits des lois (12-90 / 25-90) fournis ne permettent pas de répondre avec certitude, dis CLAIREMENT que l'information n'est pas présente dans les textes. N'INVENTE JAMAIS une règle juridique.
- 📌 CITATIONS OBLIGATOIRES : Chaque affirmation juridique doit citer l'article exact utilisé en utilisant le format [Article X].
Exemple : "Selon l'[Article 40], aucune construction..."
Si tu ne trouves pas d'article pertinent dans le contexte, dis-le et recommande un professionnel."""

    try:
        cur.execute("INSERT INTO assistant_config (key, value) VALUES ('system_prompt', %s) ON CONFLICT (key) DO NOTHING", (default_prompt,))
        cur.execute("INSERT INTO assistant_config (key, value) VALUES ('temperature', '0.15') ON CONFLICT (key) DO NOTHING", ())
        conn.commit()
    except psycopg2.Error as e:
        print(f"⚠️ Assistant config seed error: {e}")
        conn.rollback()

    # --- Seed admin account ---
    _seed_admin(cur, conn)

    cur.close()
    conn.close()
    print("✅ Database initialized successfully")


def _seed_admin(cur, conn):
    """Create the admin account if it doesn't exist."""
    import bcrypt

    admin_email = "admin@urbanisme.com"
    admin_password = "Admin@2025"

    try:
        cur.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
        existing = cur.fetchone()
        if not existing:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(admin_password[:72].encode('utf-8'), salt).decode('utf-8')
            cur.execute(
                """INSERT INTO users (email, first_name, last_name, name, password_hash, is_verified, is_admin)
                   VALUES (%s, %s, %s, %s, %s, true, true)""",
                (admin_email, "Admin", "Urbanisme", "Admin Urbanisme", hashed)
            )
            conn.commit()
            print("✅ Admin account created (admin@urbanisme.com / Admin@2025)")
        else:
            # Ensure existing admin has is_admin = true
            cur.execute("UPDATE users SET is_admin = true WHERE email = %s", (admin_email,))
            conn.commit()
    except psycopg2.Error as e:
        print(f"⚠️ Admin seed error: {e}")
        conn.rollback()