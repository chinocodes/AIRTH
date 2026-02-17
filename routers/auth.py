from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from utils.db import cur, conn

router = APIRouter()
pwd_context = CryptContext(schemes=["sha256_crypt"])

# jwt config

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer()

#models
class LoginModel(BaseModel):
    email: EmailStr
    password: str

class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str

# ==============================
# JWT FUNCTIONS
# ==============================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Verify user still exists
    cur.execute("SELECT id FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user_id

# ==============================
# AUTH ROUTES
# ==============================

@router.post("/api/login")
def login(user: LoginModel):
    cur.execute(
        "SELECT id, name, password FROM users WHERE email=%s",
        (user.email,)
    )
    result = cur.fetchone()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, name, hashed = result

    if not pwd_context.verify(user.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"user_id": user_id})

    return {
        "message": f"Welcome {name}!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": user.email
        }
    }


@router.post("/api/register")
def register(user: RegisterModel):
    cur.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = pwd_context.hash(user.password)

    cur.execute("""
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
        RETURNING id;
    """, (user.name, user.email, hashed_pw))

    user_id = cur.fetchone()[0]
    conn.commit()

    return {
        "message": "User registered successfully",
        "user_id": user_id
    }
