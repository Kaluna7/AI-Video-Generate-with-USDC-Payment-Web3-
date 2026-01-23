import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

# Load environment variables
try:
    from dotenv import load_dotenv
    base_dir = Path(__file__).resolve().parent
    load_dotenv(base_dir / ".env")
    load_dotenv(base_dir.parent / ".env")
except Exception:
    pass

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Normalize common .env issues: surrounding quotes or trailing whitespace
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")

if not DATABASE_URL:
    # Default to SQLite for development
    DATABASE_URL = "sqlite:///./dev.db"
    print(f"[DB] Using default SQLite database: {DATABASE_URL}")
else:
    print(f"[DB] Using database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

# Create engine
engine = create_engine(DATABASE_URL)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for ORM models
Base = declarative_base()


# Database dependency for FastAPI
def get_db():
    """
    FastAPI dependency to get database session.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Auto-generate tables on import
# This will create all tables defined in models that inherit from Base
def init_db():
    """
    Initialize database by creating all tables.
    Safe to call multiple times - won't recreate existing tables.
    """
    print("[DB] Creating tables if they don't exist...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[DB] ✅ Tables ready")
    except Exception as e:
        print(f"[DB] ❌ Error creating tables: {e}")
        raise


# Note: init_db() should be called after all models are imported
# It will be called from main.py after models are loaded

