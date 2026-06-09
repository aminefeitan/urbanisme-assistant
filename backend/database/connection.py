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

    # Chat history
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id         SERIAL PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            role       VARCHAR(20)  NOT NULL,
            content    TEXT         NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized successfully")
