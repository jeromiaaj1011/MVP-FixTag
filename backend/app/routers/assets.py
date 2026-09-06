from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter()


@router.post(
    "",
    response_model=schemas.AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new asset",
    description="Create a new physical asset with a unique asset_tag (e.g., 'PRJ-204')."
)
def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db)
):
    # Check if an asset with this tag already exists
    existing = crud.get_asset_by_tag(db, asset_tag=asset.asset_tag)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset with tag '{asset.asset_tag}' already exists."
        )
    return crud.create_asset(db=db, asset=asset)


@router.get(
    "",
    response_model=List[schemas.AssetResponse],
    summary="Get all assets",
    description="Retrieve all registered assets."
)
def read_assets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_assets(db=db, skip=skip, limit=limit)


@router.get(
    "/{asset_tag}",
    response_model=schemas.AssetDetailResponse,
    summary="Get asset by asset_tag with maintenance history",
    description="Retrieve an asset by its scannable asset_tag, including all past and active issues."
)
def read_asset(
    asset_tag: str,
    db: Session = Depends(get_db)
):
    db_asset = crud.get_asset_by_tag(db, asset_tag=asset_tag)
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with tag '{asset_tag}' not found."
        )
    return db_asset
