#!/usr/bin/env python3
"""
Test script to verify database connection and table creation.
Run this to debug database issues in Railway.

Usage:
    python test_db.py
"""

import os
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    base_dir = Path(__file__).resolve().parent
    load_dotenv(base_dir / ".env")
    load_dotenv(base_dir.parent / ".env")
except Exception:
    pass

print("=" * 60)
print("Database Connection Test")
print("=" * 60)

# Check DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")
    print(f"✅ DATABASE_URL found: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else '***'}")
else:
    print("❌ DATABASE_URL not set!")
    print("   Set DATABASE_URL environment variable")
    exit(1)

# Test database import
try:
    from database import engine, Base, init_db
    print("✅ Database module imported successfully")
except Exception as e:
    print(f"❌ Failed to import database module: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Test models import
try:
    from models import User, UserCoinBalance, CoinTopUpTx, StoredVideo
    print("✅ Models imported successfully")
    print(f"   - User")
    print(f"   - UserCoinBalance")
    print(f"   - CoinTopUpTx")
    print(f"   - StoredVideo")
except Exception as e:
    print(f"❌ Failed to import models: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Check if models are registered
print(f"\n📊 Registered tables: {len(Base.metadata.tables)}")
if len(Base.metadata.tables) == 0:
    print("❌ No tables registered! Models may not be imported correctly.")
    exit(1)
else:
    for table_name in Base.metadata.tables.keys():
        print(f"   - {table_name}")

# Test database connection
print("\n🔌 Testing database connection...")
try:
    with engine.connect() as conn:
        print("✅ Database connection successful")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Test table creation
print("\n📦 Creating tables...")
try:
    init_db()
    print("✅ Tables created successfully")
except Exception as e:
    print(f"❌ Failed to create tables: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Verify tables exist
print("\n🔍 Verifying tables exist...")
try:
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"✅ Found {len(existing_tables)} table(s) in database:")
    for table in existing_tables:
        print(f"   - {table}")
    
    expected_tables = ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
    missing_tables = [t for t in expected_tables if t not in existing_tables]
    if missing_tables:
        print(f"\n⚠️  Missing tables: {missing_tables}")
    else:
        print("\n✅ All expected tables exist!")
except Exception as e:
    print(f"❌ Failed to verify tables: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 60)
print("✅ All tests passed!")
print("=" * 60)

