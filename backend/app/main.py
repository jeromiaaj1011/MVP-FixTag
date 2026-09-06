from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models  # Ensures models are registered with Base.metadata
from app.routers import assets, issues


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

# Enable CORS (Cross-Origin Resource Sharing) so future frontend clients can communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
