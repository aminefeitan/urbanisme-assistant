from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from auth.auth_service import (
    generate_otp, send_otp_email, create_otp_record, verify_otp,
    create_or_get_user, create_jwt_token,
    register_user, login_user, mark_user_verified
)
from auth.auth_middleware import get_current_user

router = APIRouter()

# --- Pydantic Models ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str


# --- New Password-Based Endpoints ---

@router.post("/register")
def register(req: RegisterRequest):
    """Inscription : crée un utilisateur non vérifié et envoie un code OTP par email."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères.")
    
    user_data, error = register_user(
        email=req.email,
        password=req.password,
        first_name=req.first_name,
        last_name=req.last_name,
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    if not user_data:
        raise HTTPException(status_code=500, detail="Erreur lors de l'inscription.")
    
    # Envoyer un OTP pour la vérification de l'email
    code = generate_otp()
    create_otp_record(req.email, code)
    success = send_otp_email(req.email, code)
    
    if not success:
        raise HTTPException(status_code=500, detail="Impossible d'envoyer l'email de vérification.")
    
    return {
        "message": "Inscription réussie. Vérifiez votre email pour le code de confirmation.",
        "email": req.email
    }


@router.post("/verify-email")
def verify_email(req: VerifyEmailRequest):
    """Vérifie l'email avec le code OTP et active le compte."""
    is_valid, msg = verify_otp(req.email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    
    user_data = mark_user_verified(req.email)
    if not user_data:
        raise HTTPException(status_code=500, detail="Erreur lors de l'activation du compte.")
    
    token = create_jwt_token(user_data)
    
    return {
        "token": token,
        "user": user_data,
        "message": "Email vérifié avec succès. Vous êtes connecté."
    }


@router.post("/login")
def login(req: LoginRequest):
    """Connexion avec email et mot de passe."""
    user_data, error = login_user(req.email, req.password)
    
    if error:
        raise HTTPException(status_code=401, detail=error)
    if not user_data:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
    
    token = create_jwt_token(user_data)
    
    return {
        "token": token,
        "user": user_data
    }


# --- Legacy OTP Endpoints (kept for backward compatibility) ---

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    code = generate_otp()
    create_otp_record(req.email, code)
    
    success = send_otp_email(req.email, code)
    if not success:
        raise HTTPException(status_code=500, detail="Impossible d'envoyer l'email.")
        
    return {"message": "Code envoyé avec succès"}

@router.post("/verify-otp")
def verify_otp_endpoint(req: VerifyOtpRequest):
    is_valid, msg = verify_otp(req.email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
        
    user_data = create_or_get_user(req.email)
    if not user_data:
        raise HTTPException(status_code=500, detail="Erreur lors de la création de l'utilisateur.")
        
    token = create_jwt_token(user_data)
    
    return {
        "token": token,
        "user": user_data
    }

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    """Retourne l'utilisateur actuellement connecté."""
    return {"user": user}
