from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

FAKE_USER_DB = {
    "pilot": {
        "username": "pilot",
        "password_hash": "$2b$12$VQw2qXrj3M8501V3Ywrzoex4SiuNwslAiBauYVh.k8RkTsL7yMGNa"
    }
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print("USERNAME RECEIVED:", form_data.username)
    print("PASSWORD RECEIVED:", form_data.password)

    user = FAKE_USER_DB.get(form_data.username)
    print("USER FOUND:", user)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    print("HASH STORED:", user["password_hash"])
    print("VERIFY RESULT:", verify_password(form_data.password, user["password_hash"]))

    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    print("JWT SECRET:", settings.jwt_secret)

    access_token = create_access_token({"sub": user["username"]})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }