import os
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models  # Ensures models are registered with Base.metadata
from app.routers import assets, issues

# Load environment variables from backend/.env if present
_backend_dir = Path(__file__).resolve().parents[1]
_env_path = _backend_dir / ".env"
load_dotenv(dotenv_path=_env_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler: runs on startup and shutdown.
    On startup, it ensures SQLite tables (assets, issues) are created if not present.
    """
    Base.metadata.create_all(bind=engine)
    yield


# Initialize FastAPI application
app = FastAPI(
    title="FixTag API",
    description="QR-based Issue Reporting & Maintenance Tracking System",
    version="0.1.0",
    lifespan=lifespan,
)

# Parse allowed origins from ALLOWED_ORIGINS (comma-separated list), fallback to development localhost
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = default_origins

# Enable CORS with explicit origins and allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])


@app.get("/", tags=["Health"])
def read_root():
    """
    Basic health check endpoint to verify the backend server is running.
    """
    return {
        "app": "FixTag API",
        "status": "healthy",
        "version": "0.1.0",
        "message": "Backend, database, and REST API routers are operational."
    }
