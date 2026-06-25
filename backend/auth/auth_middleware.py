from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.auth_service import decode_jwt_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dépendance FastAPI pour récupérer l'utilisateur à partir du token JWT."""
    token = credentials.credentials
    payload = decode_jwt_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return {
        "id": int(payload["sub"]),
        "email": payload["email"],
        "name": payload.get("name"),
        "first_name": payload.get("first_name"),
        "last_name": payload.get("last_name")
    }

def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Version optionnelle: retourne None si pas de token."""
    # We can't easily use HTTPBearer optionally without failing if no header, 
    # so we'll just check if it's there. However, HTTPBearer(auto_error=False) works better for this.
    pass

security_optional = HTTPBearer(auto_error=False)

def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security_optional)):
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_jwt_token(token)
    
    if payload:
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
            "name": payload.get("name"),
            "first_name": payload.get("first_name"),
            "last_name": payload.get("last_name")
        }
    return None
