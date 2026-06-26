# 🏛️ Assistant Urbanisme — Lois 12-90 & 25-90

> Chatbot juridique intelligent pour les plaintes urbanistiques au Maroc, spécialisé pour la ville de Khénifra.
> Support vocal, authentification OTP, interface bilingue (Arabe / Français), et recherche sémantique RAG.

---

## ⚡ Stack Technique

| Couche     | Technologies                                                     |
|------------|------------------------------------------------------------------|
| **Backend**  | FastAPI · Python 3.13 · Uvicorn                                |
| **IA / LLM** | Mistral API (`mistral-embed` + `mistral-small-latest`)         |
| **Base de données** | PostgreSQL 16 · pgvector (recherche sémantique cosinus) |
| **OCR**      | Tesseract OCR · Poppler (pdf2image) · Pillow                  |
| **Vocal**    | Faster-Whisper (Speech-to-Text)                                |
| **Auth**     | JWT · bcrypt · OTP par email (SMTP)                            |
| **Frontend** | React 18 · Tailwind CSS 3 · react-markdown                    |

---

## ✨ Fonctionnalités

- 🤖 **Chat RAG** — Recherche sémantique dans les articles des lois 12-90 et 25-90, réponses contextualisées avec citations d'articles
- 🎙️ **Support vocal** — Dictée vocale via Faster-Whisper (Speech-to-Text)
- 📄 **OCR PDF** — Extraction automatique des articles depuis les PDFs des lois (Tesseract + Poppler)
- 🔐 **Authentification** — Inscription/Connexion avec vérification OTP par email + sessions JWT
- 🌐 **Bilingue** — Interface complète en Arabe (RTL) et Français, détection automatique de la langue
- 🌙 **Thème clair/sombre** — Personnalisation de l'interface
- 💬 **Historique** — Conversations persistantes, épinglage, suppression
- ⚙️ **Page paramètres** — Politique de confidentialité, conditions d'utilisation, à propos
- 👤 **Profil utilisateur** — Modification du nom/prénom
- 🧑‍💻 **Mode invité** — Accès au chat sans inscription (sans historique persistant)

---

## 📁 Structure du Projet

```
assistant-urbanisme/
├── backend/
│   ├── main.py                    ← Point d'entrée FastAPI
│   ├── requirements.txt           ← Dépendances Python 3.13
│   ├── .env.example               ← Template de configuration
│   ├── api/
│   │   ├── routes_auth.py         ← Endpoints d'authentification (register, login, OTP, profil)
│   │   ├── routes_chat.py         ← Endpoints de chat (texte + vocal, conversations, historique)
│   │   └── routes_ocr.py          ← Endpoints d'upload et traitement PDF
│   ├── auth/
│   │   ├── auth_service.py        ← Logique auth (OTP, JWT, bcrypt, gestion utilisateurs)
│   │   └── auth_middleware.py     ← Middleware d'authentification JWT
│   ├── chat/
│   │   ├── engine.py              ← Pipeline RAG (embeddings → pgvector → Mistral chat)
│   │   └── stt.py                 ← Speech-to-Text (Faster-Whisper)
│   ├── database/
│   │   └── connection.py          ← Connexion PostgreSQL + initialisation des tables
│   └── ocr/
│       └── processor.py           ← Pipeline OCR (Tesseract + pdf2image)
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js         ← Configuration Tailwind CSS
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx                ← Composant principal (routing, état global)
│       ├── index.js               ← Point d'entrée React
│       ├── index.css              ← Styles globaux
│       ├── translations.js        ← Dictionnaires i18n (Arabe / Français)
│       ├── components/
│       │   ├── AuthPage.jsx       ← Page d'authentification (Login / Register / OTP)
│       │   ├── LandingPage.jsx    ← Page d'accueil
│       │   ├── SettingsPage.jsx   ← Page paramètres (confidentialité, CGU, à propos)
│       │   ├── Sidebar.jsx        ← Barre latérale (conversations, profil, OCR, thème)
│       │   ├── MessageBubble.jsx  ← Bulle de message (markdown, édition, suppression)
│       │   └── InputBar.jsx       ← Barre de saisie (texte + micro vocal)
│       └── services/
│           └── api.js             ← Client API (fetch vers le backend)
├── scripts/
│   └── setup_db.sql               ← Script SQL d'initialisation de la base
├── .gitignore
└── README.md
```

---

## 🛠️ Prérequis (à installer une seule fois)

> **Système** : Windows 64-bit · Python 3.13 · Node.js 20 LTS

### 1. PostgreSQL 16

📥 https://www.postgresql.org/download/windows/

- Lance l'installer, note le mot de passe choisi
- Laisse le port par défaut : `5432`
- Coche **Stack Builder** à la fin pour installer **pgvector**
- Si pgvector n'apparaît pas : https://github.com/pgvector/pgvector/releases

### 2. Tesseract OCR

📥 https://github.com/UB-Mannheim/tesseract/wiki

- Télécharge `tesseract-ocr-w64-setup-5.x.x.exe`
- Pendant l'installation, coche : **Arabic (ara)** + **French (fra)**
- Chemin d'installation : `C:\Program Files\Tesseract-OCR`

Ajoute au PATH Windows :
```
Panneau de configuration > Système > Variables d'environnement
> PATH > Nouveau > C:\Program Files\Tesseract-OCR
```

Vérifie : `tesseract --version`

### 3. Poppler (pour lire les PDF)

📥 https://github.com/oschwartz10612/poppler-windows/releases

- Télécharge `Release-xx.xx.x-0.zip`
- Extrais dans `C:\poppler`
- Ajoute au PATH : `C:\poppler\Library\bin`

Vérifie : `pdfinfo --version`

### 4. Node.js 20 LTS

📥 https://nodejs.org/en/download

### 5. Clé API Mistral (gratuite)

📥 https://console.mistral.ai → API Keys → Create new key

---

## 🗄️ Créer la base de données

### Option A — Via le script SQL

```bash
psql -U postgres -f scripts/setup_db.sql
```

### Option B — Manuellement (pgAdmin ou psql)

```sql
CREATE DATABASE khenifra_urban;
\c khenifra_urban
CREATE EXTENSION IF NOT EXISTS vector;
```

> **Note** : Les tables (`users`, `otp_codes`, `chat_messages`, `loi_articles`) sont créées automatiquement au démarrage du backend via la fonction `init_db()`.

---

## 🚀 Lancer le Backend

```bash
cd backend

# 1. Configurer l'environnement
copy .env.example .env
# Ouvre .env et remplis :
#   MISTRAL_API_KEY=ta_cle_ici
#   DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@localhost:5432/khenifra_urban
#   JWT_SECRET=un_secret_fort          (optionnel, défaut: super-secret-key-for-dev)
#   SMTP_EMAIL=ton_email@gmail.com     (optionnel, pour envoyer les OTP par email)
#   SMTP_PASSWORD=mot_de_passe_app     (optionnel, App Password Gmail)

# 2. Créer et activer l'environnement virtuel
python -m venv venv
venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Lancer le serveur
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **API** : http://localhost:8000
- **Swagger** : http://localhost:8000/docs
- **Health check** : `GET /` → `{"status": "ok", "project": "Assistant Urbanisme", "loi": "12-90 / 25-90"}`

---

## 🖥️ Lancer le Frontend

```bash
cd frontend
npm install
npm start
```

Interface : http://localhost:3000

---

## 📄 Charger les Lois (OCR — une seule fois)

1. Connecte-toi à l'interface
2. Barre latérale → section **OCR** → **📎 Charger PDF (12-90 / 25-90)**
3. Sélectionne le fichier PDF de la loi
4. L'OCR tourne en arrière-plan (~5-15 min selon le nombre de pages)
5. Quand la base affiche des articles → ✅ prêt !

> Si la loi change : re-upload le nouveau PDF.

---

## 🔗 Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint                    | Description                         |
|---------|-----------------------------|-------------------------------------|
| `POST`  | `/api/auth/register`        | Inscription (email, password, nom)  |
| `POST`  | `/api/auth/send-otp`        | Envoyer le code OTP par email       |
| `POST`  | `/api/auth/verify-otp`      | Vérifier le code OTP                |
| `POST`  | `/api/auth/login`           | Connexion (email + password)        |
| `GET`   | `/api/auth/me`              | Récupérer l'utilisateur connecté    |
| `PUT`   | `/api/auth/profile`         | Modifier le profil (prénom, nom)    |

### Chat (`/api/chat`)

| Méthode  | Endpoint                        | Description                          |
|----------|---------------------------------|--------------------------------------|
| `POST`   | `/api/chat/message`             | Envoyer un message texte             |
| `POST`   | `/api/chat/voice`               | Envoyer un message vocal (audio)     |
| `GET`    | `/api/chat/conversations`       | Lister les conversations             |
| `GET`    | `/api/chat/conversations/:id`   | Messages d'une conversation          |
| `DELETE` | `/api/chat/conversations/:id`   | Supprimer une conversation           |
| `PUT`    | `/api/chat/conversations/:id/pin` | Épingler/désépingler              |

### OCR (`/api/ocr`)

| Méthode | Endpoint            | Description                          |
|---------|---------------------|--------------------------------------|
| `POST`  | `/api/ocr/upload`   | Uploader et traiter un PDF           |
| `GET`   | `/api/ocr/articles` | Lister les articles extraits         |

---

## 📦 Versions compatibles (Python 3.13)

| Package           | Version  | Rôle                                         |
|-------------------|----------|----------------------------------------------|
| fastapi           | 0.136.1  | Framework API REST                           |
| uvicorn           | 0.46.0   | Serveur ASGI                                 |
| mistralai         | 1.9.11   | Client Mistral API (embeddings + chat)       |
| psycopg2-binary   | 2.9.12   | Driver PostgreSQL                            |
| pgvector          | 0.4.2    | Extension vectorielle PostgreSQL             |
| numpy             | 2.2.6    | Calculs numériques (Python 3.13 compatible)  |
| Pillow            | 11.3.0   | Traitement d'images (Python 3.13 compatible) |
| pytesseract       | 0.3.13   | Interface Python pour Tesseract OCR          |
| pdf2image         | 1.17.0   | Conversion PDF → images                     |
| faster-whisper    | 1.2.1    | Speech-to-Text local                         |
| PyJWT             | 2.9.0    | Tokens JWT                                   |
| passlib[bcrypt]   | 1.7.4    | Hachage de mots de passe (bcrypt)            |
| python-dotenv     | 1.0.0    | Variables d'environnement `.env`             |
| pydantic          | 2.11.4   | Validation des données                       |
| python-multipart  | 0.0.27   | Upload de fichiers                           |

---

## 🏗️ Architecture RAG

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Query  │────▶│  mistral-embed   │────▶│  pgvector        │
│              │     │  (1024-dim)      │     │  cosine search   │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                              Top-K articles
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ mistral-small   │
                                              │ + System Prompt │
                                              │ + Context       │
                                              │ + History       │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Réponse avec   │
                                              │  citations      │
                                              │  [Article X]    │
                                              └─────────────────┘
```

1. **Embedding** : La question est convertie en vecteur 1024-dim via `mistral-embed`
2. **Recherche sémantique** : pgvector retrouve les articles les plus similaires (cosinus > 0.45)
3. **Génération** : `mistral-small-latest` génère une réponse structurée avec les articles en contexte
4. **Détection de langue** : Réponse automatique en Darija / Arabe classique / Français selon la langue du message
5. **Anti-hallucination** : Le système cite obligatoirement les articles sources et signale quand l'information est absente

---

## ⚙️ Variables d'environnement

| Variable          | Requis | Description                                    | Exemple                                                      |
|-------------------|--------|------------------------------------------------|--------------------------------------------------------------|
| `MISTRAL_API_KEY` | ✅     | Clé API Mistral                                | `sk-xxxxxxxx`                                                |
| `DATABASE_URL`    | ✅     | URL de connexion PostgreSQL                    | `postgresql://postgres:pass@localhost:5432/khenifra_urban`    |
| `JWT_SECRET`      | ❌     | Secret pour signer les tokens JWT              | `mon-secret-jwt-fort`                                        |
| `SMTP_EMAIL`      | ❌     | Email Gmail pour envoyer les OTP               | `assistant@gmail.com`                                        |
| `SMTP_PASSWORD`   | ❌     | App Password Gmail                             | `xxxx xxxx xxxx xxxx`                                        |

> **Note** : Sans `SMTP_EMAIL`/`SMTP_PASSWORD`, les codes OTP sont affichés dans la console du backend (mode développement).

---

## 📝 Licence

Projet académique — Ville de Khénifra, Maroc.