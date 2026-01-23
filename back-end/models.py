"""
Database models using SQLAlchemy ORM.
All models inherit from database.Base
"""
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_token = Column(String, nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    reset_code = Column(String, nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)


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


class StoredVideo(Base):
    __tablename__ = "stored_videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    provider_task_id = Column(String, index=True, nullable=False)  # OpenAI video ID
    job_id = Column(String, index=True, nullable=True)  # Our internal job ID
    file_path = Column(String, nullable=False)  # Path to stored video file
    file_size = Column(Integer, nullable=True)  # File size in bytes
    expires_at = Column(DateTime, nullable=False, index=True)  # Auto-delete after 2 days
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

