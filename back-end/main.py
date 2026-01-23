import os
import base64
import io
import tempfile
import secrets
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import uuid4

try:
    from PIL import Image
    PIL_AVAILABLE = True
    print("[Sora2] PIL/Pillow is available. Image resizing enabled.")
except ImportError:
    PIL_AVAILABLE = False
    print("[Sora2] WARNING: PIL/Pillow not available. Image resizing will be skipped.")
    print("[Sora2] Please install Pillow: pip install Pillow>=10.0.0")

from fastapi import FastAPI, Depends, HTTPException, status, Request, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, Text, func
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import bcrypt
from jose import JWTError, jwt
import requests
from urllib.parse import urlencode
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
# Import database configuration first
from database import get_db, engine, Base, init_db

# Import all models - this registers them with Base.metadata
# IMPORTANT: Models must be imported before init_db() is called
from models import User, UserCoinBalance, CoinTopUpTx, StoredVideo

# Verify models are registered
print(f"[MAIN] Models imported. Base.metadata.tables: {list(Base.metadata.tables.keys())}")

# Note: init_db() will be called in FastAPI startup event
# But also call it here as fallback to ensure tables are created
# This is safe - create_all() won't recreate existing tables
try:
    print("[MAIN] Attempting to initialize database tables...")
    init_db()
    print("[MAIN] Database tables initialized (module level)")
except Exception as e:
    print(f"[MAIN] WARNING: Database init at module level failed (will retry in startup): {e}")
    # Don't raise - startup event will retry


# ==============================
# Security configuration
# ==============================

# Using pure bcrypt with SHA-256 pre-hashing for maximum reliability

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_ME_TO_A_RANDOM_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
RESET_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    """
    Hash password dengan pure bcrypt untuk maximum reliability.
    SHA-256 dulu, lalu bcrypt - menghindari 72-byte limit sepenuhnya.
    """
    # Always hash with SHA-256 first (produces 64 chars, safe for bcrypt)
    sha256_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

    # Use pure bcrypt for maximum reliability
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(sha256_hash.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password dengan pure bcrypt.
    """
    try:
        # Hash plain password with SHA-256 first, then verify with bcrypt
        sha256_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
        return bcrypt.checkpw(sha256_hash.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


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


def generate_reset_code() -> str:
    """Generate a 6-digit numeric reset code"""
    import random
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])


def send_reset_code_email(to_email: str, reset_code: str):
    """
    Send reset code via email.
    Supports multiple email services for development and production.
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    # Try different email configurations
    email_configs = []

    # 1. Check for Mailtrap API
    mailtrap_api_token = os.getenv("MAILTRAP_API_TOKEN")
    if mailtrap_api_token:
        email_configs.append({
            'type': 'mailtrap',
            'api_token': mailtrap_api_token,
            'from_email': os.getenv("FROM_EMAIL", "noreply@primestudio.ai")
        })

    # 2. Check for SendGrid API
    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    if sendgrid_key:
        email_configs.append({
            'type': 'sendgrid',
            'api_key': sendgrid_key,
            'from_email': os.getenv("FROM_EMAIL", "noreply@primestudio.ai")
        })

    # 3. Check for SMTP configuration (works with Mailtrap SMTP too)
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if smtp_server and smtp_username and smtp_password:
        email_configs.append({
            'type': 'smtp',
            'server': smtp_server,
            'port': int(smtp_port),
            'username': smtp_username,
            'password': smtp_password,
            'from_email': os.getenv("FROM_EMAIL", smtp_username)
        })

    # 4. Fallback: Console logging for development
    if not email_configs:
        print(f"[EMAIL] No email configuration found. Reset code for {to_email}: {reset_code}")
        print(f"[EMAIL] To enable email sending, configure one of:")
        print(f"[EMAIL] 1. Mailtrap: Set MAILTRAP_API_TOKEN and FROM_EMAIL in .env")
        print(f"[EMAIL] 2. SendGrid: Set SENDGRID_API_KEY and FROM_EMAIL in .env")
        print(f"[EMAIL] 3. SMTP: Set SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD in .env")
        return

    # Try each email configuration
    for config in email_configs:
        try:
            if config['type'] == 'mailtrap':
                send_via_mailtrap(config, to_email, reset_code)
                print(f"[EMAIL] Reset code sent via Mailtrap to {to_email}")
                return

            elif config['type'] == 'sendgrid':
                send_via_sendgrid(config, to_email, reset_code)
                print(f"[EMAIL] Reset code sent via SendGrid to {to_email}")
                return

            elif config['type'] == 'smtp':
                send_via_smtp(config, to_email, reset_code)
                print(f"[EMAIL] Reset code sent via SMTP to {to_email}")
                return

        except Exception as e:
            print(f"[EMAIL] Failed to send via {config['type']}: {e}")
            continue

    # If all methods fail, fall back to console
    print(f"[EMAIL] All email methods failed. Reset code for {to_email}: {reset_code}")


def send_via_mailtrap(config: dict, to_email: str, reset_code: str):
    """Send email via Mailtrap API"""
    import requests

    # Mailtrap API endpoint - sesuai dokumentasi
    url = "https://sandbox.api.mailtrap.io/api/send"

    headers = {
        "Authorization": f"Bearer {config['api_token']}",
        "Content-Type": "application/json"
    }

    data = {
        "to": [{"email": to_email}],
        "from": {"email": config['from_email'], "name": "PrimeStudio"},
        "subject": "PrimeStudio Password Reset Code",
        "text": f"""Hello,

Your password reset code is: {reset_code}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
PrimeStudio Team
""",
        "category": "password-reset"
    }

    response = requests.post(url, headers=headers, json=data, timeout=30)
    response.raise_for_status()


def send_via_sendgrid(config: dict, to_email: str, reset_code: str):
    """Send email via SendGrid API"""
    import requests

    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "Content-Type": "application/json"
    }

    data = {
        "personalizations": [{
            "to": [{"email": to_email}],
            "subject": "PrimeStudio Password Reset Code"
        }],
        "from": {"email": config['from_email']},
        "content": [{
            "type": "text/plain",
            "value": f"Your password reset code is: {reset_code}\n\nThis code will expire in 15 minutes."
        }]
    }

    response = requests.post(url, headers=headers, json=data, timeout=30)
    response.raise_for_status()


def send_via_smtp(config: dict, to_email: str, reset_code: str):
    """Send email via SMTP"""
    msg = MIMEMultipart()
    msg['From'] = config['from_email']
    msg['To'] = to_email
    msg['Subject'] = "PrimeStudio Password Reset Code"

    body = f"""
Hello,

Your password reset code is: {reset_code}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
PrimeStudio Team
    """

    msg.attach(MIMEText(body, 'plain'))

    server = smtplib.SMTP(config['server'], config['port'])
    server.starttls()
    server.login(config['username'], config['password'])
    text = msg.as_string()
    server.sendmail(config['from_email'], to_email, text)
    server.quit()


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
    # Use GOOGLE_REDIRECT_URI if set, otherwise build from BACKEND_URL
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        # Build from BACKEND_URL (for Railway production)
        backend_url = os.getenv("BACKEND_URL") or "http://localhost:8001"
        redirect_uri = f"{backend_url.rstrip('/')}/auth/google/callback"
    return redirect_uri.strip().strip('"').strip("'")


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
# Models are now imported from models.py
# Database tables are auto-created by database.py on import


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


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordWithCodeRequest(BaseModel):
    email: EmailStr
    code: str
    password: str


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

    # Optional override: allow frontend to choose provider per request
    provider: Optional[str] = None  # mock | replicate | veo3 | sora2 | kling

    # Back-compat for older UI fields (ignored by Veo 3.1 provider)
    duration_seconds: Optional[int] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    style: Optional[str] = None

    # Sora2API-specific optional fields
    quality: Optional[str] = None  # standard | hd
    image_urls: Optional[List[str]] = None
    callback_url: Optional[str] = None


class VideoJobOut(BaseModel):
    job_id: str
    status: str  # queued | processing | succeeded | failed
    provider: str
    video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    coins_spent: Optional[int] = None
    coins_balance: Optional[int] = None


# ==============================
# Image generation schemas
# ==============================


class TextToImageRequest(BaseModel):
    prompt: str
    model: Optional[str] = "kling-v1"  # kling-v1, kling-v1-5, kling-v2-1, kling-v2, kling-image-o1
    aspect_ratio: Optional[str] = "1:1"  # 1:1, 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9


class ImageToImageRequest(BaseModel):
    prompt: str
    image_url: str
    image_url2: Optional[str] = None  # Second image for multi-image mode
    model: Optional[str] = "kling-v1"  # kling-v1, kling-v1-5, kling-v2, kling-v2-new
    mode: Optional[str] = "entire-image"  # entire-image, subject, face, restyle, multi-image
    aspect_ratio: Optional[str] = None  # Some modes don't support aspect ratio


class ImageJobOut(BaseModel):
    job_id: str
    status: str  # queued | processing | succeeded | failed
    provider: str
    image_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    coins_spent: Optional[int] = None
    coins_balance: Optional[int] = None


# In-memory job store (OK for hackathon / single-instance dev)
VIDEO_JOBS: Dict[str, Dict[str, Any]] = {}
IMAGE_JOBS: Dict[str, Dict[str, Any]] = {}


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """
    Validate JWT access token and return the User record.
    Frontend should send: Authorization: Bearer <token>
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user ID")
        user_id = int(sub)
    except JWTError as e:
        # More specific error messages for debugging
        error_msg = str(e)
        if "expired" in error_msg.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired. Please login again.")
        elif "invalid" in error_msg.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token. Please login again.")
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token validation failed: {error_msg}")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: user ID format error")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_user_from_token(token: str, db: Session) -> User:
    """
    Helper function to validate token and return user.
    Used for token validation from query parameters.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user ID")
        user_id = int(sub)
    except JWTError as e:
        error_msg = str(e)
        if "expired" in error_msg.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired. Please login again.")
        elif "invalid" in error_msg.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token. Please login again.")
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token validation failed: {error_msg}")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: user ID format error")

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


def _refund_generation_coins(db: Session, user_id: int, coins: int) -> int:
    """
    Best-effort refund of spent coins (used when a provider fails).
    Returns the updated balance.
    """
    bal = _get_or_create_coin_balance(db, user_id)
    bal.coins = int(bal.coins or 0) + int(max(0, int(coins)))
    db.add(bal)
    db.commit()
    db.refresh(bal)
    return int(bal.coins or 0)


def _model_cost_coins(model: Optional[str]) -> int:
    m = (model or "veo3-fast").strip().lower()
    # Pricing buckets:
    # - High quality models: 180 coins (e.g. veo3 HQ, sora-2-pro)
    # - Default/fast models: 25 coins
    return 180 if m in ("veo3", "sora-2-pro", "sora2-pro", "sora_pro") else 25


def _image_model_cost_coins(model: Optional[str]) -> int:
    """
    Calculate coin cost for image generation based on model.
    Pricing:
    - kling-image-o1: 1 coin
    - kling-v1: 2 coins
    - kling-v1-5: 3 coins
    - kling-v2: 5 coins
    - kling-v2-1: 6 coins
    - Default: 2 coins
    """
    m = (model or "kling-v1").strip().lower()
    if m == "kling-image-o1" or m == "kling-imageo1":
        return 1
    elif m == "kling-v1":
        return 2
    elif m == "kling-v1-5" or m == "kling-v1.5":
        return 3
    elif m == "kling-v2":
        return 5
    elif m == "kling-v2-1" or m == "kling-v2.1":
        return 6
    else:
        return 2  # Default to 2 coins


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
# Sora 2 provider helpers (configurable endpoints)
# ==============================


def _sora2_base_url() -> str:
    # OpenAI Sora 2 API base URL
    v = os.getenv("SORA2_BASE_URL") or "https://api.openai.com"
    return v.strip().strip('"').strip("'").rstrip("/")


def _sora2_api_key() -> str:
    # OpenAI API key (can also use OPENAI_API_KEY env var)
    v = os.getenv("SORA2_API_KEY") or os.getenv("OPENAI_API_KEY")
    if v:
        v = v.strip().strip('"').strip("'")
    if not v:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="SORA2_API_KEY or OPENAI_API_KEY is not set")
    return v


def _sora2_headers() -> Dict[str, str]:
    """
    OpenAI API headers with Bearer authentication.
    Supports optional organization and project headers.
    """
    key = _sora2_api_key()
    headers = {
        "Authorization": f"Bearer {key}",
    }
    
    # Optional: Organization ID (if using multiple organizations)
    org_id = os.getenv("OPENAI_ORGANIZATION_ID") or os.getenv("SORA2_ORGANIZATION_ID")
    if org_id:
        org_id = org_id.strip().strip('"').strip("'")
        if org_id:
            headers["OpenAI-Organization"] = org_id
    
    # Optional: Project ID (if using projects)
    project_id = os.getenv("OPENAI_PROJECT_ID") or os.getenv("SORA2_PROJECT_ID")
    if project_id:
        project_id = project_id.strip().strip('"').strip("'")
        if project_id:
            headers["OpenAI-Project"] = project_id
    
    return headers


def _sora2_create_path() -> str:
    # OpenAI Sora 2 endpoint
    return (os.getenv("SORA2_CREATE_PATH") or "/v1/videos").strip()


def _sora2_status_path() -> str:
    # OpenAI Sora 2 status endpoint (will be combined with video_id)
    return (os.getenv("SORA2_STATUS_PATH") or "/v1/videos").strip()


def _sora2_download_path() -> str:
    # OpenAI Sora 2 download endpoint (will be combined with video_id)
    return (os.getenv("SORA2_DOWNLOAD_PATH") or "/v1/videos").strip()


def _sora2_parse_id(data: Any) -> Optional[str]:
    # OpenAI response format: { "id": "video_123", ... }
    if isinstance(data, dict):
        v = data.get("id")
        if isinstance(v, str) and v.strip():
            return v.strip()
    return None


def _sora2_parse_status(data: Any) -> Optional[str]:
    # OpenAI response format: { "status": "queued|processing|completed|failed", ... }
    if isinstance(data, dict):
        status = data.get("status")
        if isinstance(status, str):
            status_lower = status.lower()
            if status_lower in ("completed", "succeeded", "success", "done"):
                return "succeeded"
            if status_lower == "failed":
                return "failed"
            if status_lower in ("queued", "processing", "in_progress"):
                return "processing"
    return None


def _sora2_parse_video_url(data: Any) -> Optional[str]:
    # OpenAI doesn't return video URL directly in status response
    # Video content must be downloaded from /v1/videos/{id}/content endpoint
    # This function will return None, and we'll use _sora2_get_download() instead
    # For now, we can construct a download URL if needed
    if isinstance(data, dict):
        video_id = data.get("id")
        if isinstance(video_id, str) and video_id.strip():
            # Return a placeholder that indicates we need to download
            # The actual download will be handled by _sora2_get_download()
            return f"openai://{video_id}"
    return None


def _sora2_assert_ok(data: Any) -> None:
    """
    OpenAI API uses standard HTTP status codes, so we don't need special handling here.
    This function is kept for compatibility but does nothing for OpenAI.
    """
    pass


def _sora2_create_task(
    prompt: str,
    aspect_ratio: str,
    quality: str,
    image_urls: Optional[List[str]],
    watermark: Optional[str],
    callback_url: Optional[str],
    duration_seconds: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Create OpenAI Sora 2 video generation task.
    Uses form-data format as per OpenAI API documentation.
    """
    # Map aspect_ratio to OpenAI size format
    # OpenAI sizes: 720x1280, 1280x720, 1024x1792, 1792x1024
    size_mapping = {
        "landscape": "1280x720",
        "portrait": "720x1280",
        "16:9": "1280x720",
        "9:16": "720x1280",
    }
    size = size_mapping.get(aspect_ratio.lower(), "720x1280")
    
    # Parse width and height from size string (e.g., "1280x720")
    target_width, target_height = map(int, size.split('x'))
    
    # Map quality to model (sora-2 or sora-2-pro)
    model = "sora-2-pro" if quality.lower() == "hd" else "sora-2"
    
    # Map duration (default 4, allowed: 4, 8, 12)
    if duration_seconds:
        # Validate and map duration
        if duration_seconds in [4, 8, 12]:
            seconds = str(duration_seconds)
        elif duration_seconds <= 4:
            seconds = "4"
        elif duration_seconds <= 8:
            seconds = "8"
        else:
            seconds = "12"
    else:
        seconds = "4"  # Default per OpenAI docs
    
    url = f"{_sora2_base_url()}{_sora2_create_path()}"
    headers = _sora2_headers()
    
    # Add request ID for debugging (optional but recommended by OpenAI)
    request_id = str(uuid4())
    headers["X-Client-Request-Id"] = request_id
    
    # Handle input_reference (image file) if image_urls provided
    image_file = None
    temp_file_path = None
    
    if image_urls and len(image_urls) > 0:
        image_url = image_urls[0]  # Use first image
        
        try:
            image_data = None
            original_format = 'PNG'
            
            # Check if it's a base64 data URL
            if image_url.startswith('data:image/'):
                # Extract base64 data
                # Format: data:image/png;base64,<base64_data>
                header, encoded = image_url.split(',', 1)
                image_data = base64.b64decode(encoded)
                
                # Determine file extension from MIME type
                mime_type = header.split(';')[0].split('/')[1] if '/' in header else 'png'
                ext_map = {
                    'png': ('.png', 'PNG'),
                    'jpeg': ('.jpg', 'JPEG'),
                    'jpg': ('.jpg', 'JPEG'),
                    'gif': ('.gif', 'GIF'),
                    'webp': ('.webp', 'WEBP')
                }
                suffix, original_format = ext_map.get(mime_type.lower(), ('.png', 'PNG'))
                    
            elif image_url.startswith('http://') or image_url.startswith('https://'):
                # Download image from URL
                img_resp = requests.get(image_url, timeout=30)
                img_resp.raise_for_status()
                image_data = img_resp.content
                # Try to detect format from Content-Type or file extension
                content_type = img_resp.headers.get('Content-Type', '')
                if 'jpeg' in content_type or 'jpg' in content_type:
                    original_format = 'JPEG'
                elif 'png' in content_type:
                    original_format = 'PNG'
                elif 'webp' in content_type:
                    original_format = 'WEBP'
                suffix = '.png'
            else:
                # Assume it's a file path (for local development)
                if os.path.exists(image_url):
                    with open(image_url, 'rb') as f:
                        image_data = f.read()
                    # Detect format from file extension
                    ext = os.path.splitext(image_url)[1].lower()
                    if ext in ['.jpg', '.jpeg']:
                        original_format = 'JPEG'
                    elif ext == '.png':
                        original_format = 'PNG'
                    elif ext == '.webp':
                        original_format = 'WEBP'
                    suffix = ext or '.png'
            
            # Resize image to match target size if PIL is available
            if image_data:
                if PIL_AVAILABLE:
                    try:
                        # Open image from bytes
                        img = Image.open(io.BytesIO(image_data))
                        
                        # Resize image to match target dimensions exactly
                        # OpenAI requires exact dimensions matching the video size
                        original_size = img.size
                        print(f"[Sora2] Original image size: {original_size[0]}x{original_size[1]}, target: {target_width}x{target_height}")
                        
                        # Only resize if dimensions don't match
                        if original_size != (target_width, target_height):
                            img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
                            
                            # Save resized image to bytes
                            output = io.BytesIO()
                            # Use PNG format for better compatibility
                            img_resized.save(output, format='PNG')
                            image_data = output.getvalue()
                            original_format = 'PNG'
                            suffix = '.png'
                            print(f"[Sora2] Image successfully resized to {target_width}x{target_height}")
                        else:
                            print(f"[Sora2] Image already matches target size {target_width}x{target_height}, no resize needed")
                    except Exception as resize_error:
                        print(f"[Sora2] Error: Failed to resize image: {resize_error}")
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Failed to process image for video generation. Image must be {target_width}x{target_height} pixels. Error: {str(resize_error)}"
                        )
                else:
                    # PIL not available, warn user that image must match size
                    print(f"[Sora2] Warning: PIL not available. Image must be exactly {target_width}x{target_height} pixels.")
                    # We'll still try to upload, but OpenAI will reject if size doesn't match
            
            # Create temporary file with processed image
            if image_data:
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                    tmp_file.write(image_data)
                    temp_file_path = tmp_file.name
                    image_file = open(temp_file_path, 'rb')
                    
        except Exception as e:
            print(f"[Sora2] Error processing image: {e}")
            # Continue without image if processing fails
            if image_file:
                image_file.close()
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            image_file = None
    
    # If we have an image file, use multipart/form-data
    if image_file:
        try:
            # Verify image dimensions before upload (if PIL available)
            if PIL_AVAILABLE and temp_file_path:
                try:
                    # Re-open and verify dimensions
                    verify_img = Image.open(temp_file_path)
                    actual_size = verify_img.size
                    verify_img.close()
                    print(f"[Sora2] Verifying image before upload: {actual_size[0]}x{actual_size[1]}, expected: {target_width}x{target_height}")
                    if actual_size != (target_width, target_height):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Image dimensions mismatch. Image is {actual_size[0]}x{actual_size[1]} but must be {target_width}x{target_height} pixels. Please ensure PIL/Pillow is installed and image resizing is working."
                        )
                except HTTPException:
                    raise
                except Exception as verify_error:
                    print(f"[Sora2] Warning: Error verifying image dimensions: {verify_error}")
                    # Continue anyway, let OpenAI reject if wrong
            
            # Determine MIME type from file extension
            if temp_file_path:
                ext = os.path.splitext(temp_file_path)[1].lower()
                mime_map = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp'
                }
                mime_type = mime_map.get(ext, 'image/png')
                filename = f'image{ext}'
            else:
                mime_type = 'image/png'
                filename = 'image.png'
            
            print(f"[Sora2] Uploading image file: {filename}, MIME: {mime_type}, target size: {target_width}x{target_height}")
            
            # Prepare multipart form data
            files = {
                'input_reference': (filename, image_file, mime_type)
            }
            
            data = {
                "prompt": prompt,
                "model": model,
                "seconds": seconds,
                "size": size,
            }
            
            # Remove Content-Type header to let requests set it with boundary
            headers.pop("Content-Type", None)
            
            # Make the request with multipart/form-data
            resp = requests.post(url, headers=headers, data=data, files=files, timeout=90)
            
        except Exception as e:
            print(f"[Sora2] Error uploading image to OpenAI: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to upload image to OpenAI Sora 2: {str(e)}"
            )
        finally:
            # Clean up
            try:
                image_file.close()
            except:
                pass
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
    else:
        # No image, use JSON payload
        headers["Content-Type"] = "application/json"
        
        json_payload = {
            "prompt": prompt,
            "model": model,
            "seconds": seconds,
            "size": size,
        }
        
        # Make the request with JSON payload
        resp = requests.post(url, headers=headers, json=json_payload, timeout=90)
    
    # Handle response (same for both JSON and multipart)
    if resp.status_code in (401, 403):
        raise HTTPException(status_code=resp.status_code, detail=f"OpenAI Sora 2 unauthorized: {resp.text}")
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("error", {}).get("message", resp.text) if isinstance(error_data.get("error"), dict) else resp.text
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"OpenAI Sora 2 error ({resp.status_code}): {error_msg}")
    
    data = resp.json() if resp.content else {}
    return data


def _sora2_get_status(task_id: str) -> Dict[str, Any]:
    """
    Get OpenAI Sora 2 video job status.
    Endpoint: GET /v1/videos/{video_id}
    """
    path = _sora2_status_path()
    url = f"{_sora2_base_url()}{path}/{task_id}"
    headers = _sora2_headers()
    
    # Add request ID for debugging
    request_id = str(uuid4())
    headers["X-Client-Request-Id"] = request_id
    
    resp = requests.get(url, headers=headers, timeout=60)
    if resp.status_code in (401, 403):
        request_id = resp.headers.get("x-request-id", "unknown")
        raise HTTPException(
            status_code=resp.status_code, 
            detail=f"OpenAI Sora 2 unauthorized: {resp.text} (Request ID: {request_id})"
        )
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("error", {}).get("message", resp.text) if isinstance(error_data.get("error"), dict) else resp.text
        request_id = resp.headers.get("x-request-id", "unknown")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail=f"OpenAI Sora 2 error ({resp.status_code}): {error_msg} (Request ID: {request_id})"
        )
    data = resp.json() if resp.content else {}
    return data


def _sora2_get_download(task_id: str) -> Optional[str]:
    """
    Get OpenAI Sora 2 video download URL.
    Endpoint: GET /v1/videos/{video_id}/content
    Returns a URL that can be used to download the video.
    For OpenAI, the content endpoint returns binary video data.
    We'll return the direct endpoint URL that frontend can use with Authorization header.
    """
    # Return the OpenAI content endpoint URL
    # Frontend will need to call this with Authorization header
    # Or we can create a proxy endpoint in our backend
    return f"{_sora2_base_url()}/v1/videos/{task_id}/content"


def _sora2_list_videos(limit: Optional[int] = None, after: Optional[str] = None, order: Optional[str] = None) -> Dict[str, Any]:
    """
    List recently generated videos from OpenAI.
    Endpoint: GET /v1/videos
    """
    url = f"{_sora2_base_url()}/v1/videos"
    headers = _sora2_headers()
    
    # Add request ID for debugging
    request_id = str(uuid4())
    headers["X-Client-Request-Id"] = request_id
    
    # Build query parameters
    params = {}
    if limit is not None:
        params["limit"] = limit
    if after:
        params["after"] = after
    if order:
        params["order"] = order
    
    resp = requests.get(url, headers=headers, params=params, timeout=60)
    if resp.status_code in (401, 403):
        request_id = resp.headers.get("x-request-id", "unknown")
        raise HTTPException(
            status_code=resp.status_code, 
            detail=f"OpenAI Sora 2 unauthorized: {resp.text} (Request ID: {request_id})"
        )
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("error", {}).get("message", resp.text) if isinstance(error_data.get("error"), dict) else resp.text
        request_id = resp.headers.get("x-request-id", "unknown")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail=f"OpenAI Sora 2 error ({resp.status_code}): {error_msg} (Request ID: {request_id})"
        )
    
    data = resp.json() if resp.content else {}
    return data


def _sora2_retrieve_video(video_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific video from OpenAI.
    Endpoint: GET /v1/videos/{video_id}
    This is the same as _sora2_get_status but with a clearer name for retrieval.
    """
    return _sora2_get_status(video_id)


# ==============================
# Kling AI provider helpers
# ==============================


def _kling_base_url() -> str:
    """
    Kling AI provider base URL.
    Default to useapi.net, can be overridden via env (e.g., cometapi.com).
    """
    base = os.getenv("KLING_BASE_URL") or "https://api.useapi.net"
    base = base.strip().rstrip("/")
    
    # Validate that base URL is not a placeholder
    if "your-kling-provider" in base.lower() or "example.com" in base.lower() or "placeholder" in base.lower():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KLING_BASE_URL is not configured. Current value: '{base}'. Please set KLING_BASE_URL in your .env file to your actual Kling AI provider's base URL (e.g., https://api.useapi.net or your provider's URL).",
        )
    
    return base


def _kling_api_key() -> str:
    """
    Get Kling AI API key or generate JWT token from Access Key and Secret Key.
    Kling AI uses JWT authentication with Access Key (AK) and Secret Key (SK).
    """
    # Try to get pre-generated JWT token first
    jwt_token = os.getenv("KLING_JWT_TOKEN")
    if jwt_token:
        jwt_token = jwt_token.strip().strip('"').strip("'")
        if jwt_token:
            return jwt_token
    
    # If JWT token not provided, try to generate from Access Key and Secret Key
    access_key = os.getenv("KLING_ACCESS_KEY")
    secret_key = os.getenv("KLING_SECRET_KEY")
    
    if access_key and secret_key:
        access_key = access_key.strip().strip('"').strip("'")
        secret_key = secret_key.strip().strip('"').strip("'")
        
        if access_key and secret_key:
            # Generate JWT token using jose library (already imported)
            try:
                import time
                
                payload = {
                    "iss": access_key,  # Access Key as issuer
                    "exp": int(time.time()) + 1800,  # Expires in 30 minutes
                    "nbf": int(time.time()) - 5  # Not before (5 seconds ago)
                }
                # Use jose.jwt which is already imported
                token = jwt.encode(payload, secret_key, algorithm="HS256")
                return token
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to generate JWT token: {str(e)}. Make sure KLING_ACCESS_KEY and KLING_SECRET_KEY are set correctly.",
                )
    
    # Fallback: try KLING_API_KEY (might be a pre-generated JWT)
    api_key = os.getenv("KLING_API_KEY")
    if api_key:
        api_key = api_key.strip().strip('"').strip("'")
        if api_key:
            return api_key
    
    # No valid key found
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Kling AI authentication not configured. Set either KLING_ACCESS_KEY + KLING_SECRET_KEY, or KLING_JWT_TOKEN, or KLING_API_KEY (pre-generated JWT) in your .env file.",
    )


def _kling_headers() -> Dict[str, str]:
    """
    Kling AI API headers.
    Uses Authorization: Bearer <jwt_token> format.
    JWT token is generated from Access Key and Secret Key, or provided directly.
    """
    token = _kling_api_key()
    
    # Ensure token is not empty
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Kling AI authentication token is empty or invalid",
        )
    
    # Clean the token
    token = token.strip().strip('"').strip("'")
    
    # Remove Bearer prefix if present (we'll add it)
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    
    # Optional: Allow custom auth header name and scheme via env vars
    header_name = os.getenv("KLING_AUTH_HEADER_NAME", "Authorization").strip()
    auth_scheme = os.getenv("KLING_AUTH_SCHEME", "Bearer").strip()
    
    # Build auth value
    if auth_scheme:
        auth_value = f"{auth_scheme} {token}"
    else:
        auth_value = f"Bearer {token}"
    
    headers = {
        header_name: auth_value,
        "Content-Type": "application/json",
    }
    
    return headers


def _kling_model_version() -> str:
    """
    Kling AI model version.
    Options: kling-v1, kling-v1-6, kling-v2-master, kling-v2-1-master, kling-v2-5-turbo, kling-v2-6
    Default: kling-v1
    """
    v = os.getenv("KLING_MODEL_VERSION") or "kling-v1"
    return v.strip().lower()


def _kling_create_task(
    prompt: str,
    model: Optional[str] = None,
    image_url: Optional[str] = None,
    duration: Optional[int] = 5,
    negative_prompt: Optional[str] = None,
    cfg_scale: Optional[float] = None,
    aspect_ratio: Optional[str] = None,
    mode: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a Kling AI text-to-video task.
    
    Official API Documentation:
    - Endpoint: POST /v1/videos/text2video
    - Model names: kling-v1, kling-v1-6, kling-v2-master, kling-v2-1-master, kling-v2-5-turbo, kling-v2-6
    
    Supports:
    - Text to Video
    - Image to Video (via image_url parameter)
    
    Model versions:
    - kling-v1 (default)
    - kling-v1-6
    - kling-v2-master
    - kling-v2-1-master
    - kling-v2-5-turbo
    - kling-v2-6
    """
    # Normalize model name to official format
    model_name = (model or _kling_model_version()).strip().lower()
    
    # Map our model format to official format
    model_mapping = {
        "v1-0": "kling-v1",
        "v1.0": "kling-v1",
        "v1-5": "kling-v1-6",  # Closest match
        "v1.5": "kling-v1-6",
        "v1-6": "kling-v1-6",
        "v1.6": "kling-v1-6",
        "v2-0": "kling-v2-master",
        "v2.0": "kling-v2-master",
        "v2-1": "kling-v2-1-master",
        "v2.1": "kling-v2-1-master",
        "v2-1-standard": "kling-v2-1-master",
        "v2-1-pro": "kling-v2-1-master",
        "v2-1-master": "kling-v2-1-master",
        "v2-5-turbo": "kling-v2-5-turbo",
        "v2.5-turbo": "kling-v2-5-turbo",
        "v2-6": "kling-v2-6",
        "v2.6": "kling-v2-6",
    }
    
    # Convert to official model name
    if model_name in model_mapping:
        model_name = model_mapping[model_name]
    elif not model_name.startswith("kling-"):
        # If not in mapping and doesn't start with kling-, default to kling-v1
        model_name = "kling-v1"
    
    # Build payload according to official API documentation
    payload: Dict[str, Any] = {
        "model_name": model_name,
        "prompt": prompt.strip(),
    }
    
    # Add optional fields
    if negative_prompt:
        payload["negative_prompt"] = negative_prompt.strip()
    
    if aspect_ratio:
        # Validate aspect ratio
        valid_ratios = ["16:9", "9:16", "1:1"]
        if aspect_ratio in valid_ratios:
            payload["aspect_ratio"] = aspect_ratio
        else:
            payload["aspect_ratio"] = "16:9"  # Default
    else:
        payload["aspect_ratio"] = "16:9"  # Default
    
    if duration:
        # Validate duration (must be 5 or 10)
        if duration in [5, 10]:
            payload["duration"] = str(duration)
        else:
            payload["duration"] = "5"  # Default
    else:
        payload["duration"] = "5"  # Default
    
    # Mode: std (standard) or pro (professional)
    if mode and mode.lower() in ["std", "pro"]:
        payload["mode"] = mode.lower()
    else:
        payload["mode"] = "std"  # Default
    
    # CFG scale (only for v1 models, not v2.x)
    if cfg_scale is not None and "v2" not in model_name:
        payload["cfg_scale"] = float(cfg_scale)
    
    # Image URL for image-to-video (if provided)
    if image_url:
        payload["image_url"] = image_url.strip()
    
    # Optional callback URL
    callback_url = os.getenv("KLING_CALLBACK_URL")
    if callback_url:
        payload["callback_url"] = callback_url.strip()
    
    # Official endpoint: POST /v1/videos/text2video
    # IMPORTANT: Use the correct endpoint from official documentation
    create_path = os.getenv("KLING_CREATE_PATH", "").strip()
    if not create_path:
        create_path = "/v1/videos/text2video"  # Official endpoint
    # Remove any old path references
    if "/v1/jobs/createTask" in create_path:
        create_path = "/v1/videos/text2video"
    try:
        url = f"{_kling_base_url()}{create_path}"
        resp = requests.post(url, headers=_kling_headers(), json=payload, timeout=90)
    except requests.exceptions.ConnectionError as e:
        base_url = _kling_base_url()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cannot connect to Kling AI provider at '{base_url}'. Please check KLING_BASE_URL in your .env file. Error: {str(e)}",
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI request failed: {str(e)}",
        )
    
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Kling AI unauthorized: {resp.text}",
        )
    if resp.status_code == 429:
        # Rate limit or insufficient balance at provider
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message", "Rate limit exceeded or insufficient balance")
        if "balance" in error_msg.lower() or "not enough" in error_msg.lower() or error_data.get("code") == 1102:
            # Provide more helpful message about units/balance
            detail_msg = (
                f"Kling AI provider balance/units insufficient: {error_msg}. "
                f"Please check your account balance/units at your Kling AI provider dashboard. "
                f"Note: Different models consume different amounts of units. "
                f"V2.0 and V2.1 models typically require more units than V1.0/V1.5. "
                f"If you recently purchased a package, please verify: "
                f"(1) Package is active, (2) Units are available, (3) Package hasn't expired. "
                f"Consider using V1.0 or V1.5 models for testing to save units."
            )
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=detail_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Kling AI rate limit exceeded: {error_msg}",
            )
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message", resp.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI provider error ({resp.status_code}): {error_msg}",
        )
    
    return resp.json() if resp.content else {}


def _kling_parse_task_id(data: Any) -> Optional[str]:
    """
    Parse task ID from Kling AI response.
    Official format: { "code": 0, "data": { "task_id": "..." } }
    """
    if isinstance(data, dict):
        # Check nested data field (official format)
        nested = data.get("data")
        if isinstance(nested, dict):
            task_id = nested.get("task_id")
            if isinstance(task_id, str) and task_id.strip():
                return task_id.strip()
        
        # Fallback: try common field names
        task_id = (
            data.get("taskId")
            or data.get("task_id")
            or data.get("id")
            or data.get("task")
        )
        if isinstance(task_id, str) and task_id.strip():
            return task_id.strip()
    return None


def _kling_get_status(task_id: str) -> Dict[str, Any]:
    """
    Get Kling AI task status.
    Official endpoint: GET /v1/videos/text2video/{task_id}
    """
    # Official endpoint: GET /v1/videos/text2video/{task_id}
    status_path = os.getenv("KLING_STATUS_PATH", "").strip()
    if not status_path:
        status_path = f"/v1/videos/text2video/{task_id}"  # Official endpoint
    else:
        # If custom path provided, replace {task_id} placeholder
        status_path = status_path.replace("{task_id}", task_id).replace("{id}", task_id)
    # Remove any old path references
    if "/v1/jobs/taskStatus" in status_path:
        status_path = f"/v1/videos/text2video/{task_id}"
    url = f"{_kling_base_url()}{status_path}"
    
    resp = requests.get(
        url,
        headers=_kling_headers(),
        timeout=60,
    )
    
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Kling AI unauthorized: {resp.text}",
        )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI provider error ({resp.status_code}): {resp.text}",
        )
    
    return resp.json() if resp.content else {}


def _kling_parse_status(data: Any) -> Optional[str]:
    """
    Parse status from Kling AI response.
    Official format: { "code": 0, "data": { "task_status": "submitted|processing|succeed|failed" } }
    """
    if isinstance(data, dict):
        # Check nested data field (official format)
        nested = data.get("data")
        if isinstance(nested, dict):
            status = nested.get("task_status")
            if isinstance(status, str):
                status_lower = status.lower()
                if status_lower == "succeed":
                    return "succeeded"
                if status_lower == "failed":
                    return "failed"
                if status_lower in ("submitted", "processing"):
                    return "processing"
        
        # Fallback: try common field names
        status = data.get("status") or data.get("state") or data.get("task_status")
        if isinstance(status, str):
            status_lower = status.lower()
            if status_lower in ("succeed", "completed", "success", "succeeded", "done"):
                return "succeeded"
            if status_lower == "failed":
                return "failed"
            if status_lower in ("submitted", "processing", "generating", "running", "pending", "queued"):
                return "processing"
    return None


# ==============================
# Kling AI Image Generation Helpers
# ==============================


def _kling_create_image_task(
    prompt: str,
    model: Optional[str] = None,
    aspect_ratio: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a Kling AI text-to-image task.
    
    Official API Documentation:
    - Endpoint: POST /v1/images/generations
    - Model names: kling-v1, kling-v1-5, kling-v2, kling-v2-new, kling-v2-1
    - Field name: model_name (not model)
    """
    # Normalize model name
    model_name = (model or "kling-v1").strip().lower()
    
    # Map frontend model names to official API model names for image generation
    # Official models: kling-v1, kling-v1-5, kling-v2, kling-v2-new, kling-v2-1
    model_mapping = {
        # Frontend format -> Official API format
        "kling-v1": "kling-v1",
        "kling-v1-5": "kling-v1-5",
        "kling-v1.5": "kling-v1-5",
        "kling-v2-1": "kling-v2-1",
        "kling-v2.1": "kling-v2-1",
        "kling-v2": "kling-v2",
        "kling-v2-new": "kling-v2-new",
        "kling-image-o1": "kling-v1",  # Note: image-o1 not in official list, fallback to v1
        "kling-o1": "kling-v1",
    }
    
    if model_name in model_mapping:
        model_name = model_mapping[model_name]
    elif not model_name.startswith("kling-"):
        model_name = "kling-v1"
    
    # Build payload according to official API documentation
    # Official field name is "model_name" (not "model")
    payload: Dict[str, Any] = {
        "model_name": model_name,
        "prompt": prompt.strip(),
    }
    
    # Add aspect ratio if provided
    # Official supported ratios: 16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9
    if aspect_ratio:
        valid_ratios = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3", "21:9"]
        if aspect_ratio in valid_ratios:
            payload["aspect_ratio"] = aspect_ratio
        else:
            payload["aspect_ratio"] = "16:9"  # Default per documentation
    else:
        payload["aspect_ratio"] = "16:9"  # Default per documentation
    
    # Try different possible endpoints for image generation
    # Official endpoint per documentation: POST /v1/images/generations
    create_path = os.getenv("KLING_IMAGE_CREATE_PATH", "").strip()
    
    # List of endpoints to try (in order of likelihood)
    # Always try official endpoint first, even if custom path is set
    possible_paths = []
    if create_path:
        # If custom path is set, try it first, then official endpoint as fallback
        possible_paths = [
            create_path,
            "/v1/images/generations",  # Official endpoint (always try this)
        ]
    else:
        # Official Kling AI image generation endpoint (from documentation)
        possible_paths = [
            "/v1/images/generations",  # Official endpoint (try this first!)
            "/v1/videos/text2video",   # Fallback: some providers use same endpoint
            "/v1/images/text2image",   # Alternative endpoint
        ]
    
    resp = None
    last_error = None
    working_path = None
    
    # Try each endpoint until one works
    for path_to_try in possible_paths:
        try:
            url = f"{_kling_base_url()}{path_to_try}"
            resp = requests.post(url, headers=_kling_headers(), json=payload, timeout=90)
            
            # If successful (2xx), use this response
            if resp.status_code < 400:
                working_path = path_to_try
                break
            elif resp.status_code == 404:
                # Try next endpoint if 404
                last_error = f"Endpoint {path_to_try} returned 404"
                continue
            else:
                # Non-404 error, use this response (will be handled below)
                working_path = path_to_try
                break
        except requests.exceptions.ConnectionError as e:
            # Connection error - try next endpoint
            last_error = f"Connection error for {path_to_try}: {str(e)}"
            continue
        except requests.exceptions.RequestException as e:
            # Request error - try next endpoint
            last_error = f"Request error for {path_to_try}: {str(e)}"
            continue
    
    if not resp:
        # All endpoints failed
        base_url = _kling_base_url()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                f"Failed to connect to Kling AI. Tried endpoints: {', '.join(possible_paths)}. "
                f"Last error: {last_error or 'Unknown error'}. "
                f"Please check KLING_BASE_URL in your .env file (current: {base_url})."
            ),
        )
    
    # Use the working path for error messages
    create_path = working_path or possible_paths[0] if possible_paths else "/v1/images/generations"
    
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Kling AI unauthorized: {resp.text}",
        )
    if resp.status_code == 429:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message", "Rate limit exceeded or insufficient balance")
        if "balance" in error_msg.lower() or "not enough" in error_msg.lower() or error_data.get("code") == 1102:
            detail_msg = (
                f"Kling AI provider balance/units insufficient: {error_msg}. "
                f"Please check your account balance/units at your Kling AI provider dashboard."
            )
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=detail_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Kling AI rate limit exceeded: {error_msg}",
            )
    if resp.status_code == 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message") or error_data.get("error") or resp.text or "Bad request"
        
        # If "model is not supported", try using "model" field instead of "model_name"
        if "model" in error_msg.lower() and "not supported" in error_msg.lower():
            # Retry with "model" field instead of "model_name"
            payload_retry = payload.copy()
            if "model_name" in payload_retry:
                payload_retry["model"] = payload_retry.pop("model_name")
            
            try:
                resp_retry = requests.post(url, headers=_kling_headers(), json=payload_retry, timeout=90)
                if resp_retry.status_code < 400:
                    return resp_retry.json() if resp_retry.content else {}
                # If still error, continue with original error
            except:
                pass
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Kling AI bad request (400): {error_msg}. "
                f"Model used: {model_name}. "
                f"Please check if the model supports image generation. "
                f"Supported image models: kling-v1, kling-v1-5, kling-v2-1, kling-v2, kling-image-o1"
            ),
        )
    if resp.status_code == 404:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message") or error_data.get("error") or resp.text or "Endpoint not found"
        tried_paths_str = ', '.join(possible_paths) if possible_paths else (create_path if create_path else "/v1/images/generations")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Kling AI image generation endpoint not found (404): {error_msg}. "
                f"Tried endpoints: {tried_paths_str}. "
                f"Official endpoint is /v1/images/generations. "
                f"Please set KLING_IMAGE_CREATE_PATH=/v1/images/generations in your .env file. "
                f"If that doesn't work, contact your Kling AI provider for the correct endpoint."
            ),
        )
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message") or error_data.get("error") or resp.text or "Unknown error"
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI provider error ({resp.status_code}): {error_msg}",
        )
    
    return resp.json() if resp.content else {}


def _process_image_url_for_kling(image_url: str) -> str:
    """
    Process image URL to extract base64 data for Kling AI.
    Kling AI expects pure base64 string (without data:image/...;base64, prefix).
    
    Returns:
        Pure base64 string if input is data URL, or original URL if HTTP/HTTPS
    """
    if not image_url or not image_url.strip():
        raise ValueError("Image URL cannot be empty")
    
    image_url = image_url.strip()
    
    # Check if it's a base64 data URL
    if image_url.startswith('data:image/'):
        # Extract base64 data from data URL
        # Format: data:image/png;base64,<base64_data>
        try:
            header, encoded = image_url.split(',', 1)
            # Return pure base64 string (Kling AI expects this format)
            return encoded
        except ValueError:
            raise ValueError("Invalid data URL format. Expected: data:image/<type>;base64,<base64_data>")
    
    # If it's HTTP/HTTPS URL, download and convert to base64
    elif image_url.startswith('http://') or image_url.startswith('https://'):
        try:
            img_resp = requests.get(image_url, timeout=30)
            img_resp.raise_for_status()
            # Convert to base64
            image_base64 = base64.b64encode(img_resp.content).decode('utf-8')
            return image_base64
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to download image from URL: {str(e)}")
    
    # If it's already pure base64 (no prefix), return as is
    else:
        # Validate it's valid base64
        try:
            base64.b64decode(image_url, validate=True)
            return image_url
        except Exception:
            raise ValueError("Image URL must be a valid data URL (data:image/...), HTTP/HTTPS URL, or base64 string")


def _kling_create_image_to_image_task(
    prompt: str,
    image_url: str,
    model: Optional[str] = None,
    mode: Optional[str] = None,
    aspect_ratio: Optional[str] = None,
    image_url2: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a Kling AI image-to-image task.
    
    Modes:
    - entire-image: Transform entire image (kling-v1)
    - subject: Focus on subject (kling-v1-5)
    - face: Transform faces (kling-v1-5)
    - restyle: Apply new style (kling-v2, kling-v2-new)
    - multi-image: Combine multiple images (kling-v2)
    """
    # Normalize model name
    model_name = (model or "kling-v1").strip().lower()
    mode_name = (mode or "entire-image").strip().lower()
    
    # Map frontend model names
    model_mapping = {
        "kling-v1": "kling-v1",
        "kling-v1-5": "kling-v1-5",
        "kling-v1.5": "kling-v1-5",
        "kling-v2": "kling-v2",
        "kling-v2-new": "kling-v2-new",
    }
    
    if model_name in model_mapping:
        model_name = model_mapping[model_name]
    elif not model_name.startswith("kling-"):
        model_name = "kling-v1"
    
    # Process image URLs to extract base64 for Kling AI
    try:
        processed_image = _process_image_url_for_kling(image_url)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image URL format: {str(e)}",
        )
    
    # Build payload according to official API documentation
    # For image-to-image, use "image" field (not "image_url")
    # image_reference: "subject" or "face" (for kling-v1-5)
    payload: Dict[str, Any] = {
        "model_name": model_name,
        "prompt": prompt.strip(),
        "image": processed_image,  # Pure base64 string
    }
    
    # Add second image for multi-image mode
    if mode_name == "multi-image" and image_url2:
        try:
            processed_image2 = _process_image_url_for_kling(image_url2)
            payload["image2"] = processed_image2
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid second image URL format: {str(e)}",
            )
    
    # Add image_reference for kling-v1-5 models
    if model_name == "kling-v1-5" and mode_name in ["subject", "face"]:
        payload["image_reference"] = mode_name
    
    # Add aspect ratio if provided and mode supports it
    # Official supported ratios: 16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9
    if aspect_ratio and mode_name not in ["restyle"]:
        valid_ratios = ["16:9", "9:16", "1:1", "4:3", "3:4", "3:2", "2:3", "21:9"]
        if aspect_ratio in valid_ratios:
            payload["aspect_ratio"] = aspect_ratio
    
    # Official endpoint: POST /v1/images/generations (same as text-to-image, but with image parameter)
    create_path = os.getenv("KLING_IMAGE_TO_IMAGE_CREATE_PATH", "/v1/images/generations").strip()
    try:
        url = f"{_kling_base_url()}{create_path}"
        resp = requests.post(url, headers=_kling_headers(), json=payload, timeout=90)
    except requests.exceptions.ConnectionError as e:
        base_url = _kling_base_url()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cannot connect to Kling AI provider at '{base_url}'. Error: {str(e)}",
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI request failed: {str(e)}",
        )
    
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Kling AI unauthorized: {resp.text}",
        )
    if resp.status_code == 429:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message", "Rate limit exceeded or insufficient balance")
        if "balance" in error_msg.lower() or "not enough" in error_msg.lower() or error_data.get("code") == 1102:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Kling AI provider balance/units insufficient: {error_msg}",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Kling AI rate limit exceeded: {error_msg}",
            )
    if resp.status_code >= 400:
        error_data = resp.json() if resp.content else {}
        error_msg = error_data.get("message", resp.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI provider error ({resp.status_code}): {error_msg}",
        )
    
    return resp.json() if resp.content else {}


def _kling_get_image_status(task_id: str) -> Dict[str, Any]:
    """
    Get Kling AI image task status.
    Official endpoint: GET /v1/images/generations/{task_id}
    """
    status_path = os.getenv("KLING_IMAGE_STATUS_PATH", "").strip()
    if not status_path:
        status_path = f"/v1/images/generations/{task_id}"  # Official endpoint
    else:
        status_path = status_path.replace("{task_id}", task_id).replace("{id}", task_id)
    url = f"{_kling_base_url()}{status_path}"
    
    resp = requests.get(
        url,
        headers=_kling_headers(),
        timeout=60,
    )
    
    if resp.status_code in (401, 403):
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Kling AI unauthorized: {resp.text}",
        )
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Kling AI provider error ({resp.status_code}): {resp.text}",
        )
    
    return resp.json() if resp.content else {}


def _kling_parse_image_url(data: Any) -> Optional[str]:
    """
    Parse image URL from Kling AI response.
    Official format: { "code": 0, "data": { "task_result": { "images": [{ "url": "..." }] } } }
    """
    if isinstance(data, dict):
        # Check nested data field (official format)
        nested = data.get("data")
        if isinstance(nested, dict):
            task_result = nested.get("task_result")
            if isinstance(task_result, dict):
                images = task_result.get("images")
                if isinstance(images, list) and len(images) > 0:
                    first_image = images[0]
                    if isinstance(first_image, dict):
                        url = first_image.get("url")
                        if isinstance(url, str) and url.strip():
                            return url.strip()
            
            # Fallback: try direct fields
            image_url = nested.get("image_url") or nested.get("imageUrl") or nested.get("url")
            if isinstance(image_url, str) and image_url.strip():
                return image_url.strip()
        
        # Fallback: try root level
        image_url = data.get("image_url") or data.get("imageUrl") or data.get("url") or data.get("result_url")
        if isinstance(image_url, str) and image_url.strip():
            return image_url.strip()
    return None


def _kling_parse_video_url(data: Any) -> Optional[str]:
    """
    Parse video URL from Kling AI response.
    Official format: { "code": 0, "data": { "task_result": { "videos": [{ "url": "..." }] } } }
    """
    if isinstance(data, dict):
        # Check nested data field (official format)
        nested = data.get("data")
        if isinstance(nested, dict):
            task_result = nested.get("task_result")
            if isinstance(task_result, dict):
                videos = task_result.get("videos")
                if isinstance(videos, list) and len(videos) > 0:
                    first_video = videos[0]
                    if isinstance(first_video, dict):
                        url = first_video.get("url")
                        if isinstance(url, str) and url.strip():
                            return url.strip()
            
            # Fallback: try direct fields
            url = nested.get("videoUrl") or nested.get("video_url") or nested.get("url")
            if isinstance(url, str) and url.strip():
                return url.strip()
        
        # Fallback: try root level
        url = data.get("videoUrl") or data.get("video_url") or data.get("url")
        if isinstance(url, str) and url.strip():
            return url.strip()
    return None


# ==============================
# FastAPI app & middleware
# ==============================

app = FastAPI(title="Web3 Auth API")


# Startup event - initialize database tables
@app.on_event("startup")
async def startup_event():
    """
    Initialize database tables on application startup.
    This ensures all models are imported and registered before creating tables.
    
    # Models imported at line 52 before this startup event
    """
    import os
    from sqlalchemy import inspect
    
    print("=" * 60)
    print("[STARTUP] Starting database initialization...")
    print("=" * 60)
    
    # Debug: Verify DATABASE_URL
    db_url = os.getenv("DATABASE_URL")
    db_url_exists = bool(db_url)
    print(f"[STARTUP] DATABASE_URL exists: {db_url_exists}")
    
    if db_url:
        # Mask sensitive parts for logging
        if "@" in db_url:
            masked_url = db_url.split("@")[-1]
        else:
            masked_url = db_url[:50] + "..." if len(db_url) > 50 else db_url
        print(f"[STARTUP] DATABASE_URL: {masked_url}")
        
        # Check if PostgreSQL
        if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
            print("[STARTUP] Using PostgreSQL (Railway production)")
        else:
            print("[STARTUP] Using SQLite (development mode)")
    else:
        print("[STARTUP] WARNING: DATABASE_URL not found in environment!")
        print("[STARTUP] WARNING: Make sure you set DATABASE_URL in Railway Variables")
        print("[STARTUP] WARNING: Format: ${{ Postgres.DATABASE_URL }}")
    
    # Debug: Verify models are imported
    print(f"[STARTUP] Models imported: User={User is not None}, UserCoinBalance={UserCoinBalance is not None}")
    print(f"[STARTUP] Found {len(Base.metadata.tables)} table(s) to create: {list(Base.metadata.tables.keys())}")
    
    if len(Base.metadata.tables) == 0:
        print("[STARTUP] ERROR: No tables found in Base.metadata!")
        print("[STARTUP] ERROR: This means models were not imported correctly")
        print("[STARTUP] ERROR: Check if models.py is imported correctly")
        return
    
    # Try to connect and verify database
    try:
        print("[STARTUP] Testing database connection...")
        with engine.connect() as conn:
            print("[STARTUP] Database connection successful")
    except Exception as e:
        print(f"[STARTUP] Database connection failed: {e}")
        import traceback
        traceback.print_exc()
        print("[STARTUP] WARNING: App will continue, but database operations may fail")
        return
    
    # Create tables
    try:
        print("[STARTUP] Creating tables if they don't exist...")
        init_db()
        print("[STARTUP] Database initialization complete")
        
        # Verify tables were created
        print("[STARTUP] Verifying tables were created...")
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"[STARTUP] Found {len(existing_tables)} table(s) in database: {existing_tables}")
        
        expected_tables = list(Base.metadata.tables.keys())
        missing_tables = [t for t in expected_tables if t not in existing_tables]
        
        if missing_tables:
            print(f"[STARTUP] WARNING: Some tables are missing: {missing_tables}")
        else:
            print("[STARTUP] All expected tables exist in database")
            
    except Exception as e:
        print(f"[STARTUP] Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        print("[STARTUP] WARNING: You can manually initialize using: POST /admin/db/init")
        # Don't raise - let app start even if DB init fails (for debugging)
        # In production, you might want to raise here
    
    print("=" * 60)
    print("[STARTUP] Startup complete")
    print("=" * 60)


# CORS configuration - MUST be added before routes
# Get allowed origins from environment or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
# Default origins for local development
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
# Combine defaults with environment origins
all_origins = default_origins + [origin.strip() for origin in cors_origins if origin.strip()]

# In development, allow all origins for easier network access
# Set ALLOW_ALL_ORIGINS=false in production for security
allow_all_origins = os.getenv("ALLOW_ALL_ORIGINS", "true").lower() in ("true", "1", "yes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else all_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


@app.get("/")
def read_root():
    return {"message": "Web3 Auth API is running"}


@app.get("/debug/google-oauth")
def debug_google_oauth():
    """
    Debug endpoint to check Google OAuth configuration.
    Shows redirect URI that will be sent to Google.
    """
    import os
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8001")
    google_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    
    if not google_redirect_uri:
        # Build from BACKEND_URL (same logic as _google_redirect_uri)
        google_redirect_uri = f"{backend_url.rstrip('/')}/auth/google/callback"
    
    return {
        "backend_url": backend_url,
        "google_redirect_uri": google_redirect_uri,
        "google_client_id_set": bool(os.getenv("GOOGLE_CLIENT_ID")),
        "google_client_secret_set": bool(os.getenv("GOOGLE_CLIENT_SECRET")),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "message": "Copy the 'google_redirect_uri' value and add it to Google Cloud Console → OAuth 2.0 Client ID → Authorized redirect URIs"
    }


@app.get("/debug/env")
def debug_env():
    """
    Debug endpoint to verify environment variables are loaded correctly.
    ⚠️ REMOVE THIS ENDPOINT IN PRODUCTION after verification!
    """
    return {
        "database": bool(os.getenv("DATABASE_URL")),
        "jwt_secret": bool(os.getenv("JWT_SECRET_KEY")),
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "sora2": bool(os.getenv("SORA2_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "kling_access": bool(os.getenv("KLING_ACCESS_KEY")),
        "kling_secret": bool(os.getenv("KLING_SECRET_KEY")),
        "veo3": bool(os.getenv("VEO3_API_KEY")),
        "replicate": bool(os.getenv("REPLICATE_API_TOKEN")),
        "circle": bool(os.getenv("CIRCLE_API_KEY")),
        "google_client_id": bool(os.getenv("GOOGLE_CLIENT_ID")),
        "google_client_secret": bool(os.getenv("GOOGLE_CLIENT_SECRET")),
    }


@app.post("/admin/db/init")
def admin_init_db():
    """
    Manual database initialization endpoint.
    Use this if auto-init fails in Railway.
    """
    try:
        import os
        print("[ADMIN] Manual database initialization requested...")
        print(f"[ADMIN] DATABASE_URL exists: {bool(os.getenv('DATABASE_URL'))}")
        db_url = os.getenv("DATABASE_URL", "")
        if db_url:
            print(f"[ADMIN] DATABASE_URL: {db_url.split('@')[-1] if '@' in db_url else db_url[:50]}...")
        print(f"[ADMIN] Found {len(Base.metadata.tables)} table(s): {list(Base.metadata.tables.keys())}")
        
        if len(Base.metadata.tables) == 0:
            return {
                "success": False,
                "message": "No tables found in Base.metadata. Models may not be imported correctly.",
                "tables": [],
                "database_url_set": bool(os.getenv("DATABASE_URL"))
            }
        
        init_db()
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        return {
            "success": True,
            "message": "Database tables initialized successfully",
            "expected_tables": list(Base.metadata.tables.keys()),
            "created_tables": existing_tables,
            "database_url_set": bool(os.getenv("DATABASE_URL")),
            "database_type": "PostgreSQL" if db_url.startswith("postgresql") else "SQLite"
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ADMIN] Error: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize database: {str(e)}"
        )

# Add OPTIONS handler for CORS preflight requests
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}


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

        # Normalize email: trim whitespace and convert to lowercase
        normalized_email = user_in.email.strip().lower()
        existing = db.query(User).filter(func.lower(User.email) == normalized_email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Hash password with error handling
        try:
            hashed_pw = hash_password(user_in.password)
        except Exception as hash_error:
            error_msg = str(hash_error)
            print(f"[AUTH] ❌ Password hashing failed: {hash_error}")
            import traceback
            traceback.print_exc()
            
            # Provide more specific error message
            if "72" in error_msg or "byte" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Password is too long. Maximum 72 characters allowed.",
                )
            else:
                # Other errors (e.g., bcrypt not installed, configuration issue)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Password hashing failed. Please contact support. Error: {error_msg[:100]}",
                )
        
        user = User(
            email=normalized_email,
            full_name=user_in.full_name,
            hashed_password=hashed_pw,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[AUTH] ✅ User registered: {normalized_email} (ID: {user.id})")
        return user
    except HTTPException:
        # re-throw HTTPExceptions unchanged
        raise
    except Exception as e:
        # Untuk debugging: kirim pesan error ke client (sementara)
        error_msg = str(e)
        print(f"[AUTH] ❌ Registration error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {error_msg}",
        )


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Normalize email: trim whitespace and convert to lowercase for comparison
    email_input = form_data.username.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_input).first()
    
    if not user:
        print(f"[AUTH] Login failed: User not found for email: {email_input}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not verify_password(form_data.password, user.hashed_password):
        print(f"[AUTH] Login failed: Invalid password for email: {email_input}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    print(f"[AUTH] Login successful for user: {email_input} (ID: {user.id})")
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

    # Normalize email: trim whitespace and convert to lowercase
    normalized_email = email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if not user:
        # Create user with a dummy password for Google OAuth users.
        # Google OAuth users don't need password - they login via OAuth.
        # Use a short random password (32 chars) to avoid bcrypt 72-byte limit.
        # Use a very short dummy password (16 chars = 16 bytes) to ensure it works with bcrypt
        # This is safe because Google OAuth users don't need password - they login via OAuth
        dummy_password = secrets.token_hex(8)  # 16 characters = 16 bytes, definitely safe for bcrypt
        try:
            hashed_pw = hash_password(dummy_password)
        except Exception as hash_error:
            error_msg = str(hash_error)
            error_type = type(hash_error).__name__
            print(f"[Google OAuth] ❌ Password hashing failed:")
            print(f"  - Error type: {error_type}")
            print(f"  - Error message: {error_msg}")
            print(f"  - Dummy password length: {len(dummy_password)} chars, {len(dummy_password.encode('utf-8'))} bytes")
            import traceback
            traceback.print_exc()
            
            # Provide more specific error message
            if "72" in error_msg or "byte" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: Password hashing error (password too long). This should not happen with dummy password.",
                )
            else:
                # Other errors (e.g., bcrypt not installed, configuration issue)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create user: Password hashing error. Please check backend logs. Error: {error_type}: {error_msg[:100]}",
                )
        user = User(email=normalized_email, full_name=full_name, hashed_password=hashed_pw)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[Google OAuth] ✅ Created new user: {normalized_email} (ID: {user.id})")
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
    # Normalize email for case-insensitive lookup
    email_input = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_input).first()
    if not user:
        # Untuk keamanan, jangan bocorkan bahwa email tidak terdaftar
        return {"message": "If that email exists, a reset code has been sent."}

    # Generate 6-digit numeric code
    reset_code = generate_reset_code()
    user.reset_code = reset_code
    user.reset_code_expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    # Clear old JWT token if exists
    user.reset_token = None
    user.reset_token_expires_at = None

    db.add(user)
    db.commit()

    # Send reset code via email (use email from database for consistency)
    try:
        send_reset_code_email(user.email, reset_code)
        print(f"[FORGOT PASSWORD] Reset code sent to {user.email}: {reset_code}")
    except Exception as email_error:
        print(f"[FORGOT PASSWORD] Failed to send email to {user.email}: {email_error}")
        # For development, still show code in console if email fails
        print(f"[FORGOT PASSWORD] Reset code for {user.email}: {reset_code}")

    return {"message": "If that email exists, a reset code has been sent."}


@app.post("/auth/verify-reset-code")
def verify_reset_code(body: VerifyResetCodeRequest, db: Session = Depends(get_db)):
    # Normalize email for case-insensitive lookup
    email_input = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_input).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or code")

    # Check if code matches and hasn't expired
    if (
        not user.reset_code
        or user.reset_code != body.code
        or not user.reset_code_expires_at
        or user.reset_code_expires_at < datetime.utcnow()
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code")

    # Code is valid - don't clear it yet, will be used in reset-password
    return {"message": "Code verified successfully"}


@app.post("/auth/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Legacy endpoint using JWT token (for backward compatibility)"""
    email = verify_reset_token(body.token)
    # Normalize email for case-insensitive lookup
    email_input = email.strip().lower() if email else None

    user = db.query(User).filter(func.lower(User.email) == email_input).first() if email_input else None
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


@app.post("/auth/reset-password-with-code")
def reset_password_with_code(body: ResetPasswordWithCodeRequest, db: Session = Depends(get_db)):
    """New endpoint using numeric code"""
    # Normalize email for case-insensitive lookup
    email_input = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_input).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")

    # Verify code again (double check)
    if (
        not user.reset_code
        or user.reset_code != body.code
        or not user.reset_code_expires_at
        or user.reset_code_expires_at < datetime.utcnow()
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code")

    # Reset password
    user.hashed_password = hash_password(body.password)
    user.reset_code = None
    user.reset_code_expires_at = None
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
    # Require a canonical 32-byte transaction hash (0x + 64 hex chars)
    if not tx_hash or not tx_hash.startswith("0x"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tx_hash is required")
    if len(tx_hash) != 66:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tx_hash format")
    try:
        int(tx_hash[2:], 16)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tx_hash format")

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
    # For sora2: use duration-based pricing (4s=50, 8s=90, 12s=110 coins)
    # For kling: use model-based pricing
    # For others: use model-based pricing
    provider_check = (body.provider or _provider_name()).strip().lower()
    if provider_check == "sora2":
        # Duration-based pricing: 4s=50, 8s=90, 12s=110 coins
        duration = int(body.duration_seconds or 4)
        if duration == 4:
            cost_coins = 50
        elif duration == 8:
            cost_coins = 90
        elif duration == 12:
            cost_coins = 110
        else:
            # Default to 4s pricing if duration is invalid
            cost_coins = 50
    elif provider_check == "kling":
        # Kling AI pricing: premium models (v2-1, v2-0) = 180 coins, standard (v1-5, v1-0) = 25 coins
        model = (body.model or "").strip().lower()
        if model and ("v2" in model or "2.1" in model or "2.0" in model):
            cost_coins = 180
        else:
            cost_coins = 25
    else:
        cost_coins = _model_cost_coins(body.model)
    bal = _get_or_create_coin_balance(db, current_user.id)
    if int(bal.coins or 0) < int(cost_coins):
        raise HTTPException(status_code=402, detail=f"Insufficient coins. Need {cost_coins} coins.")
    bal.coins = int(bal.coins or 0) - int(cost_coins)
    db.add(bal)
    db.commit()
    db.refresh(bal)

    provider = (body.provider or _provider_name()).strip().lower()
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
        "coins_spent": int(cost_coins),
        "coins_refunded": False,
    }

    try:
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

        elif provider == "sora2":
            aspect_ratio = (body.aspect_ratio or "landscape").strip().lower()
            if aspect_ratio not in ("landscape", "portrait"):
                aspect_ratio = "landscape"
            quality = (body.quality or "standard").strip().lower()
            if quality not in ("standard", "hd"):
                quality = "standard"
            image_urls = body.image_urls if isinstance(body.image_urls, list) and body.image_urls else None
            callback_url = (body.callback_url or "").strip() or None
            task = _sora2_create_task(
                body.prompt.strip(),
                aspect_ratio=aspect_ratio,
                quality=quality,
                image_urls=image_urls,
                watermark=(body.watermark or "").strip() or None,
                callback_url=callback_url,
                duration_seconds=int(body.duration_seconds or 4),
            )
            task_id = _sora2_parse_id(task)
            if not task_id:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Sora2 provider response missing id: {task}",
                )
            job["provider_task_id"] = str(task_id)
            job["status"] = "processing"

        elif provider == "kling":
            # Kling AI supports text-to-video and image-to-video
            image_url = None
            if body.image_urls and isinstance(body.image_urls, list) and len(body.image_urls) > 0:
                image_url = body.image_urls[0]  # Use first image for image-to-video
            
            duration = int(body.duration_seconds or 5)
            # Validate duration (must be 5 or 10)
            if duration not in [5, 10]:
                duration = 5
            
            # Map aspect ratio if provided
            aspect_ratio = None
            if body.aspect_ratio:
                ar = body.aspect_ratio.strip().lower()
                if ar in ["16:9", "9:16", "1:1"]:
                    aspect_ratio = ar
                elif ar == "16:9" or ar == "landscape":
                    aspect_ratio = "16:9"
                elif ar == "9:16" or ar == "portrait":
                    aspect_ratio = "9:16"
            
            try:
                task = _kling_create_task(
                    prompt=body.prompt.strip(),
                    model=body.model,  # e.g., "v2-1-master", "v1-6", etc.
                    image_url=image_url,
                    duration=duration,
                    aspect_ratio=aspect_ratio,
                )
            except HTTPException:
                # Re-raise HTTP exceptions (they already have proper error messages)
                raise
            except Exception as e:
                # Catch any other errors and provide helpful message
                error_msg = str(e)
                if "your-kling-provider" in error_msg.lower() or "getaddrinfo failed" in error_msg.lower() or "NameResolutionError" in error_msg:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Kling AI configuration error: KLING_BASE_URL is not set correctly in your .env file. Please update it with the correct base URL from your Kling AI provider (e.g., https://api.useapi.net). Current error: {error_msg}",
                    )
                raise
            
            # Check for API errors in response
            if isinstance(task, dict) and task.get("code") != 0:
                error_msg = task.get("message") or "Kling AI API error"
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Kling AI API error: {error_msg}",
                )
            
            task_id = _kling_parse_task_id(task)
            if not task_id:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Kling AI provider response missing task id: {task}",
                )
            job["provider_task_id"] = str(task_id)
            job["status"] = "processing"

        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unsupported VIDEO_PROVIDER '{provider}'. Use 'mock', 'replicate', 'veo3', 'sora2', or 'kling'.",
            )
    except Exception:
        # Provider failed before job was persisted -> refund spent coins.
        _refund_generation_coins(db, current_user.id, int(cost_coins))
        raise

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
    db: Session = Depends(get_db),
):
    job = VIDEO_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    provider = job.get("provider")
    # Best-effort refund helper (only once per job)
    def _maybe_refund(reason: Optional[str] = None) -> None:
        if job.get("coins_refunded"):
            return
        coins_spent = int(job.get("coins_spent") or 0)
        if coins_spent <= 0:
            return
        _refund_generation_coins(db, current_user.id, coins_spent)
        job["coins_refunded"] = True
        if reason:
            job["error"] = f"{reason} (coins refunded)"
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
                _maybe_refund(job.get("error"))

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
                _maybe_refund(job.get("error"))
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
                    _maybe_refund(job.get("error"))
            else:
                job["status"] = "processing"

            VIDEO_JOBS[job_id] = job

    if provider == "sora2" and job.get("status") in ("queued", "processing"):
        task_id = job.get("provider_task_id")
        if task_id:
            st = _sora2_get_status(str(task_id))
            status_raw = _sora2_parse_status(st) or "processing"
            status_norm = str(status_raw).lower()

            if status_norm in ("queued", "pending", "starting", "processing", "running", "in_progress"):
                job["status"] = "processing"
            elif status_norm in ("failed", "error", "canceled", "cancelled"):
                job["status"] = "failed"
                if isinstance(st, dict):
                    error_obj = st.get("error")
                    if isinstance(error_obj, dict):
                        job["error"] = error_obj.get("message", "OpenAI Sora 2 failed")
                    else:
                        job["error"] = st.get("error") or "OpenAI Sora 2 failed"
                else:
                    job["error"] = "OpenAI Sora 2 failed"
                _maybe_refund(job.get("error"))
            elif status_norm in ("completed", "succeeded", "success", "done"):
                # OpenAI doesn't return video URL in status, need to download from /content endpoint
                # Use our proxy endpoint which will save video to our server
                # Get backend base URL from env or use default
                # Use BACKEND_URL from environment (Railway production)
                # Fallback to localhost only for development
                backend_url = os.getenv("BACKEND_URL")
                if not backend_url:
                    # Development fallback
                    backend_url = "http://localhost:8001"
                    print("[Sora2] ⚠️  BACKEND_URL not set, using localhost (development mode)")
                else:
                    print(f"[Sora2] Using BACKEND_URL: {backend_url.split('@')[-1] if '@' in backend_url else backend_url[:50]}...")
                backend_url = backend_url.strip().rstrip("/")
                # Use our stored video endpoint if available, otherwise use download endpoint
                # The download endpoint will save the video on first access
                job["video_url"] = f"{backend_url}/video/sora2/{task_id}/download"
                job["status"] = "succeeded"
            else:
                job["status"] = "processing"

            VIDEO_JOBS[job_id] = job

    if provider == "kling" and job.get("status") in ("queued", "processing"):
        task_id = job.get("provider_task_id")
        if task_id:
            st = _kling_get_status(str(task_id))
            
            # Check for API errors
            if isinstance(st, dict) and st.get("code") != 0:
                error_msg = st.get("message") or "Kling AI API error"
                job["status"] = "failed"
                job["error"] = error_msg
                _maybe_refund(job.get("error"))
                VIDEO_JOBS[job_id] = job
                return VideoJobOut(
                    job_id=job_id,
                    status=job["status"],
                    provider=job["provider"],
                    video_url=job.get("video_url"),
                    error=job.get("error"),
                    created_at=job["created_at"],
                )
            
            status_raw = _kling_parse_status(st) or "processing"
            status_norm = str(status_raw).lower()

            if status_norm in ("queued", "pending", "starting", "processing", "generating", "running", "submitted"):
                job["status"] = "processing"
            elif status_norm in ("failed", "error", "failure", "canceled", "cancelled"):
                job["status"] = "failed"
                if isinstance(st, dict):
                    nested = st.get("data")
                    if isinstance(nested, dict):
                        job["error"] = nested.get("task_status_msg") or nested.get("message") or "Kling AI provider failed"
                    else:
                        job["error"] = st.get("message") or "Kling AI provider failed"
                else:
                    job["error"] = "Kling AI provider failed"
                _maybe_refund(job.get("error"))
            elif status_norm in ("completed", "succeeded", "success", "done", "succeed"):
                video_url = _kling_parse_video_url(st)
                job["video_url"] = video_url
                job["status"] = "succeeded" if video_url else "failed"
                if not video_url:
                    job["error"] = "Kling AI completed but no video URL returned"
                    _maybe_refund(job.get("error"))
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


@app.get("/video/sora2/{video_id}/download")
def download_sora2_video(
    video_id: str,
    token: Optional[str] = Query(None, description="JWT token for authentication (alternative to Authorization header)"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    """
    Proxy endpoint to download OpenAI Sora 2 video content.
    This endpoint downloads the video from OpenAI and streams it to the client.
    Accepts token either from query parameter (for video tag) or Authorization header.
    """
    # Get token from query parameter or Authorization header
    auth_token = token
    if not auth_token and authorization:
        # Extract token from "Bearer <token>" format
        if authorization.startswith("Bearer "):
            auth_token = authorization[7:]
        else:
            auth_token = authorization
    
    if not auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    
    # Validate token and get user
    try:
        current_user = get_user_from_token(auth_token, db)
    except HTTPException:
        raise
    
    # Log for debugging
    print(f"[Download] Request for video_id: {video_id}, user_id: {current_user.id}, VIDEO_JOBS count: {len(VIDEO_JOBS)}")
    
    # Verify the video belongs to the user
    # video_id could be either:
    # 1. provider_task_id (from OpenAI, e.g., "video_123")
    # 2. job_id (our internal job ID)
    job = None
    
    # First, try to find by job_id (if video_id is a job_id)
    if video_id in VIDEO_JOBS:
        candidate = VIDEO_JOBS[video_id]
        if candidate.get("user_id") == current_user.id:
            job = candidate
            print(f"[Download] Found video in VIDEO_JOBS by job_id: {video_id}")
    
    # If not found, search by provider_task_id
    if not job:
        for j in VIDEO_JOBS.values():
            provider_task_id = j.get("provider_task_id")
            # Compare as strings, handle both with and without "video_" prefix
            if provider_task_id:
                # Normalize both IDs for comparison
                normalized_video_id = video_id.strip()
                normalized_task_id = str(provider_task_id).strip()
                # Remove "video_" prefix if present for comparison
                if normalized_video_id.startswith("video_"):
                    normalized_video_id = normalized_video_id[6:]
                if normalized_task_id.startswith("video_"):
                    normalized_task_id = normalized_task_id[6:]
                
                if normalized_task_id == normalized_video_id and j.get("user_id") == current_user.id:
                    job = j
                    print(f"[Download] Found video in VIDEO_JOBS by provider_task_id: {provider_task_id}")
                    break
    
    # Determine the provider_task_id to use
    provider_task_id = None
    
    if job:
        # Use provider_task_id from the job (not video_id from URL) to ensure we use the correct ID format
        provider_task_id = job.get("provider_task_id")
        if not provider_task_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video job found but missing provider_task_id"
            )
    else:
        # Video not found in VIDEO_JOBS (e.g., after server restart)
        # Use the video_id directly - it should be the provider_task_id from the URL
        # The video_id from URL is already in the correct format (e.g., "video_xxx")
        provider_task_id = video_id.strip()
        
        print(f"[Download] Video not in VIDEO_JOBS. Using video_id directly as provider_task_id: {provider_task_id}")
        
        # Try to verify the video exists in OpenAI (optional check)
        # If this fails, we'll still try to download (maybe video exists but API has issues)
        try:
            video_data = _sora2_retrieve_video(provider_task_id)
            print(f"[Download] Video {provider_task_id} verified in OpenAI. Status: {video_data.get('status', 'unknown')}")
        except HTTPException as verify_e:
            if verify_e.status_code == 404:
                print(f"[Download] Warning: Video {provider_task_id} not found in OpenAI (404). Will still attempt download.")
                # Don't raise error here - let the download attempt handle it
            else:
                print(f"[Download] Warning: Could not verify video status: {verify_e.detail}. Will still attempt download.")
        except Exception as verify_error:
            print(f"[Download] Warning: Error verifying video: {verify_error}. Will still attempt download.")
    
    # Download video from OpenAI using the provider_task_id
    # OpenAI expects the full ID including "video_" prefix if present
    url = f"{_sora2_base_url()}/v1/videos/{provider_task_id}/content"
    headers = _sora2_headers()
    
    # Add request ID for debugging
    request_id = str(uuid4())
    headers["X-Client-Request-Id"] = request_id
    
    try:
        # First, verify the video exists and is ready by checking its status
        try:
            print(f"[Download] Verifying video status for: {provider_task_id}")
            video_status = _sora2_retrieve_video(provider_task_id)
            video_status_value = video_status.get("status", "").lower() if isinstance(video_status, dict) else ""
            print(f"[Download] Video status: {video_status_value}")
            
            if video_status_value not in ("completed", "succeeded", "success", "done"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Video is not ready yet. Current status: {video_status_value}. Please wait for the video to complete generation."
                )
        except HTTPException as e:
            # If it's a 404, that means video doesn't exist
            if e.status_code == 404:
                print(f"[Download] Video {provider_task_id} not found in OpenAI (404)")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Video not found in OpenAI: {provider_task_id}. The video may have been deleted or expired."
                )
            raise
        except Exception as status_check_error:
            # If status check fails, continue with download attempt anyway
            print(f"[Download] Warning: Could not verify video status: {status_check_error}")
        
        # Now attempt to download the video
        resp = requests.get(url, headers=headers, timeout=120, stream=True)
        
        if resp.status_code in (401, 403):
            request_id = resp.headers.get("x-request-id", "unknown")
            raise HTTPException(
                status_code=resp.status_code, 
                detail=f"OpenAI Sora 2 unauthorized: {resp.text} (Request ID: {request_id})"
            )
        
        if resp.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Video not found: {provider_task_id}. The video may have been deleted or the ID is incorrect."
            )
        
        if resp.status_code >= 400:
            error_data = {}
            error_msg = resp.text
            try:
                if resp.content:
                    error_data = resp.json()
                    if isinstance(error_data.get("error"), dict):
                        error_msg = error_data.get("error", {}).get("message", resp.text)
                    else:
                        error_msg = str(error_data.get("error", resp.text))
            except:
                error_msg = resp.text[:500]  # Limit error message length
            
            request_id = resp.headers.get("x-request-id", "unknown")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, 
                detail=f"OpenAI Sora 2 error ({resp.status_code}): {error_msg} (Request ID: {request_id})"
            )
        
        # Check if video is already stored in our server
        stored_video = db.query(StoredVideo).filter(
            StoredVideo.provider_task_id == provider_task_id,
            StoredVideo.user_id == current_user.id,
            StoredVideo.expires_at > datetime.utcnow()
        ).first()
        
        if stored_video and os.path.exists(stored_video.file_path):
            # Serve from our storage
            print(f"[Download] Serving video from storage: {stored_video.file_path}")
            file_path = Path(stored_video.file_path)
            if file_path.exists():
                def iterfile():
                    with open(file_path, "rb") as f:
                        while True:
                            chunk = f.read(8192)
                            if not chunk:
                                break
                            yield chunk
                
                return StreamingResponse(
                    iterfile(),
                    media_type="video/mp4",
                    headers={
                        "Content-Disposition": f'inline; filename="sora2-video-{video_id}.mp4"',
                        "Content-Length": str(stored_video.file_size or file_path.stat().st_size),
                    }
                )
        
        # Video not stored yet, download from OpenAI and save it
        print(f"[Download] Downloading and saving video: {provider_task_id}")
        
        # Create storage directory
        storage_dir = Path(base_dir) / "storage" / "videos"
        storage_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_name = f"{current_user.id}_{provider_task_id}_{uuid4().hex[:8]}.mp4"
        file_path = storage_dir / file_name
        
        # Download and save video
        file_size = 0
        try:
            with open(file_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        file_size += len(chunk)
            
            # Save to database with 2 days expiry
            expires_at = datetime.utcnow() + timedelta(days=2)
            stored_video = StoredVideo(
                user_id=current_user.id,
                provider_task_id=provider_task_id,
                job_id=job.get("job_id") if job else None,
                file_path=str(file_path),
                file_size=file_size,
                expires_at=expires_at
            )
            db.add(stored_video)
            db.commit()
            db.refresh(stored_video)
            
            print(f"[Download] Video saved: {file_path}, size: {file_size} bytes, expires: {expires_at}")
            
            # Now serve the saved file
            def iterfile():
                with open(file_path, "rb") as f:
                    while True:
                        chunk = f.read(8192)
                        if not chunk:
                            break
                        yield chunk
            
            return StreamingResponse(
                iterfile(),
                media_type="video/mp4",
                headers={
                    "Content-Disposition": f'inline; filename="sora2-video-{video_id}.mp4"',
                    "Content-Length": str(file_size),
                }
            )
        except Exception as save_error:
            # If save fails, try to clean up and stream directly
            import traceback
            print(f"[Download] Error saving video: {traceback.format_exc()}")
            if file_path.exists():
                try:
                    file_path.unlink()
                except:
                    pass
            
            # Fallback: stream directly from OpenAI response
            return StreamingResponse(
                resp.iter_content(chunk_size=8192),
                media_type="video/mp4",
                headers={
                    "Content-Disposition": f'inline; filename="sora2-video-{video_id}.mp4"',
                    "Content-Length": resp.headers.get("Content-Length", ""),
                }
            )
    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to OpenAI timed out. Please try again later."
        )
    except requests.exceptions.ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to OpenAI: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error downloading video: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to download video from OpenAI: {str(e)}"
        )


# ==============================
# Image generation endpoints
# ==============================


@app.post("/image/text-to-image", response_model=ImageJobOut)
def create_text_to_image_job(
    body: TextToImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    # Spend coins for generation based on model
    cost_coins = _image_model_cost_coins(body.model)
    bal = _get_or_create_coin_balance(db, current_user.id)
    if int(bal.coins or 0) < int(cost_coins):
        raise HTTPException(status_code=402, detail=f"Insufficient coins. Need {cost_coins} coins.")
    bal.coins = int(bal.coins or 0) - int(cost_coins)
    db.add(bal)
    db.commit()
    db.refresh(bal)

    provider = "kling"
    job_id = str(uuid4())
    created_at = datetime.utcnow()

    job: Dict[str, Any] = {
        "job_id": job_id,
        "user_id": current_user.id,
        "provider": provider,
        "status": "queued",
        "created_at": created_at,
        "coins_spent": cost_coins,
        "coins_balance": int(bal.coins or 0),
        "prompt": body.prompt.strip(),
        "model": body.model or "kling-v1",
        "aspect_ratio": body.aspect_ratio or "1:1",
    }

    # Create task with Kling AI
    try:
        task_data = _kling_create_image_task(
            prompt=body.prompt.strip(),
            model=body.model or "kling-v1",
            aspect_ratio=body.aspect_ratio or "1:1",
        )
        provider_task_id = _kling_parse_task_id(task_data)
        if provider_task_id:
            job["provider_task_id"] = provider_task_id
            job["status"] = "processing"
        else:
            job["status"] = "failed"
            job["error"] = "Failed to get task ID from Kling AI"
            # Refund coins
            bal.coins = int(bal.coins or 0) + int(cost_coins)
            db.add(bal)
            db.commit()
    except HTTPException:
        raise
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        # Refund coins
        bal.coins = int(bal.coins or 0) + int(cost_coins)
        db.add(bal)
        db.commit()

    IMAGE_JOBS[job_id] = job

    return ImageJobOut(
        job_id=job_id,
        status=job["status"],
        provider=job["provider"],
        image_url=job.get("image_url"),
        error=job.get("error"),
        created_at=job["created_at"],
        coins_spent=job.get("coins_spent"),
        coins_balance=job.get("coins_balance"),
    )


# ==============================
# Video cleanup endpoint (remove expired videos)
# ==============================

@app.post("/admin/videos/cleanup")
def cleanup_expired_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cleanup expired videos (older than 2 days).
    This endpoint can be called manually or by a cron job.
    """
    try:
        now = datetime.utcnow()
        expired_videos = db.query(StoredVideo).filter(
            StoredVideo.expires_at < now
        ).all()
        
        deleted_count = 0
        deleted_size = 0
        
        for video in expired_videos:
            # Delete file from disk
            file_path = Path(video.file_path)
            if file_path.exists():
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    deleted_size += file_size
                    print(f"[Cleanup] Deleted expired video: {video.file_path} ({file_size} bytes)")
                except Exception as e:
                    print(f"[Cleanup] Error deleting file {video.file_path}: {e}")
            
            # Delete from database
            db.delete(video)
            deleted_count += 1
        
        db.commit()
        
        return {
            "deleted_count": deleted_count,
            "deleted_size_bytes": deleted_size,
            "deleted_size_mb": round(deleted_size / (1024 * 1024), 2),
            "message": f"Cleaned up {deleted_count} expired videos"
        }
    except Exception as e:
        db.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Cleanup] Error: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup videos: {str(e)}"
        )


@app.post("/image/image-to-image", response_model=ImageJobOut)
def create_image_to_image_job(
    body: ImageToImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")
    if not body.image_url or not body.image_url.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image URL is required")

    # Spend coins for generation (5 coins as per user requirement)
    cost_coins = 5
    bal = _get_or_create_coin_balance(db, current_user.id)
    if int(bal.coins or 0) < int(cost_coins):
        raise HTTPException(status_code=402, detail=f"Insufficient coins. Need {cost_coins} coins.")
    bal.coins = int(bal.coins or 0) - int(cost_coins)
    db.add(bal)
    db.commit()
    db.refresh(bal)

    provider = "kling"
    job_id = str(uuid4())
    created_at = datetime.utcnow()

    job: Dict[str, Any] = {
        "job_id": job_id,
        "user_id": current_user.id,
        "provider": provider,
        "status": "queued",
        "created_at": created_at,
        "coins_spent": cost_coins,
        "coins_balance": int(bal.coins or 0),
        "prompt": body.prompt.strip(),
        "image_url": body.image_url.strip(),
        "model": body.model or "kling-v1",
        "mode": body.mode or "entire-image",
        "aspect_ratio": body.aspect_ratio,
    }

    # Create task with Kling AI
    try:
        task_data = _kling_create_image_to_image_task(
            prompt=body.prompt.strip(),
            image_url=body.image_url.strip(),
            model=body.model or "kling-v1",
            mode=body.mode or "entire-image",
            aspect_ratio=body.aspect_ratio,
            image_url2=body.image_url2.strip() if body.image_url2 else None,
        )
        provider_task_id = _kling_parse_task_id(task_data)
        if provider_task_id:
            job["provider_task_id"] = provider_task_id
            job["status"] = "processing"
        else:
            job["status"] = "failed"
            job["error"] = "Failed to get task ID from Kling AI"
            # Refund coins
            bal.coins = int(bal.coins or 0) + int(cost_coins)
            db.add(bal)
            db.commit()
    except HTTPException:
        raise
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        # Refund coins
        bal.coins = int(bal.coins or 0) + int(cost_coins)
        db.add(bal)
        db.commit()

    IMAGE_JOBS[job_id] = job

    return ImageJobOut(
        job_id=job_id,
        status=job["status"],
        provider=job["provider"],
        image_url=job.get("image_url"),
        error=job.get("error"),
        created_at=job["created_at"],
        coins_spent=job.get("coins_spent"),
        coins_balance=job.get("coins_balance"),
    )


# ==============================
# Video cleanup endpoint (remove expired videos)
# ==============================

@app.post("/admin/videos/cleanup")
def cleanup_expired_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cleanup expired videos (older than 2 days).
    This endpoint can be called manually or by a cron job.
    """
    try:
        now = datetime.utcnow()
        expired_videos = db.query(StoredVideo).filter(
            StoredVideo.expires_at < now
        ).all()
        
        deleted_count = 0
        deleted_size = 0
        
        for video in expired_videos:
            # Delete file from disk
            file_path = Path(video.file_path)
            if file_path.exists():
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    deleted_size += file_size
                    print(f"[Cleanup] Deleted expired video: {video.file_path} ({file_size} bytes)")
                except Exception as e:
                    print(f"[Cleanup] Error deleting file {video.file_path}: {e}")
            
            # Delete from database
            db.delete(video)
            deleted_count += 1
        
        db.commit()
        
        return {
            "deleted_count": deleted_count,
            "deleted_size_bytes": deleted_size,
            "deleted_size_mb": round(deleted_size / (1024 * 1024), 2),
            "message": f"Cleaned up {deleted_count} expired videos"
        }
    except Exception as e:
        db.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Cleanup] Error: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup videos: {str(e)}"
        )


@app.get("/image/job/{job_id}", response_model=ImageJobOut)
def get_image_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = IMAGE_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image job not found")
    
    if job.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    provider = job.get("provider", "kling")
    
    # Poll job status if still processing
    if provider == "kling" and job.get("status") in ("queued", "processing"):
        task_id = job.get("provider_task_id")
        if task_id:
            try:
                st = _kling_get_image_status(str(task_id))
                
                # Check for API errors
                if isinstance(st, dict) and st.get("code") != 0:
                    error_msg = st.get("message") or "Kling AI API error"
                    job["status"] = "failed"
                    job["error"] = error_msg
                    # Refund coins
                    bal = _get_or_create_coin_balance(db, current_user.id)
                    bal.coins = int(bal.coins or 0) + int(job.get("coins_spent", 0))
                    db.add(bal)
                    db.commit()
                    IMAGE_JOBS[job_id] = job
                    return ImageJobOut(
                        job_id=job_id,
                        status=job["status"],
                        provider=job["provider"],
                        image_url=job.get("image_url"),
                        error=job.get("error"),
                        created_at=job["created_at"],
                        coins_spent=job.get("coins_spent"),
                        coins_balance=job.get("coins_balance"),
                    )
                
                # Parse status from response
                # Official format: data.task_status = "submitted|processing|succeed|failed"
                # Also check task_result.images - if images exist, image is ready regardless of task_status
                status_raw = None
                image_url_from_response = None
                
                if isinstance(st, dict):
                    nested = st.get("data")
                    if isinstance(nested, dict):
                        # Check if image is ready first (task_result.images)
                        task_result = nested.get("task_result")
                        if isinstance(task_result, dict):
                            images = task_result.get("images")
                            if isinstance(images, list) and len(images) > 0:
                                first_image = images[0]
                                if isinstance(first_image, dict):
                                    url = first_image.get("url")
                                    if isinstance(url, str) and url.strip():
                                        image_url_from_response = url.strip()
                                        # Image is ready, treat as succeed
                                        status_raw = "succeed"
                        
                        # If image not found yet, check task_status
                        if not status_raw:
                            status_raw = nested.get("task_status")
                
                status_raw = status_raw or _kling_parse_status(st) or "processing"
                status_norm = str(status_raw).lower()

                if status_norm in ("queued", "pending", "starting", "processing", "generating", "running", "submitted"):
                    job["status"] = "processing"
                elif status_norm in ("failed", "error", "failure", "canceled", "cancelled"):
                    job["status"] = "failed"
                    if isinstance(st, dict):
                        nested = st.get("data")
                        if isinstance(nested, dict):
                            job["error"] = nested.get("task_status_msg") or nested.get("message") or "Kling AI provider failed"
                        else:
                            job["error"] = st.get("message") or "Kling AI provider failed"
                    else:
                        job["error"] = "Kling AI provider failed"
                    # Refund coins
                    bal = _get_or_create_coin_balance(db, current_user.id)
                    bal.coins = int(bal.coins or 0) + int(job.get("coins_spent", 0))
                    db.add(bal)
                    db.commit()
                elif status_norm in ("completed", "succeeded", "success", "done", "succeed") or image_url_from_response:
                    # Status is "succeed" per documentation, or image URL found
                    image_url = image_url_from_response or _kling_parse_image_url(st)
                    if image_url:
                        job["image_url"] = image_url
                        job["status"] = "succeeded"
                    else:
                        # Try to get more info for debugging
                        debug_info = ""
                        if isinstance(st, dict):
                            nested = st.get("data")
                            if isinstance(nested, dict):
                                task_result = nested.get("task_result")
                                debug_info = f" task_result exists: {task_result is not None}"
                                if task_result:
                                    images = task_result.get("images")
                                    debug_info += f", images exists: {images is not None}, images count: {len(images) if isinstance(images, list) else 0}"
                        
                        job["status"] = "failed"
                        job["error"] = f"Kling AI completed but no image URL returned.{debug_info} Response: {str(st)[:200]}"
                        # Refund coins
                        bal = _get_or_create_coin_balance(db, current_user.id)
                        bal.coins = int(bal.coins or 0) + int(job.get("coins_spent", 0))
                        db.add(bal)
                        db.commit()
                else:
                    job["status"] = "processing"

                IMAGE_JOBS[job_id] = job
            except Exception as e:
                # Don't fail the request if polling fails, just return current status
                pass

    return ImageJobOut(
        job_id=job_id,
        status=job["status"],
        provider=job["provider"],
        image_url=job.get("image_url"),
        error=job.get("error"),
        created_at=job["created_at"],
        coins_spent=job.get("coins_spent"),
        coins_balance=job.get("coins_balance"),
    )


# ==============================
# Video cleanup endpoint (remove expired videos)
# ==============================

@app.post("/admin/videos/cleanup")
def cleanup_expired_videos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cleanup expired videos (older than 2 days).
    This endpoint can be called manually or by a cron job.
    """
    try:
        now = datetime.utcnow()
        expired_videos = db.query(StoredVideo).filter(
            StoredVideo.expires_at < now
        ).all()
        
        deleted_count = 0
        deleted_size = 0
        
        for video in expired_videos:
            # Delete file from disk
            file_path = Path(video.file_path)
            if file_path.exists():
                try:
                    file_size = file_path.stat().st_size
                    file_path.unlink()
                    deleted_size += file_size
                    print(f"[Cleanup] Deleted expired video: {video.file_path} ({file_size} bytes)")
                except Exception as e:
                    print(f"[Cleanup] Error deleting file {video.file_path}: {e}")
            
            # Delete from database
            db.delete(video)
            deleted_count += 1
        
        db.commit()
        
        return {
            "deleted_count": deleted_count,
            "deleted_size_bytes": deleted_size,
            "deleted_size_mb": round(deleted_size / (1024 * 1024), 2),
            "message": f"Cleaned up {deleted_count} expired videos"
        }
    except Exception as e:
        db.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Cleanup] Error: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup videos: {str(e)}"
        )