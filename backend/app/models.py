from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Asset(Base):
    """
    Represents a physical asset/equipment (e.g. Projector, PC, Printer).
    Notice that 'id' (database primary key) and 'asset_tag' (scannable tag)
    are strictly separated.
    """
    __tablename__ = "assets"

    # Internal database primary key
    id = Column(Integer, primary_key=True, index=True)

    # Human-readable unique identifier printed on physical QR code (e.g. 'PRJ-204')
    asset_tag = Column(String, unique=True, index=True, nullable=False)

    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One Asset -> Many Issues
    # This relationship collection constitutes the asset's complete maintenance history
    issues = relationship("Issue", back_populates="asset", cascade="all, delete-orphan")


class Issue(Base):
    """
    Represents a reported problem for a specific physical asset.
    """
    __tablename__ = "issues"

    # Internal database primary key (ticket number)
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key referencing the internal primary key of Asset
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    # Priority values: 'Low', 'Medium', 'High', 'Critical'
    priority = Column(String, nullable=False)

    # Status values: 'Reported', 'Acknowledged', 'In Progress', 'Fixed'
    status = Column(String, nullable=False, default="Reported")

    # Optional notes added when inspecting or resolving the issue
    resolution_notes = Column(Text, nullable=True)

    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Many Issues -> One Asset
    asset = relationship("Asset", back_populates="issues")
