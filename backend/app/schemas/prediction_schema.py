"""Prediction schemas — request/response models for risk predictions."""

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Request to generate a risk prediction for an assessment."""

    assessment_id: int = Field(
        ..., gt=0,
        description="ID of the assessment to generate a prediction for.",
    )


class PredictionResponse(BaseModel):
    """Response containing the risk prediction results."""

    id: int
    risk_score: float = Field(
        ..., ge=0, le=100,
        description="Risk score from 0 to 100.",
    )
    risk_category: str = Field(
        ..., description="Risk category: Low, Medium, High, or Critical.",
    )
    predicted_label: int = Field(
        ..., description="Binary label: 0 = low risk, 1 = high risk.",
    )
    confidence_score: float = Field(
        ..., ge=0, le=1,
        description="Model confidence score from 0 to 1.",
    )

    class Config:
        from_attributes = True


class ExplanationResponse(BaseModel):
    """SHAP-based feature importance explanation."""

    stress_impact: float = Field(
        ..., description="Contribution of stress level to the prediction.",
    )
    anxiety_impact: float = Field(
        ..., description="Contribution of anxiety level to the prediction.",
    )
    sleep_impact: float = Field(
        ..., description="Contribution of sleep hours to the prediction.",
    )
    social_media_impact: float = Field(
        ..., description="Contribution of social media usage to the prediction.",
    )
    exercise_impact: float = Field(
        ..., description="Contribution of physical activity to the prediction.",
    )