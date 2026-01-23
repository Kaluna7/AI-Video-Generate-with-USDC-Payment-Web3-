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
# Correct: Using os.getenv() to read Railway ENV
DATABASE_URL = os.getenv("DATABASE_URL")

# Debug: Check if DATABASE_URL exists
print(f"[DB] DATABASE_URL exists: {bool(DATABASE_URL)}")

if DATABASE_URL:
    # Normalize common .env issues: surrounding quotes or trailing whitespace
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")
    
    # Validate PostgreSQL format for Railway
    if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
        print(f"[DB] Using PostgreSQL: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else '***'}")
    else:
        # Safely print first 20 characters, handling Unicode issues
        try:
            preview = DATABASE_URL[:20]
            print(f"[DB] WARNING: DATABASE_URL format: {preview}... (expected postgresql://)")
        except UnicodeEncodeError:
            print(f"[DB] WARNING: DATABASE_URL format contains unicode characters (expected postgresql://)")
else:
    # Default to SQLite for development (local only)
    DATABASE_URL = "sqlite:///./dev.db"
    print(f"[DB] WARNING: DATABASE_URL not set, using default SQLite: {DATABASE_URL}")
    print(f"[DB] WARNING: For Railway production, set DATABASE_URL=${{{{ Postgres.DATABASE_URL }}}}")

# Create engine with connection pooling for production (PostgreSQL)
# For PostgreSQL, use pool_pre_ping to handle connection drops
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    # PostgreSQL for Railway production
    print("[DB] Configuring PostgreSQL engine with connection pooling...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,
        max_overflow=10
    )
    print("[DB] PostgreSQL engine ready")
else:
    # SQLite for local development (fallback)
    print("[DB] Using SQLite engine (development mode)")
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
    print(f"[DB] Found {len(Base.metadata.tables)} table(s) to create: {list(Base.metadata.tables.keys())}")
    try:
        Base.metadata.create_all(bind=engine)
        print("[DB] Tables ready")
    except Exception as e:
        print(f"[DB] Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        raise


# Note: init_db() should be called after all models are imported
# It will be called from main.py after models are loaded

