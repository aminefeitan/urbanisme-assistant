import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import jwt
import os
from database.connection import get_connection

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-for-dev")

# --- Password Hashing ---
import bcrypt

def get_password_hash(password: str) -> str:
    """Hache un mot de passe en utilisant bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password[:72].encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie un mot de passe en clair contre son hash."""
    try:
        return bcrypt.checkpw(plain_password[:72].encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# --- OTP ---
def generate_otp():
    """Génère un code OTP à 6 chiffres."""
    return str(random.randint(100000, 999999))

def send_otp_email(to_email: str, code: str):
    """Envoie le code OTP par email."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Avertissement: SMTP_EMAIL ou SMTP_PASSWORD non configuré. L'email ne sera pas envoyé.")
        print(f"Code généré pour {to_email}: {code}")
        return True # Simuler le succès en dev
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Votre code de vérification - Assistant Urbanisme Khénifra"
        
        body = f"""
        Bonjour,
        
        Voici votre code de vérification pour accéder à l'Assistant Urbanisme de Khénifra :
        
        {code}
        
        Ce code expirera dans 5 minutes.
        
        Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email: {e}")
        return False

def create_otp_record(email: str, code: str):
    """Enregistre le code OTP dans la base de données."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Invalidate previous codes
        cur.execute("UPDATE otp_codes SET used = true WHERE email = %s AND used = false", (email,))
        
        expires_at = datetime.now() + timedelta(minutes=5)
        cur.execute(
            "INSERT INTO otp_codes (email, code, expires_at) VALUES (%s, %s, %s)",
            (email, code, expires_at)
        )
        conn.commit()
    except Exception as e:
        print(f"Erreur base de données (OTP): {e}")
    finally:
        cur.close()
        conn.close()

def verify_otp(email: str, code: str):
    """Vérifie si le code OTP est valide et non expiré."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, expires_at FROM otp_codes WHERE email = %s AND code = %s AND used = false ORDER BY created_at DESC LIMIT 1",
            (email, code)
        )
        record = cur.fetchone()
        
        if not record:
            return False, "Code invalide ou déjà utilisé."
            
        otp_id, expires_at = record
        if datetime.now() > expires_at:
            return False, "Code expiré."
            
        # Marquer comme utilisé
        cur.execute("UPDATE otp_codes SET used = true WHERE id = %s", (otp_id,))
        conn.commit()
        return True, "Code valide."
    except Exception as e:
        print(f"Erreur vérification OTP: {e}")
        return False, "Erreur serveur."
    finally:
        cur.close()
        conn.close()


# --- User Management ---

def register_user(email: str, password: str, first_name: str, last_name: str):
    """
    Inscrit un nouvel utilisateur (is_verified = false).
    Retourne l'utilisateur créé ou None si l'email existe déjà.
    """
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Vérifier si l'email existe déjà
        cur.execute("SELECT id, is_verified FROM users WHERE email = %s", (email,))
        existing = cur.fetchone()
        
        if existing:
            user_id, is_verified = existing
            if is_verified:
                return None, "Un compte avec cet email existe déjà."
            else:
                # L'utilisateur existe mais n'est pas vérifié → mettre à jour ses infos
                password_hash = get_password_hash(password)
                cur.execute(
                    """UPDATE users 
                       SET first_name = %s, last_name = %s, name = %s, password_hash = %s 
                       WHERE id = %s
                       RETURNING id, email, first_name, last_name""",
                    (first_name, last_name, f"{first_name} {last_name}", password_hash, user_id)
                )
                user = cur.fetchone()
                conn.commit()
                return {
                    "id": user[0],
                    "email": user[1],
                    "first_name": user[2],
                    "last_name": user[3],
                }, None

        password_hash = get_password_hash(password)
        cur.execute(
            """INSERT INTO users (email, first_name, last_name, name, password_hash, is_verified)
               VALUES (%s, %s, %s, %s, %s, false)
               RETURNING id, email, first_name, last_name""",
            (email, first_name, last_name, f"{first_name} {last_name}", password_hash)
        )
        user = cur.fetchone()
        conn.commit()
        return {
            "id": user[0],
            "email": user[1],
            "first_name": user[2],
            "last_name": user[3],
        }, None
    except Exception as e:
        print(f"Erreur lors de l'inscription: {e}")
        conn.rollback()
        return None, "Erreur serveur lors de l'inscription."
    finally:
        cur.close()
        conn.close()


def mark_user_verified(email: str):
    """Marque l'utilisateur comme vérifié et retourne ses données."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE users SET is_verified = true, last_login = %s 
               WHERE email = %s 
               RETURNING id, email, first_name, last_name, name, is_admin""",
            (datetime.now(), email)
        )
        user = cur.fetchone()
        if not user:
            return None
        conn.commit()
        return {
            "id": user[0],
            "email": user[1],
            "first_name": user[2],
            "last_name": user[3],
            "name": user[4],
            "is_admin": user[5] or False,
        }
    except Exception as e:
        print(f"Erreur lors de la vérification: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def update_user_profile(user_id: int, first_name: str, last_name: str):
    """Met à jour le prénom et le nom de l'utilisateur."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE users 
               SET first_name = %s, last_name = %s, name = %s 
               WHERE id = %s
               RETURNING id, email, first_name, last_name, name""",
            (first_name, last_name, f"{first_name} {last_name}".strip(), user_id)
        )
        user = cur.fetchone()
        conn.commit()
        if not user:
            return None
        return {
            "id": user[0],
            "email": user[1],
            "first_name": user[2],
            "last_name": user[3],
            "name": user[4]
        }
    except Exception as e:
        print(f"Erreur lors de la mise à jour du profil: {e}")
        conn.rollback()
        return None
    finally:
        cur.close()
        conn.close()

def login_user(email: str, password: str):
    """Connecte un utilisateur avec email et mot de passe."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, email, first_name, last_name, name, password_hash, is_verified, is_admin FROM users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()
        
        if not user:
            print(f"DEBUG: User not found for email {email}")
            return None, "Email ou mot de passe incorrect."
        
        user_id, user_email, first_name, last_name, name, password_hash, is_verified, is_admin = user
        
        if not password_hash:
            print(f"DEBUG: No password hash for email {email}")
            return None, "Ce compte n'a pas de mot de passe. Veuillez vous inscrire."
        
        if not verify_password(password, password_hash):
            print(f"DEBUG: verify_password failed for email {email}")
            return None, "Email ou mot de passe incorrect."
        
        if not is_verified:
            print(f"DEBUG: is_verified is False for email {email}")
            return None, "Votre email n'est pas encore vérifié. Veuillez compléter l'inscription."
        
        # Mettre à jour last_login
        cur.execute("UPDATE users SET last_login = %s WHERE id = %s", (datetime.now(), user_id))
        conn.commit()
        
        return {
            "id": user_id,
            "email": user_email,
            "first_name": first_name,
            "last_name": last_name,
            "name": name,
            "is_admin": is_admin or False,
        }, None
    except Exception as e:
        print(f"Erreur lors de la connexion: {e}")
        return None, "Erreur serveur."
    finally:
        cur.close()
        conn.close()


def create_or_get_user(email: str):
    """Crée l'utilisateur s'il n'existe pas ou met à jour sa dernière connexion."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, email, name FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            cur.execute(
                "INSERT INTO users (email, last_login) VALUES (%s, %s) RETURNING id, email, name",
                (email, datetime.now())
            )
            user = cur.fetchone()
        else:
            cur.execute("UPDATE users SET last_login = %s WHERE email = %s", (datetime.now(), email))
            
        conn.commit()
        
        return {
            "id": user[0],
            "email": user[1],
            "name": user[2]
        }
    except Exception as e:
        print(f"Erreur gestion utilisateur: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def create_jwt_token(user_data: dict):
    """Génère un jeton JWT pour la session utilisateur."""
    expiration = datetime.now() + timedelta(days=7)
    payload = {
        "sub": str(user_data["id"]),
        "email": user_data["email"],
        "name": user_data.get("name") or f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
        "first_name": user_data.get("first_name", ""),
        "last_name": user_data.get("last_name", ""),
        "is_admin": user_data.get("is_admin", False),
        "exp": expiration
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

def decode_jwt_token(token: str):
    """Décode et vérifie un jeton JWT."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
