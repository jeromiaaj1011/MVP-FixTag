from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app import models, schemas


# ==========================================
# Asset CRUD Operations
# ==========================================

def get_asset_by_id(db: Session, asset_id: int) -> Optional[models.Asset]:
    """Retrieve an asset by its internal primary key."""
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()


def get_asset_by_tag(db: Session, asset_tag: str) -> Optional[models.Asset]:
    """Retrieve an asset by its unique human-readable asset_tag (e.g. 'PRJ-204')."""
    return db.query(models.Asset).filter(models.Asset.asset_tag == asset_tag).first()


def get_assets(db: Session, skip: int = 0, limit: int = 100) -> List[models.Asset]:
    """Retrieve a list of assets ordered by registration date."""
    return db.query(models.Asset).order_by(models.Asset.created_at.desc()).offset(skip).limit(limit).all()


def create_asset(db: Session, asset: schemas.AssetCreate) -> models.Asset:
    """Create a new asset in the database."""
    db_asset = models.Asset(
        asset_tag=asset.asset_tag.strip(),
        name=asset.name.strip(),
        location=asset.location.strip(),
        asset_type=asset.asset_type.strip(),
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


# ==========================================
# Issue CRUD Operations
# ==========================================

def create_issue(db: Session, issue: schemas.IssueCreate) -> models.Issue:
    """
    Create a new issue for an existing asset.
    Status automatically defaults to 'Reported'.
    Timestamps are set to current time.
    """
    now = datetime.now(timezone.utc)
    db_issue = models.Issue(
        asset_id=issue.asset_id,
        title=issue.title.strip(),
        description=issue.description.strip(),
        priority=issue.priority,
        status="Reported",
        reported_at=now,
        updated_at=now,
    )
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue


def get_issues(db: Session, status: Optional[str] = None) -> List[models.Issue]:
    """
    Retrieve issues for the dashboard, optionally filtered by status.
    If status is None, empty, or whitespace, returns all issues.
    Ordered by reported_at descending (newest issues first).
    """
    query = db.query(models.Issue)
    if status and status.strip():
        query = query.filter(models.Issue.status.ilike(status.strip()))
    return query.order_by(models.Issue.reported_at.desc()).all()


def get_issue_by_id(db: Session, issue_id: int) -> Optional[models.Issue]:
    """Retrieve a single issue by its internal ticket ID."""
    return db.query(models.Issue).filter(models.Issue.id == issue_id).first()


def update_issue_status(
    db: Session, db_issue: models.Issue, status_update: schemas.IssueStatusUpdate
) -> models.Issue:
    """
    Update an issue's status and optional resolution notes.
    Updates 'updated_at' to current time.
    Preserves original title, description, and reported_at.
    """
    db_issue.status = status_update.status
    if status_update.resolution_notes is not None:
        db_issue.resolution_notes = status_update.resolution_notes
    db_issue.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_issue)
    return db_issue
