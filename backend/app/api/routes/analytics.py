"""
Analytics routes — admin-only dashboard data.

Improvements:
- Combined risk distribution into a single SQL query using CASE/WHEN
  (4 queries → 1)
- Added logging for request tracking
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.api.deps import get_db, get_current_user
from app.schemas.analytics_schema import (
    DashboardOverview,
    RiskDistribution,
    PersonaDistribution,
)
from app.models.user import User
from app.models.assessment import Assessment
from app.models.prediction import Prediction
from app.models.persona import Persona

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

logger = logging.getLogger(__name__)


def _require_admin(user: User) -> None:
    """Raise 403 if user is not an admin."""
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to access analytics.",
        )


@router.get("/overview", response_model=DashboardOverview)
def overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    try:
        total_users = db.query(func.count(User.id)).scalar() or 0
        total_assessments = db.query(func.count(Assessment.id)).scalar() or 0
        avg_risk = db.query(func.avg(Prediction.risk_score)).scalar() or 0.0
        high_risk_count = (
            db.query(func.count(Prediction.id))
            .filter(Prediction.risk_score >= 50)
            .scalar()
            or 0
        )

        logger.info("Dashboard overview served to user=%s", current_user.id)

        return {
            "total_users": total_users,
            "total_assessments": total_assessments,
            "average_risk_score": round(float(avg_risk), 2),
            "high_risk_users": high_risk_count,
        }
    except Exception as e:
        logger.exception("Failed to fetch overview")
        raise HTTPException(status_code=500, detail=f"Failed to get overview: {e}")


@router.get("/risk-distribution", response_model=RiskDistribution)
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return risk distribution using a single aggregated query (4→1)."""
    _require_admin(current_user)
    try:
        # Single query with CASE expressions instead of four separate COUNT queries
        row = db.query(
            func.count(case((Prediction.risk_score < 25, 1))).label("low"),
            func.count(
                case(
                    (
                        (Prediction.risk_score >= 25) & (Prediction.risk_score < 50),
                        1,
                    )
                )
            ).label("medium"),
            func.count(
                case(
                    (
                        (Prediction.risk_score >= 50) & (Prediction.risk_score < 75),
                        1,
                    )
                )
            ).label("high"),
            func.count(case((Prediction.risk_score >= 75, 1))).label("critical"),
        ).one()

        return {
            "low": row.low,
            "medium": row.medium,
            "high": row.high,
            "critical": row.critical,
        }
    except Exception as e:
        logger.exception("Failed to fetch risk distribution")
        raise HTTPException(
            status_code=500, detail=f"Failed to get risk distribution: {e}"
        )


@router.get("/persona-distribution")
def persona_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    try:
        results = (
            db.query(
                Persona.persona_name,
                func.count(Persona.id).label("count"),
            )
            .group_by(Persona.persona_name)
            .all()
        )

        return [
            {"persona_name": persona_name, "count": count}
            for persona_name, count in results
        ]
    except Exception as e:
        logger.exception("Failed to fetch persona distribution")
        raise HTTPException(
            status_code=500, detail=f"Failed to get persona distribution: {e}"
        )