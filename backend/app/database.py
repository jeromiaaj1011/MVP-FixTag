import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env if present
_backend_dir = Path(__file__).resolve().parents[1]
_env_path = _backend_dir / ".env"
load_dotenv(dotenv_path=_env_path)

# Database URL stored locally in the backend directory or overridden via DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fixtag.db")

# Normalize legacy 'postgres://' scheme to 'postgresql://' for SQLAlchemy compatibility
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# connect_args={"check_same_thread": False} is required only for SQLite
# because FastAPI can process requests in multiple threads.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)

# Each instance of SessionLocal will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy database models
Base = declarative_base()


def get_db():
    """
    Dependency provider that creates a fresh database session for each request
    and automatically closes it when the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
