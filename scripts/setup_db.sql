-- Run this ONCE to prepare PostgreSQL for the project
-- psql -U postgres -f scripts/setup_db.sql

CREATE DATABASE khenifra_urban;
\c khenifra_urban

CREATE EXTENSION IF NOT EXISTS vector;

-- All tables are auto-created by FastAPI on startup (init_db function)
-- This script just creates the DB and extension.

SELECT 'Database khenifra_urban ready ✅' AS status;
