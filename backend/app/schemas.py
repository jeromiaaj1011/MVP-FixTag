from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

# Valid priorities and statuses defined as Literals for strict validation
PriorityType = Literal["Low", "Medium", "High", "Critical"]
StatusType = Literal["Reported", "Acknowledged", "In Progress", "Fixed"]


# ==========================================
# Asset Schemas
# ==========================================

class AssetBase(BaseModel):
    asset_tag: str = Field(..., min_length=1, description="Unique human-readable tag, e.g. PRJ-204")
    name: str = Field(..., min_length=1, description="Asset name, e.g. Epson Projector")
    location: str = Field(..., min_length=1, description="Physical location, e.g. Room 204")
    asset_type: str = Field(..., min_length=1, description="Type of asset, e.g. Projector")


class AssetCreate(AssetBase):
    """Schema for incoming data when registering an asset"""
    pass


class AssetResponse(AssetBase):
    """Schema for returning asset data to clients"""
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Issue Schemas
# ==========================================

class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, description="Brief problem title")
    description: str = Field(..., min_length=1, description="Detailed problem description")
    priority: PriorityType = Field(..., description="Priority: Low, Medium, High, Critical")


class IssueCreate(IssueBase):
    """Schema for reporting a new issue via QR code scan"""
    asset_id: int = Field(..., description="ID of the asset this issue belongs to")


class IssueStatusUpdate(BaseModel):
    """Schema for technicians updating status and notes"""
    status: StatusType = Field(..., description="New status: Reported, Acknowledged, In Progress, Fixed")
    resolution_notes: Optional[str] = Field(None, description="Optional notes on resolution or progress")


class IssueResponse(IssueBase):
    """Schema for returning issue data to clients"""
    id: int
    asset_id: int
    status: StatusType
    resolution_notes: Optional[str] = None
    reported_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    asset: Optional[AssetResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Composite Schemas (Maintenance History)
# ==========================================

class AssetDetailResponse(AssetResponse):
    """
    Returns asset details along with its complete list of issues.
    This serves as the asset's maintenance history without needing
    a separate MaintenanceHistory table.
    """
    issues: List[IssueResponse] = []
