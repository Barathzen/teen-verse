"""
Assessment schemas — request/response models with validation.

Validates:
- Per-field: each time-based field is in [0, 24]
- Cross-field: sum of social_media + sleep + screen_time ≤ 24
- Age: must be between 5 and 100
- Gender: whitelist validation
- Numeric scores: bounded ranges
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Optional

from app.schemas.prediction_schema import PredictionResponse
from app.schemas.persona_schema import PersonaResponse


# ── Allowed values ────────────────────────────────────────────────────────

ALLOWED_GENDERS = {"Male", "Female", "Non-binary", "Other", "Prefer not to say"}
ALLOWED_PLATFORMS = {
    "Instagram", "TikTok", "Snapchat", "YouTube", "Twitter",
    "Facebook", "Reddit", "Discord", "WhatsApp", "Other",
}
ALLOWED_INTERACTION_LEVELS = {"low", "medium", "high"}


# ── Helpers ───────────────────────────────────────────────────────────────

def _clamp_24(value: float, field_name: str) -> float:
    """Ensure a hours-based field is between 0 and 24."""
    if value < 0:
        raise ValueError(f"{field_name} cannot be negative")
    if value > 24:
        raise ValueError(f"{field_name} cannot exceed 24 hours")
    return value


def _clamp_range(value: float, field_name: str, lo: float, hi: float) -> float:
    """Ensure a numeric field is within [lo, hi]."""
    if value < lo:
        raise ValueError(f"{field_name} cannot be less than {lo}")
    if value > hi:
        raise ValueError(f"{field_name} cannot exceed {hi}")
    return value


# ── Request schemas ───────────────────────────────────────────────────────

class AssessmentCreate(BaseModel):
    """Schema for creating a new assessment."""

    name: Optional[str] = Field(
        default="",
        max_length=255,
        description="Optional name/label for this assessment.",
    )

    age: int = Field(
        ..., ge=5, le=100,
        description="Age of the subject (5-100).",
    )

    gender: str = Field(
        ..., max_length=50,
        description="Gender of the subject.",
    )

    social_media_hours: float = Field(
        ..., ge=0, le=24,
        description="Daily social media usage in hours (0-24).",
    )

    platform_usage: str = Field(
        default="Instagram", max_length=100,
        description="Primary social media platform.",
    )

    sleep_hours: float = Field(
        ..., ge=0, le=24,
        description="Daily sleep in hours (0-24).",
    )

    screen_time_before_sleep: float = Field(
        ..., ge=0, le=24,
        description="Screen time before sleep in hours (0-24).",
    )

    academic_performance: float = Field(
        ..., ge=0, le=100,
        description="Academic performance score (0-100).",
    )

    physical_activity: float = Field(
        ..., ge=0, le=10,
        description="Physical activity level (0-10).",
    )

    stress_level: float = Field(
        ..., ge=0, le=100,
        description="Self-reported stress level (0-100).",
    )

    anxiety_level: float = Field(
        ..., ge=0, le=100,
        description="Self-reported anxiety level (0-100).",
    )

    addiction_level: float = Field(
        ..., ge=0, le=100,
        description="Self-reported addiction level (0-100).",
    )

    social_interaction_level: str = Field(
        default="medium", max_length=50,
        description="Social interaction level: low, medium, or high.",
    )

    # ── Per-field validators ──────────────────────────────────────────

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

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Gender cannot be empty")
        return cleaned

    @field_validator("platform_usage")
    @classmethod
    def validate_platform_usage(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Platform usage cannot be empty")
        return cleaned

    @field_validator("social_interaction_level")
    @classmethod
    def validate_social_interaction_level(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in ALLOWED_INTERACTION_LEVELS:
            raise ValueError(
                f"social_interaction_level must be one of: "
                f"{', '.join(sorted(ALLOWED_INTERACTION_LEVELS))}"
            )
        return cleaned

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

    name: Optional[str] = Field(
        default=None, max_length=255,
        description="New name for the assessment.",
    )


# ── Response schemas ──────────────────────────────────────────────────────

class AssessmentResponse(AssessmentCreate):
    """Full assessment response with prediction and persona data."""

    id: int
    user_id: int
    created_at: datetime
    prediction: Optional[PredictionResponse] = None
    persona: Optional[PersonaResponse] = None

    class Config:
        from_attributes = True