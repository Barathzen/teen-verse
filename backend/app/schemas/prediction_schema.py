from pydantic import BaseModel

class PredictionRequest(BaseModel):

    assessment_id: int

class PredictionResponse(BaseModel):
    id: int
    risk_score: float
    risk_category: str
    predicted_label: int
    confidence_score: float

    class Config:
        from_attributes = True

class ExplanationResponse(BaseModel):

    stress_impact: float

    anxiety_impact: float

    sleep_impact: float

    social_media_impact: float

    exercise_impact: float