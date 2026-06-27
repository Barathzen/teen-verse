"""Simulation schemas — request/response models with validation."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SimulationRequest(BaseModel):
    """Request to run a what-if simulation."""

    assessment_id: int = Field(
        ..., gt=0,
        description="ID of the assessment to simulate changes for.",
    )
    sleep_hours: float = Field(
        ..., ge=0, le=24,
        description="Modified sleep hours (0-24).",
    )
    social_media_hours: float = Field(
        ..., ge=0, le=24,
        description="Modified social media hours (0-24).",
    )
    physical_activity: float = Field(
        ..., ge=0, le=10,
        description="Modified physical activity level (0-10).",
    )
    name: Optional[str] = Field(
        default="",
        max_length=255,
        description="Optional label for this simulation.",
    )


class SimulationUpdate(BaseModel):
    """Schema for updating simulation fields (admin only)."""

    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="New name for the simulation.",
    )


class SimulationResponse(BaseModel):
    """Full simulation response with risk comparison."""

    id: int
    assessment_id: int
    name: str = Field(default="")
    created_by: Optional[int] = None
    current_risk: float = Field(
        ..., description="Original risk score before modifications.",
    )
    future_risk: float = Field(
        ..., description="Projected risk score after modifications.",
    )
    risk_reduction: float = Field(
        ..., description="Difference: current_risk - future_risk.",
    )
    modified_sleep_hours: float
    modified_social_media_hours: float
    modified_physical_activity: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
