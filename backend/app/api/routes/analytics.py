from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.schemas.analytics_schema import (
    DashboardOverview,
    RiskDistribution,
    PersonaDistribution
)
from app.models.user import User
from app.models.assessment import Assessment
from app.models.prediction import Prediction
from app.models.persona import Persona

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/overview", response_model=DashboardOverview)
def overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to access analytics."
        )
    try:
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        total_assessments = db.query(func.count(Assessment.id)).scalar() or 0
        
        avg_risk = db.query(func.avg(Prediction.risk_score)).scalar() or 0.0
        average_risk_score = round(float(avg_risk), 2)
        
        high_risk_count = db.query(func.count(Prediction.id)).filter(
            Prediction.risk_score >= 50
        ).scalar() or 0
        
        return {
            "total_users": total_users,
            "total_assessments": total_assessments,
            "average_risk_score": average_risk_score,
            "high_risk_users": high_risk_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get overview: {str(e)}"
        )


@router.get("/risk-distribution", response_model=RiskDistribution)
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to access analytics."
        )
    try:
        low = db.query(func.count(Prediction.id)).filter(
            (Prediction.risk_score >= 0) & (Prediction.risk_score < 25)
        ).scalar() or 0
        
        medium = db.query(func.count(Prediction.id)).filter(
            (Prediction.risk_score >= 25) & (Prediction.risk_score < 50)
        ).scalar() or 0
        
        high = db.query(func.count(Prediction.id)).filter(
            (Prediction.risk_score >= 50) & (Prediction.risk_score < 75)
        ).scalar() or 0
        
        critical = db.query(func.count(Prediction.id)).filter(
            Prediction.risk_score >= 75
        ).scalar() or 0
        
        return {
            "low": low,
            "medium": medium,
            "high": high,
            "critical": critical
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get risk distribution: {str(e)}"
        )


@router.get("/persona-distribution")
def persona_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to access analytics."
        )
    try:
        results = db.query(
            Persona.persona_name,
            func.count(Persona.id).label('count')
        ).group_by(Persona.persona_name).all()
        
        return [
            {
                "persona_name": persona_name,
                "count": count
            }
            for persona_name, count in results
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get persona distribution: {str(e)}"
        )