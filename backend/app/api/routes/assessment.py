from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.assessment_schema import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse
)
from app.services.assessment_service import (
    create_assessment,
    get_assessment
)
from app.models.user import User
from app.models.assessment import Assessment
from app.models.prediction import Prediction

router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)


@router.post("/", response_model=AssessmentResponse)
def create_new_assessment(
    request: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators are authorized to add new assessments."
        )
    try:
        assessment = create_assessment(
            db,
            current_user.id,
            request
        )
        return assessment
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create assessment: {str(e)}"
        )


@router.get("/", response_model=list[AssessmentResponse])
def get_user_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if current_user.role == "admin":
            assessments = db.query(Assessment).order_by(Assessment.created_at.desc()).all()
        else:
            assessments = db.query(Assessment).filter(
                Assessment.user_id == current_user.id
            ).order_by(Assessment.created_at.desc()).all()
        
        for a in assessments:
            a.prediction = db.query(Prediction).filter(
                Prediction.assessment_id == a.id
            ).first()
            
        return assessments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list assessments: {str(e)}"
        )


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = get_assessment(db, assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )
    
    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this assessment"
        )
    
    # Attach prediction
    assessment.prediction = db.query(Prediction).filter(
        Prediction.assessment_id == assessment.id
    ).first()
    
    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    update_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update assessment fields (admin only). Currently supports renaming."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can update assessments."
        )
    
    assessment = get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )
    
    # Apply updates
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(assessment, key, value)
    
    db.commit()
    db.refresh(assessment)
    
    # Attach prediction
    assessment.prediction = db.query(Prediction).filter(
        Prediction.assessment_id == assessment.id
    ).first()
    
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an assessment. Admin can delete any; regular users can only delete their own."""
    assessment = get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )
    
    # RBAC: admin can delete any, user can only delete own
    if current_user.role != "admin" and assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this assessment"
        )
    
    # Delete related predictions first
    db.query(Prediction).filter(
        Prediction.assessment_id == assessment.id
    ).delete()
    
    db.delete(assessment)
    db.commit()
    
    return {"message": "Assessment deleted successfully"}