from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.services.notifications import send_discord_issue_alert

router = APIRouter()


@router.post(
    "",
    response_model=schemas.IssueResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a new issue",
    description="Create a new issue linked to an asset. Automatically receives status 'Reported' and current timestamps."
)
def create_issue(
    issue: schemas.IssueCreate,
    db: Session = Depends(get_db)
):
    # Validate that the referenced asset actually exists in the database
    asset = crud.get_asset_by_id(db, asset_id=issue.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID {issue.asset_id} does not exist. Cannot report an issue for a non-existent asset."
        )

    # 1. Successfully create and persist the issue in SQLite first
    db_issue = crud.create_issue(db=db, issue=issue)

    # 2. Trigger Discord notification AFTER successful database persistence
    try:
        send_discord_issue_alert(issue=db_issue, asset=asset)
    except Exception:
        # Defense-in-depth: Notification failure must NEVER block issue creation
        pass

    return db_issue


@router.get(
    "",
    response_model=List[schemas.IssueResponse],
    summary="Get all issues for dashboard",
    description="Retrieve issues with optional filtering by status (Reported, Acknowledged, In Progress, Fixed). Leave empty to return all issues."
)
def read_issues(
    status: Optional[str] = Query(
        None,
        description="Filter issues by status: Reported, Acknowledged, In Progress, Fixed (optional)"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_issues(db=db, status=status)


@router.get(
    "/{id}",
    response_model=schemas.IssueResponse,
    summary="Get a single issue by ID",
    description="Retrieve full details for a specific issue ticket."
)
def read_issue(
    id: int,
    db: Session = Depends(get_db)
):
    db_issue = crud.get_issue_by_id(db, issue_id=id)
    if not db_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {id} not found."
        )
    return db_issue


@router.patch(
    "/{id}/status",
    response_model=schemas.IssueResponse,
    summary="Update issue status",
    description="Update the status and optional resolution notes for an issue. Updates 'updated_at' and preserves original reported details."
)
def update_issue_status(
    id: int,
    status_update: schemas.IssueStatusUpdate,
    db: Session = Depends(get_db)
):
    db_issue = crud.get_issue_by_id(db, issue_id=id)
    if not db_issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID {id} not found."
        )
    return crud.update_issue_status(db=db, db_issue=db_issue, status_update=status_update)
