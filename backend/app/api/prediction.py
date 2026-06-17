from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.prediction_schema import (
    PredictionRequest,
    PredictionResponse,
    ExplanationResponse
)
from app.services.prediction_service import (
    create_prediction,
    get_risk_category
)
from app.services.explainability_service import (
    get_shap_explanation
)
from app.models.user import User
from app.models.prediction import Prediction

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post("/", response_model=PredictionResponse)
def predict_risk(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to generate predictions."
        )
    try:
        prediction = create_prediction(db, request.assessment_id)
        return prediction
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )
    
    # Check authorization
    assessment = prediction.assessment
    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this prediction"
        )
    
    return prediction


@router.get("/{prediction_id}/explain", response_model=ExplanationResponse)
def explain_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )
    
    # Check authorization
    assessment = prediction.assessment
    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this prediction"
        )
    
    try:
        explanation = get_shap_explanation(assessment)
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation generation failed: {str(e)}"
        )