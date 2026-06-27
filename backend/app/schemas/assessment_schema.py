from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime
from typing import Optional
from app.schemas.prediction_schema import PredictionResponse


def _clamp_24(value: float, field_name: str) -> float:
    """Ensure a hours-based field is between 0 and 24."""
    if value < 0:
        raise ValueError(f"{field_name} cannot be negative")
    if value > 24:
        raise ValueError(f"{field_name} cannot exceed 24 hours")
    return value


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

    # ── Per-field 24-hour cap ──────────────────────────────────────────
    @field_validator("social_media_hours")
    @classmethod
    def validate_social_media_hours(cls, v: float) -> float:
        return _clamp_24(v, "social_media_hours")

    @field_validator("sleep_hours")
    @classmethod
    def validate_sleep_hours(cls, v: float) -> float:
        return _clamp_24(v, "sleep_hours")

    @field_validator("screen_time_before_sleep")
    @classmethod
    def validate_screen_time_before_sleep(cls, v: float) -> float:
        return _clamp_24(v, "screen_time_before_sleep")

    # ── Cross-field: sum of all time-based hours must not exceed 24h ──
    @model_validator(mode="after")
    def validate_total_hours(self) -> "AssessmentCreate":
        total = (
            (self.social_media_hours or 0)
            + (self.sleep_hours or 0)
            + (self.screen_time_before_sleep or 0)
        )
        if total > 24:
            raise ValueError(
                f"The combined total of social_media_hours + sleep_hours + "
                f"screen_time_before_sleep is {total:.1f}h, which exceeds 24 hours."
            )
        return self


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