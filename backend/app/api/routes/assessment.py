"""
Assessment routes.

Improvements:
- Eager-load predictions AND personas via joinedload to eliminate N+1 queries
- Cascade deletes clean up predictions, personas, and simulations
- Structured logging for audit trail
- Consistent error handling
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, get_current_user
from app.schemas.assessment_schema import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
)
from app.services.assessment_service import create_assessment, get_assessment
from app.models.user import User
from app.models.assessment import Assessment
from app.models.prediction import Prediction
from app.models.persona import Persona
from app.models.simulation import Simulation

router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"],
)

logger = logging.getLogger(__name__)


@router.post("/", response_model=AssessmentResponse)
def create_new_assessment(
    request: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        assessment = create_assessment(db, current_user.id, request)
        logger.info("Assessment %d created by user %d", assessment.id, current_user.id)
        return assessment
    except Exception as e:
        logger.exception("Failed to create assessment for user %d", current_user.id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create assessment: {e}",
        )


@router.get("/", response_model=list[AssessmentResponse])
def get_user_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List assessments with predictions and personas eagerly loaded (eliminates N+1)."""
    try:
        query = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.prediction),
                joinedload(Assessment.persona),
            )
            .order_by(Assessment.created_at.desc())
        )

        if current_user.role != "admin":
            query = query.filter(Assessment.user_id == current_user.id)

        return query.all()
    except Exception as e:
        logger.exception("Failed to list assessments")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list assessments: {e}",
        )


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.prediction),
            joinedload(Assessment.persona),
        )
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this assessment",
        )

    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    update_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update assessment fields. Currently supports renaming."""
    assessment = get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if current_user.role != "admin" and assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this assessment.",
        )

    # Apply updates
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(assessment, key, value)

    db.commit()
    db.refresh(assessment)

    # Eager-load relationships for response
    assessment = (
        db.query(Assessment)
        .options(
            joinedload(Assessment.prediction),
            joinedload(Assessment.persona),
        )
        .filter(Assessment.id == assessment.id)
        .first()
    )

    logger.info(
        "Assessment %d updated by admin %d: %s",
        assessment_id,
        current_user.id,
        update_dict,
    )
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an assessment and all related data (predictions, personas, simulations)."""
    assessment = get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # RBAC: admin can delete any, user can only delete own
    if current_user.role != "admin" and assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this assessment",
        )

    # Delete all related records (order matters for FK constraints)
    db.query(Simulation).filter(
        Simulation.assessment_id == assessment.id,
    ).delete()
    db.query(Persona).filter(
        Persona.assessment_id == assessment.id,
    ).delete()
    db.query(Prediction).filter(
        Prediction.assessment_id == assessment.id,
    ).delete()

    db.delete(assessment)
    db.commit()

    logger.info(
        "Assessment %d deleted by user %d (with all related records)",
        assessment_id,
        current_user.id,
    )
    return {"message": "Assessment deleted successfully"}
