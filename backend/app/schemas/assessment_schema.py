from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.prediction_schema import PredictionResponse

class AssessmentCreate(BaseModel):

    name: Optional[str] = ""

    age: int

    gender: str

    social_media_hours: float

    platform_usage: str = "Instagram"

    sleep_hours: float

    screen_time_before_sleep: float

    academic_performance: float

    physical_activity: float

    stress_level: float

    anxiety_level: float

    addiction_level: float

    social_interaction_level: str = "medium"


class AssessmentUpdate(BaseModel):
    """Schema for updating assessment fields (admin only)."""
    name: Optional[str] = None


class AssessmentResponse(
    AssessmentCreate
):

    id: int

    user_id: int

    created_at: datetime

    prediction: Optional[PredictionResponse] = None

    class Config:
        from_attributes = True