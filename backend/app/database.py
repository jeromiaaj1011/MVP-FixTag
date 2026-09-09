import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database file stored locally in the backend directory (or overridden via DATABASE_URL)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fixtag.db")

# connect_args={"check_same_thread": False} is required for SQLite
# because FastAPI can process requests in multiple threads.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
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
