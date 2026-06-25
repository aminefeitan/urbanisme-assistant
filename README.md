# 🏛️ Assistant Urbanisme — Loi 12-90

Chatbot intelligent pour les plaintes urbanistiques avec support vocal et authentification.
Stack: FastAPI + Mistral API + PostgreSQL/pgvector + Tesseract OCR + Faster-Whisper + React + Tailwind CSS

---

## Ce qu'il faut installer (une seule fois)

Machine: Windows 64-bit, Python 3.13

---

### 1. PostgreSQL 16

https://www.postgresql.org/download/windows/

- Lance l'installer, garde le mot de passe noté
- Laisse le port par défaut: 5432
- Coche "Stack Builder" a la fin pour installer pgvector
- Si Stack Builder ne montre pas pgvector: https://github.com/pgvector/pgvector/releases

---

### 2. Tesseract OCR

https://github.com/UB-Mannheim/tesseract/wiki

- Telecharge: tesseract-ocr-w64-setup-5.x.x.exe
- Pendant l'installation coche: Arabic (ara) + French (fra)
- Chemin: C:\Program Files\Tesseract-OCR

Ajoute au PATH Windows:
  Panneau de configuration > Systeme > Variables d'environnement
  > PATH > Nouveau > C:\Program Files\Tesseract-OCR

Verifie avec: tesseract --version

---

### 3. Poppler (pour lire les PDF)

https://github.com/oschwartz10612/poppler-windows/releases

- Telecharge Release-xx.xx.x-0.zip
- Extrais dans C:\poppler
- Ajoute au PATH: C:\poppler\Library\bin

Verifie avec: pdfinfo --version

---

### 4. Node.js 20 LTS

https://nodejs.org/en/download

---

### 5. Cle API Mistral (gratuite)

https://console.mistral.ai > API Keys > Create new key

---

## Creer la base de donnees

Ouvre pgAdmin ou psql:

  CREATE DATABASE khenifra_urban;
  \c khenifra_urban
  CREATE EXTENSION vector;

---

## Lancer le Backend

  cd backend

  copy .env.example .env
  # Ouvre .env et remplis:
  #   MISTRAL_API_KEY=ta_cle_ici
  #   DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@localhost:5432/khenifra_urban

  python -m venv venv
  venv\Scripts\activate

  pip install -r requirements.txt

  uvicorn main:app --reload --host 0.0.0.0 --port 8000

API disponible: http://localhost:8000
Swagger docs: http://localhost:8000/docs

---

## Lancer le Frontend

  cd frontend
  npm install
  npm start

Interface: http://localhost:3000

---

## Charger la Loi 12-90 (OCR — une seule fois)

1. Interface > panneau gauche > "Charger PDF loi 12-90"
2. Selectionne le fichier PDF
3. L'OCR tourne en arriere-plan (~5-15 min selon nb de pages)
4. Quand "Base de donnees" affiche des articles = pret !

Si la loi change: Reset dans le panel, puis re-upload le nouveau PDF.

---

## Versions compatibles Python 3.13

| Package           | Version  | Pourquoi                              |
|-------------------|----------|---------------------------------------|
| numpy             | 2.2.6    | Python 3.13 casse numpy 1.x (C API)   |
| Pillow            | 11.3.0   | Python 3.13 casse Pillow 10.x         |
| mistralai         | 1.9.11   | Derniere 1.x stable                   |
| fastapi           | 0.136.1  | Derniere stable                       |
| pgvector          | 0.4.2    | Derniere stable                       |
| psycopg2-binary   | 2.9.12   | Derniere stable                       |
| faster-whisper    | 1.2.1    | Support vocal (Speech-to-Text)        |
| PyJWT             | 2.9.0    | Authentification JWT                  |

---

## Structure du projet

  assistant-urbanisme/
  backend/
    main.py                  <- FastAPI entry point
    requirements.txt         <- Python 3.13 compatible
    .env.example             <- Config template
    database/connection.py   <- PostgreSQL + init tables
    ocr/processor.py         <- Tesseract pipeline
    chat/engine.py           <- RAG + Mistral API
    api/
      routes_auth.py         <- Endpoints d'authentification
      routes_chat.py         <- Endpoints de chat (incluant vocal)
      routes_ocr.py          <- Endpoints d'upload PDF
  frontend/
    tailwind.config.js       <- Configuration Tailwind CSS
    src/
      App.jsx
      App.css
      components/
        AuthPage.jsx
        LandingPage.jsx
        MessageBubble.jsx
        InputBar.jsx
        Sidebar.jsx
      services/api.js
  scripts/setup_db.sql
  README.md