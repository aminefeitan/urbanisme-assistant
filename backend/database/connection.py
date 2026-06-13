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
    ]
    for col_name, col_type in new_columns:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            conn.commit()
        except psycopg2.Error:
            conn.rollback()

    cur.close()
    conn.close()
    print("✅ Database initialized successfully")