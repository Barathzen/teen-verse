from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SimulationRequest(BaseModel):

    assessment_id: int

    sleep_hours: float

    social_media_hours: float

    physical_activity: float

    name: Optional[str] = ""


class SimulationUpdate(BaseModel):
    """Schema for updating simulation fields (admin only)."""
    name: Optional[str] = None


class SimulationResponse(BaseModel):

    id: int

    assessment_id: int

    name: str = ""

    created_by: Optional[int] = None

    current_risk: float

    future_risk: float

    risk_reduction: float

    modified_sleep_hours: float

    modified_social_media_hours: float

    modified_physical_activity: float

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
