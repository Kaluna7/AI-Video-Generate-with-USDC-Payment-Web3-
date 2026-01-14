import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt

# ==============================
# Database configuration
# ==============================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:12345@localhost:5432/web3",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================
# Security configuration
# ==============================

# Gunakan bcrypt_sha256 agar tidak terkena limit 72 byte bawaan bcrypt.
# bcrypt_sha256 akan melakukan SHA-256 dulu, lalu hasilnya di-hash dengan bcrypt.
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_ME_TO_A_RANDOM_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
RESET_TOKEN_EXPIRE_MINUTES = 60  # 1 hour


def hash_password(password: str) -> str:
    """
    Hash password menggunakan bcrypt_sha256 (tidak dibatasi 72 byte).
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_reset_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
        return email
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")


# ==============================
# ORM models
# ==============================


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)


Base.metadata.create_all(bind=engine)


# ==============================
# Pydantic schemas
# ==============================


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserOut] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ==============================
# FastAPI app & middleware
# ==============================

app = FastAPI(title="Web3 Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Web3 Auth API is running"}


# ==============================
# Auth endpoints
# ==============================


@app.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        # bcrypt limitation: max 72 bytes
        if len(user_in.password.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at most 72 characters.",
            )

        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hash_password(user_in.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        # re-throw HTTPExceptions unchanged
        raise
    except Exception as e:
        # Untuk debugging: kirim pesan error ke client (sementara)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {e}",
        )


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.post("/auth/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        # Untuk keamanan, jangan bocorkan bahwa email tidak terdaftar
        return {"message": "If that email exists, a reset link has been generated."}

    token = create_reset_token(email=user.email)
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    db.add(user)
    db.commit()

    # Di production kamu kirim token ini via email. Untuk sekarang kita return supaya mudah dites dari frontend.
    return {"message": "Password reset token generated.", "reset_token": token}


@app.post("/auth/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_token(body.token)

    user = db.query(User).filter(User.email == email).first()
    if (
        not user
        or user.reset_token != body.token
        or not user.reset_token_expires_at
        or user.reset_token_expires_at < datetime.utcnow()
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.add(user)
    db.commit()

    return {"message": "Password has been reset successfully."}