import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import requests

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

if load_dotenv:
    base_dir = Path(__file__).resolve().parent
    load_dotenv(base_dir / ".env")
    load_dotenv(base_dir.parent / ".env")
# ==============================
# Database configuration
# ==============================
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Normalize common .env issues: surrounding quotes or trailing whitespace.
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")
if not DATABASE_URL:
    if load_dotenv is None:
        raise RuntimeError(
            "DATABASE_URL is not set and python-dotenv is missing. "
            "Install it (pip install python-dotenv) or set DATABASE_URL in OS env vars."
        )
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to back-end/.env or project-root/.env."
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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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
# Video generation schemas
# ==============================


class TextToVideoRequest(BaseModel):
    prompt: str
    duration_seconds: Optional[int] = 5
    resolution: Optional[str] = "1080p"
    fps: Optional[int] = 30
    style: Optional[str] = None


class VideoJobOut(BaseModel):
    job_id: str
    status: str  # queued | processing | succeeded | failed
    provider: str
    video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime


# In-memory job store (OK for hackathon / single-instance dev)
VIDEO_JOBS: Dict[str, Dict[str, Any]] = {}


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """
    Validate JWT access token and return the User record.
    Frontend should send: Authorization: Bearer <token>
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = int(sub)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def _provider_name() -> str:
    return (os.getenv("VIDEO_PROVIDER") or "mock").strip().lower()


def _replicate_headers() -> Dict[str, str]:
    token = os.getenv("REPLICATE_API_TOKEN")
    if token:
        token = token.strip().strip('"').strip("'")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="REPLICATE_API_TOKEN is not set in environment",
        )
    return {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json",
    }


def _replicate_create_prediction(prompt: str, duration_seconds: int) -> Dict[str, Any]:
    """
    Create a Replicate prediction.

    You MUST set:
    - REPLICATE_API_TOKEN
    - REPLICATE_MODEL_VERSION (the model version id string)

    Note: Different models require different `input` fields.
    This implementation uses a simple, generic input with `prompt` and `duration`.
    Adjust in your .env and/or here to match the chosen model.
    """
    version = os.getenv("REPLICATE_MODEL_VERSION")
    if version:
        version = version.strip().strip('"').strip("'")
    if not version:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="REPLICATE_MODEL_VERSION is not set in environment",
        )

    payload = {
        "version": version,
        "input": {
            "prompt": prompt,
            "duration": duration_seconds,
        },
    }
    resp = requests.post(
        "https://api.replicate.com/v1/predictions",
        headers=_replicate_headers(),
        json=payload,
        timeout=60,
    )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Replicate error ({resp.status_code}): {resp.text}",
        )
    return resp.json()


def _replicate_get_prediction(prediction_id: str) -> Dict[str, Any]:
    resp = requests.get(
        f"https://api.replicate.com/v1/predictions/{prediction_id}",
        headers=_replicate_headers(),
        timeout=30,
    )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Replicate error ({resp.status_code}): {resp.text}",
        )
    return resp.json()


def _veo3_base_url() -> str:
    """
    Veo3 provider base URL.
    Default follows Veo 3.1 docs (can be overridden via env).
    """
    base = os.getenv("VEO3_BASE_URL") or "https://veo3api.com"
    return base.strip().rstrip("/")


def _veo3_headers() -> Dict[str, str]:
    key = os.getenv("VEO3_API_KEY")
    if key:
        key = key.strip().strip('"').strip("'")
    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VEO3_API_KEY is not set in environment",
        )
    # Veo 3.1 docs use: Authorization: Bearer YOUR_API_KEY
    header_name = (os.getenv("VEO3_AUTH_HEADER_NAME") or "Authorization").strip()
    header_value = key
    if header_name.lower() == "authorization":
        # Support both: raw key or already prefixed "Bearer ..."
        header_value = key if key.lower().startswith("bearer ") else f"Bearer {key}"
    return {header_name: header_value, "Content-Type": "application/json"}


def _veo3_create_task(prompt: str, duration_seconds: int) -> Dict[str, Any]:
    """
    Create a Veo3 text-to-video task.
    Env customization:
    - VEO3_BASE_URL
    - VEO3_API_KEY
    - VEO3_AUTH_HEADER_NAME (default: Authorization)
    - VEO3_MODEL (optional, default: veo3-fast)
    - VEO3_ASPECT_RATIO (optional, e.g. 16:9)
    - VEO3_WATERMARK (optional, set to "null" string to send JSON null)
    """
    # Veo 3.1: POST /generate
    payload: Dict[str, Any] = {"prompt": prompt}

    model = os.getenv("VEO3_MODEL")
    payload["model"] = (model.strip() if model and model.strip() else "veo3-fast")

    aspect = os.getenv("VEO3_ASPECT_RATIO")
    if aspect and aspect.strip():
        payload["aspect_ratio"] = aspect.strip()

    watermark = os.getenv("VEO3_WATERMARK")
    if watermark is not None and watermark.strip() != "":
        wm = watermark.strip()
        payload["watermark"] = None if wm.lower() == "null" else wm

    resp = requests.post(
        f"{_veo3_base_url()}/generate",
        headers=_veo3_headers(),
        json=payload,
        timeout=60,
    )
    # If auth is wrong, bubble it up as 401/403 so frontend sees the real issue (not 502).
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Veo3 unauthorized: {resp.text}",
        )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Veo3 provider error ({resp.status_code}): {resp.text}",
        )
    return resp.json()


def _veo3_get_status(task_id: str) -> Dict[str, Any]:
    # Veo 3.1: GET /feed?task_id=...
    resp = requests.get(f"{_veo3_base_url()}/feed", headers=_veo3_headers(), params={"task_id": task_id}, timeout=30)
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Veo3 unauthorized: {resp.text}",
        )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Veo3 provider error ({resp.status_code}): {resp.text}",
        )
    return resp.json()


def _veo3_get_download(task_id: str) -> Dict[str, Any]:
    # Veo 3.1 doesn't have /download; the URL is returned in /feed response.
    # We keep this helper for optional 1080p endpoint.
    resp = requests.get(
        f"{_veo3_base_url()}/get-1080p",
        headers=_veo3_headers(),
        params={"task_id": task_id},
        timeout=60,
    )
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Veo3 unauthorized: {resp.text}",
        )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Veo3 provider error ({resp.status_code}): {resp.text}",
        )
    return resp.json()


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


# ==============================
# Video generation endpoints
# ==============================


@app.post("/video/text-to-video", response_model=VideoJobOut)
def create_text_to_video_job(
    body: TextToVideoRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    provider = _provider_name()
    job_id = str(uuid4())
    created_at = datetime.utcnow()

    # Default job shape
    job: Dict[str, Any] = {
        "job_id": job_id,
        "status": "queued",
        "provider": provider,
        "video_url": None,
        "error": None,
        "created_at": created_at,
        "user_id": current_user.id,
    }

    if provider == "mock":
        # Instant success (useful for UI wiring without any API keys)
        job["status"] = "succeeded"
        job["video_url"] = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

    elif provider == "replicate":
        pred = _replicate_create_prediction(body.prompt.strip(), int(body.duration_seconds or 5))
        job["status"] = pred.get("status") or "processing"
        job["provider_prediction_id"] = pred.get("id")
        # Some models may return output immediately
        output = pred.get("output")
        if isinstance(output, str):
            job["video_url"] = output
        elif isinstance(output, list) and output:
            job["video_url"] = output[0] if isinstance(output[0], str) else None
        if job["video_url"] and job["status"] == "succeeded":
            job["status"] = "succeeded"
        elif job["status"] in ("starting", "processing", "queued"):
            job["status"] = "processing"

    elif provider == "veo3":
        task = _veo3_create_task(body.prompt.strip(), int(body.duration_seconds or 5))
        # Veo 3.1 docs: { code, message, data: { task_id } }
        data = task.get("data") if isinstance(task, dict) else None
        task_id = None
        if isinstance(data, dict):
            task_id = data.get("task_id")
        # Fallbacks for other shapes
        if not task_id and isinstance(task, dict):
            task_id = task.get("taskId") or task.get("task_id") or task.get("id")
        if not task_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Veo3 provider response missing task id: {task}",
            )
        job["provider_task_id"] = str(task_id)
        # Generate is async -> processing
        job["status"] = "processing"

    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unsupported VIDEO_PROVIDER '{provider}'. Use 'mock', 'replicate', or 'veo3'.",
        )

    VIDEO_JOBS[job_id] = job
    return VideoJobOut(
        job_id=job_id,
        status=job["status"],
        provider=job["provider"],
        video_url=job.get("video_url"),
        error=job.get("error"),
        created_at=job["created_at"],
    )


@app.get("/video/jobs/{job_id}", response_model=VideoJobOut)
def get_video_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    job = VIDEO_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    provider = job.get("provider")
    if provider == "replicate" and job.get("status") in ("queued", "processing"):
        pred_id = job.get("provider_prediction_id")
        if pred_id:
            pred = _replicate_get_prediction(pred_id)
            status_raw = pred.get("status") or "processing"
            if status_raw in ("starting", "processing", "queued"):
                job["status"] = "processing"
            elif status_raw == "succeeded":
                job["status"] = "succeeded"
                output = pred.get("output")
                if isinstance(output, str):
                    job["video_url"] = output
                elif isinstance(output, list) and output:
                    job["video_url"] = output[0] if isinstance(output[0], str) else None
            elif status_raw == "failed":
                job["status"] = "failed"
                job["error"] = (pred.get("error") or "Provider failed").strip() if pred.get("error") else "Provider failed"

            VIDEO_JOBS[job_id] = job

    if provider == "veo3" and job.get("status") in ("queued", "processing"):
        task_id = job.get("provider_task_id")
        if task_id:
            st = _veo3_get_status(str(task_id))
            # Veo 3.1 docs: { code, message, data: { status, response: [url] } }
            data = st.get("data") if isinstance(st, dict) else None
            status_raw = None
            response_list = None
            if isinstance(data, dict):
                status_raw = data.get("status")
                response_list = data.get("response")
            status_norm = (status_raw or "PROCESSING").upper()

            if status_norm in ("QUEUED", "PENDING", "STARTING", "PROCESSING", "RUNNING"):
                job["status"] = "processing"
            elif status_norm in ("FAILED", "ERROR"):
                job["status"] = "failed"
                job["error"] = (st.get("message") or "Provider failed") if isinstance(st, dict) else "Provider failed"
            elif status_norm in ("COMPLETED", "SUCCEEDED", "SUCCESS", "DONE"):
                # The generated video URL is in data.response[]
                video_url = None
                if isinstance(response_list, list) and response_list:
                    if isinstance(response_list[0], str):
                        video_url = response_list[0]
                # Optional: get 1080p URL
                use_1080p = (os.getenv("VEO3_USE_1080P") or "").strip().lower() in ("1", "true", "yes", "y", "on")
                if use_1080p:
                    dl = _veo3_get_download(str(task_id))
                    dl_data = dl.get("data") if isinstance(dl, dict) else None
                    if isinstance(dl_data, dict) and isinstance(dl_data.get("result_url"), str):
                        video_url = dl_data.get("result_url")
                job["video_url"] = video_url
                job["status"] = "succeeded" if video_url else "failed"
                if not video_url:
                    job["error"] = "Veo3 completed but no video URL returned"
            else:
                job["status"] = "processing"

            VIDEO_JOBS[job_id] = job

    return VideoJobOut(
        job_id=job_id,
        status=job["status"],
        provider=job["provider"],
        video_url=job.get("video_url"),
        error=job.get("error"),
        created_at=job["created_at"],
    )