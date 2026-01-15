import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import requests
from urllib.parse import urlencode

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
# Gemini (prompt enhancement) helpers
# ==============================


def _gemini_api_key() -> str:
    v = os.getenv("GEMINI_API_KEY")
    if v:
        v = v.strip().strip('"').strip("'")
    if not v:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GEMINI_API_KEY is not set")
    return v


def _gemini_model() -> str:
    # Allow override via env. (User may use gemini-3-flash / gemini-2.5-flash, etc.)
    # We keep a conservative default and handle fallbacks + API-version differences in the request layer.
    v = os.getenv("GEMINI_MODEL") or "gemini-1.5-flash"
    return v.strip().strip('"').strip("'")


def _gemini_generate_prompt(idea: str, existing_prompt: Optional[str] = None) -> str:
    """
    Call Gemini via Google Generative Language API (API key auth) to expand a short idea into a full Veo-ready prompt.
    """
    idea = (idea or "").strip()
    if not idea:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Idea is required")

    base = (existing_prompt or "").strip()

    system = (
        "You are an expert story-first video prompt writer for text-to-video generation.\n"
        "Write ONE final prompt only (no lists, no headings, no quotes).\n"
        "Make it cinematic AND storytelling:\n"
        "- include a clear mini-arc (beginning → middle → ending)\n"
        "- include a main character/subject + goal + obstacle/twist + resolution\n"
        "- include setting, key actions, camera movement, lighting, mood, and pacing\n"
        "If the user references copyrighted IP (e.g., famous anime series or specific named powers), rewrite it into an original concept with the same vibe.\n"
        "Example rewrite: 'two rival fighters with distinct mystical eye powers' (describe colors/shapes) instead of named anime abilities.\n"
        "Avoid mentioning brands or copyrighted characters.\n"
        "Write in 4–6 full sentences (not fragments) with concrete visual details.\n"
        "Do NOT end mid-sentence.\n"
        "Keep it under 1200 characters.\n"
    )
    idea_lc = idea.lower()

    # If user references Naruto-like concepts, keep the vibe but rewrite to original descriptors.
    naruto_like = any(
        k in idea_lc
        for k in (
            "naruto",
            "sharingan",
            "rinnegan",
            "uchiha",
            "uzumaki",
            "akatsuki",
            "konoha",
            "hokage",
            "jutsu",
        )
    )

    user = f"Short idea: {idea}"
    if base:
        user += f"\nExisting prompt (optional context): {base}"

    if naruto_like:
        user += (
            "\n\nStyle target (important): anime-inspired shinobi duel reminiscent of classic ninja anime.\n"
            "Include: chakra aura, hand seals, high-speed taijutsu, jutsu impacts on environment, dramatic stakes, and a mini-arc.\n"
            "Rewrite any named/copyrighted terms into original descriptors.\n"
            "Eye power A (instead of named ability): scarlet spiral-pattern iris with illusion/precision techniques.\n"
            "Eye power B (instead of named ability): violet concentric-ring iris with gravity/pull/repulsion techniques.\n"
            "Avoid generic 'wizard/mage' framing—make it ninja/shinobi.\n"
        )

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": system + "\n" + user}]},
        ],
        "generationConfig": {
            "temperature": 0.7,
            # Higher limit to reduce mid-sentence truncation.
            "maxOutputTokens": 1536,
        },
    }

    def _call_gemini_generate(content_payload: dict) -> str:
        candidates = [
            _gemini_model(),
            "gemini-3-flash",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ]
        api_versions = ["v1beta", "v1"]

        use_search = (os.getenv("GEMINI_USE_GOOGLE_SEARCH") or "").strip().lower() in ("1", "true", "yes", "y", "on")

        last_resp = None
        last_model = None
        last_ver = None

        for ver in api_versions:
            for m in candidates:
                last_model = m
                last_ver = ver
                url = f"https://generativelanguage.googleapis.com/{ver}/models/{m}:generateContent"

                # Best-effort Google Search grounding (if supported by the model/account).
                payload_to_send = dict(content_payload)
                if use_search:
                    payload_to_send["tools"] = [{"google_search": {}}]

                resp = requests.post(
                    url,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": _gemini_api_key(),
                    },
                    json=payload_to_send,
                    timeout=60,
                )

                # If grounding tools are not supported, retry once without tools.
                if use_search and resp.status_code in (400, 404):
                    txt = (resp.text or "").lower()
                    if "tools" in txt or "google_search" in txt or "not supported" in txt or "not found" in txt:
                        resp = requests.post(
                            url,
                            headers={
                                "Content-Type": "application/json",
                                "x-goog-api-key": _gemini_api_key(),
                            },
                            json=content_payload,
                            timeout=60,
                        )

                last_resp = resp
                if resp.status_code < 400:
                    break
                # If model isn't found / doesn't support generateContent on this API version, try next candidate.
                if resp.status_code == 404 and (
                    "not found" in (resp.text or "").lower()
                    or "not_supported" in (resp.text or "").lower()
                    or "NOT_FOUND" in (resp.text or "")
                ):
                    continue
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gemini error ({resp.status_code}): {resp.text}")
            if last_resp and last_resp.status_code < 400:
                break

        if not last_resp or last_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini model not supported for generateContent. Last tried '{last_model}' on {last_ver}: {last_resp.text if last_resp else ''}",
            )

        data = last_resp.json() if last_resp.content else {}
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gemini response missing text: {data}")
        return (text or "").strip()

    # Google Generative Language API supports API key either via query param or x-goog-api-key header.
    # We'll use header to avoid logging the key in URLs.
    #
    # Important: some newer models appear in AI Studio but are not available on v1beta for generateContent.
    # So we try BOTH API versions (v1beta then v1) and fall back across common flash/pro models.
    out = _call_gemini_generate(payload)
    # Safety: enforce length and single-line-ish output.
    out = " ".join(out.split())

    def _needs_repair(s: str) -> bool:
        if not s:
            return True
        if s.endswith("-"):
            return True
        # ends with comma/colon/semicolon -> likely unfinished
        if s[-1] in ",:;":
            return True
        # If it doesn't end with sentence punctuation, treat as incomplete
        if s[-1] not in ".!?":
            return True
        # Too short to be "storytelling"
        if len(s) < 220:
            return True
        return False

    if _needs_repair(out):
        repair_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                "Rewrite this into ONE complete, detailed, story-driven prompt (4–6 full sentences). "
                                "Do not mention copyrighted IP names. Keep the same vibe. Do NOT end mid-word or mid-sentence:\n\n"
                                f"{out}"
                            )
                        }
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0.5,
                "maxOutputTokens": 512,
            },
        }
        repaired_out = " ".join(_call_gemini_generate(repair_payload).split())
        if repaired_out:
            out = repaired_out

    # Enforce max length without cutting mid-word/sentence.
    if len(out) > 1200:
        cut = out[:1200]
        # Prefer cutting at the last sentence end; otherwise last space.
        last_punct = max(cut.rfind("."), cut.rfind("!"), cut.rfind("?"))
        if last_punct >= 200:
            out = cut[: last_punct + 1].rstrip()
        else:
            last_space = cut.rfind(" ")
            out = (cut[:last_space] if last_space > 0 else cut).rstrip()

    if not out:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Gemini returned empty prompt")
    return out


# ==============================
# Google OAuth helpers
# ==============================


def _google_client_id() -> str:
    v = os.getenv("GOOGLE_CLIENT_ID")
    if v:
        v = v.strip().strip('"').strip("'")
    if not v:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GOOGLE_CLIENT_ID is not set")
    return v


def _google_client_secret() -> str:
    v = os.getenv("GOOGLE_CLIENT_SECRET")
    if v:
        v = v.strip().strip('"').strip("'")
    if not v:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GOOGLE_CLIENT_SECRET is not set")
    return v


def _google_redirect_uri() -> str:
    # Must match the "Authorized redirect URI" in Google Cloud Console
    v = os.getenv("GOOGLE_REDIRECT_URI") or "http://localhost:8001/auth/google/callback"
    return v.strip().strip('"').strip("'")


def _frontend_url() -> str:
    v = os.getenv("FRONTEND_URL") or "http://localhost:3000"
    return v.strip().strip('"').strip("'").rstrip("/")


def _create_oauth_state(redirect_to: str) -> str:
    """
    Signed state token to prevent CSRF and carry redirect target.
    """
    expire = datetime.utcnow() + timedelta(minutes=10)
    payload = {"type": "oauth_state", "redirect_to": redirect_to, "nonce": str(uuid4()), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _verify_oauth_state(state: str) -> dict:
    try:
        payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "oauth_state":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid oauth state")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired oauth state")


def _google_exchange_code_for_token(code: str) -> dict:
    # OAuth code exchange (server-side)
    resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": _google_client_id(),
            "client_secret": _google_client_secret(),
            "redirect_uri": _google_redirect_uri(),
            "grant_type": "authorization_code",
        },
        timeout=30,
    )
    if resp.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Google token exchange failed: {resp.text}")
    return resp.json()


def _google_get_userinfo(access_token: str) -> dict:
    resp = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=30,
    )
    if resp.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Google userinfo failed: {resp.text}")
    return resp.json()


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


class UserCoinBalance(Base):
    __tablename__ = "user_coin_balances"

    user_id = Column(Integer, primary_key=True, index=True)
    coins = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CoinTopUpTx(Base):
    __tablename__ = "coin_topup_txs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    tx_hash = Column(String, unique=True, index=True, nullable=False)
    amount_wei = Column(String, nullable=False)  # store as decimal string
    coins_added = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


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
    # Veo 3.1 API params
    model: Optional[str] = "veo3-fast"  # veo3 | veo3-fast
    aspect_ratio: Optional[str] = "16:9"  # 16:9 | 9:16 | Auto
    watermark: Optional[str] = None  # string or null

    # Back-compat for older UI fields (ignored by Veo 3.1 provider)
    duration_seconds: Optional[int] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    style: Optional[str] = None


class VideoJobOut(BaseModel):
    job_id: str
    status: str  # queued | processing | succeeded | failed
    provider: str
    video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    coins_spent: Optional[int] = None
    coins_balance: Optional[int] = None


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


def _arc_rpc_url() -> str:
    url = os.getenv("ARC_RPC_URL") or "https://rpc.testnet.arc.network"
    return url.strip().strip('"').strip("'")


def _arc_treasury_address() -> str:
    v = os.getenv("ARC_TREASURY_ADDRESS")
    if v:
        v = v.strip().strip('"').strip("'")
    if not v:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ARC_TREASURY_ADDRESS is not set")
    return v


def _coins_per_usdc() -> int:
    # Default: 1.00 USDC -> 100 coins (so 0.25 USDC -> 25 coins)
    v = os.getenv("COIN_PER_USDC") or "100"
    try:
        n = int(v.strip())
        return max(1, n)
    except Exception:
        return 100


def _rpc_call(method: str, params: list) -> Any:
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    resp = requests.post(_arc_rpc_url(), json=payload, timeout=30)
    if resp.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Arc RPC error ({resp.status_code}): {resp.text}")
    data = resp.json()
    if "error" in data:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Arc RPC error: {data['error']}")
    return data.get("result")


def _get_or_create_coin_balance(db: Session, user_id: int) -> UserCoinBalance:
    row = db.query(UserCoinBalance).filter(UserCoinBalance.user_id == user_id).first()
    if row:
        return row
    row = UserCoinBalance(user_id=user_id, coins=0)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _model_cost_coins(model: Optional[str]) -> int:
    m = (model or "veo3-fast").strip().lower()
    return 180 if m == "veo3" else 25


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
    auth_value = key if key.lower().startswith("bearer ") else f"Bearer {key}"

    # Always include Authorization so veo3api.com accepts the request,
    # even if the user configured a different header name by mistake.
    headers: Dict[str, str] = {
        "Authorization": auth_value,
        "Content-Type": "application/json",
    }

    # Optional: also send a custom header if provided (harmless for veo3api.com).
    extra_header_name = (os.getenv("VEO3_AUTH_HEADER_NAME") or "").strip()
    if extra_header_name and extra_header_name.lower() != "authorization":
        headers[extra_header_name] = key

    return headers


def _veo3_create_task(prompt: str, model: str, aspect_ratio: Optional[str], watermark: Optional[str]) -> Dict[str, Any]:
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
    payload: Dict[str, Any] = {"prompt": prompt, "model": model}

    if aspect_ratio and aspect_ratio.strip():
        payload["aspect_ratio"] = aspect_ratio.strip()

    # If watermark is passed as "null" string, translate to JSON null
    if watermark is not None:
        if isinstance(watermark, str):
            wm = watermark.strip()
            if wm != "":
                payload["watermark"] = None if wm.lower() == "null" else wm
        else:
            payload["watermark"] = watermark

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


@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/auth/google/login")
def google_login(request: Request, redirect_to: Optional[str] = None):
    """
    Start Google OAuth by redirecting the user to Google's consent screen.
    """
    target = redirect_to or f"{_frontend_url()}/auth/google"
    state = _create_oauth_state(target)

    params = {
        "client_id": _google_client_id(),
        "redirect_uri": _google_redirect_uri(),
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state,
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url=url, status_code=302)


@app.get("/auth/google/callback")
def google_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback, upsert user, issue JWT, then redirect back to frontend.
    """
    # If user cancels or Google returns an error
    if error:
        target = f"{_frontend_url()}/auth/google?error={error}"
        return RedirectResponse(url=target, status_code=302)

    if not code or not state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing code/state")

    st = _verify_oauth_state(state)
    redirect_to = st.get("redirect_to") or f"{_frontend_url()}/auth/google"

    token_data = _google_exchange_code_for_token(code)
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Google token missing access_token: {token_data}")

    info = _google_get_userinfo(access_token)
    email = info.get("email")
    full_name = info.get("name") or info.get("given_name")
    if not email:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Google userinfo missing email: {info}")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user with a random password (so schema stays consistent).
        # If you want to allow password login later, user can use reset-password.
        random_pw = str(uuid4())
        user = User(email=email, full_name=full_name, hashed_password=hash_password(random_pw))
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Keep name in sync if it was empty
        if full_name and not user.full_name:
            user.full_name = full_name
            db.add(user)
            db.commit()
            db.refresh(user)

    jwt_token = create_access_token(data={"sub": str(user.id)})

    # Send token to frontend callback page (hackathon-friendly)
    sep = "&" if "?" in redirect_to else "?"
    return RedirectResponse(url=f"{redirect_to}{sep}token={jwt_token}", status_code=302)


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
# AI endpoints (Gemini)
# ==============================


class EnhancePromptRequest(BaseModel):
    idea: str
    existing_prompt: Optional[str] = None


class EnhancePromptResponse(BaseModel):
    prompt: str
    model: str


@app.post("/ai/enhance-prompt", response_model=EnhancePromptResponse)
def enhance_prompt(body: EnhancePromptRequest, current_user: User = Depends(get_current_user)):
    prompt = _gemini_generate_prompt(body.idea, existing_prompt=body.existing_prompt)
    return {"prompt": prompt, "model": _gemini_model()}


# ==============================
# Coins (Top Up -> Spend)
# ==============================


class CoinBalanceOut(BaseModel):
    coins: int


class ClaimTopUpRequest(BaseModel):
    tx_hash: str


class ClaimTopUpResponse(BaseModel):
    coins: int
    coins_added: int
    tx_hash: str


@app.get("/coins/balance", response_model=CoinBalanceOut)
def get_coin_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bal = _get_or_create_coin_balance(db, current_user.id)
    return {"coins": int(bal.coins or 0)}


@app.post("/coins/topup/claim", response_model=ClaimTopUpResponse)
def claim_topup(body: ClaimTopUpRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx_hash = (body.tx_hash or "").strip()
    if not tx_hash or not tx_hash.startswith("0x"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tx_hash is required")

    # Prevent double-claim globally
    existing = db.query(CoinTopUpTx).filter(CoinTopUpTx.tx_hash == tx_hash).first()
    if existing:
        bal = _get_or_create_coin_balance(db, current_user.id)
        return {"coins": int(bal.coins or 0), "coins_added": 0, "tx_hash": tx_hash}

    tx = _rpc_call("eth_getTransactionByHash", [tx_hash])
    if not isinstance(tx, dict):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction not found")

    receipt = _rpc_call("eth_getTransactionReceipt", [tx_hash])
    if not isinstance(receipt, dict) or str(receipt.get("status", "")).lower() != "0x1":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction not confirmed/successful yet")

    to_addr = (tx.get("to") or "").lower()
    treasury = _arc_treasury_address().lower()
    if not to_addr or to_addr != treasury:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction recipient is not treasury")

    value_hex = tx.get("value") or "0x0"
    try:
        value_wei = int(value_hex, 16)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tx value")

    if value_wei <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Top up amount must be > 0")

    # coins_added = floor(value_wei * coins_per_usdc / 1e18)
    coins_added = (value_wei * _coins_per_usdc()) // 10**18
    if coins_added <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Top up amount too small")

    bal = _get_or_create_coin_balance(db, current_user.id)
    bal.coins = int(bal.coins or 0) + int(coins_added)
    db.add(bal)
    db.add(
        CoinTopUpTx(
            user_id=current_user.id,
            tx_hash=tx_hash,
            amount_wei=str(value_wei),
            coins_added=int(coins_added),
        )
    )
    db.commit()
    db.refresh(bal)
    return {"coins": int(bal.coins or 0), "coins_added": int(coins_added), "tx_hash": tx_hash}


# ==============================
# Video generation endpoints
# ==============================


@app.post("/video/text-to-video", response_model=VideoJobOut)
def create_text_to_video_job(
    body: TextToVideoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    # Spend coins for generation
    cost_coins = _model_cost_coins(body.model)
    bal = _get_or_create_coin_balance(db, current_user.id)
    if int(bal.coins or 0) < int(cost_coins):
        raise HTTPException(status_code=402, detail=f"Insufficient coins. Need {cost_coins} coins.")
    bal.coins = int(bal.coins or 0) - int(cost_coins)
    db.add(bal)
    db.commit()
    db.refresh(bal)

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
        task = _veo3_create_task(
            body.prompt.strip(),
            model=(body.model or "veo3-fast"),
            aspect_ratio=body.aspect_ratio,
            watermark=body.watermark,
        )
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
        coins_spent=int(cost_coins),
        coins_balance=int(bal.coins or 0),
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