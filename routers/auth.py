from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from utils.db import cur, conn

router = APIRouter()
pwd_context = CryptContext(schemes=["sha256_crypt"])

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/api/login")
def login(user: LoginModel):
    cur.execute("SELECT id, name, password FROM users WHERE email=%s", (user.email,))
    result = cur.fetchone()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, name, hashed = result

    if not pwd_context.verify(user.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": f"Welcome {name}!",
        "user": {"id": user_id, "name": name, "email": user.email}
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

    return {"message": "User registered successfully", "user_id": user_id}
