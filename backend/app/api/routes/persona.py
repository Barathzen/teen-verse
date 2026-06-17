from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.api.deps import get_db, get_current_user
from app.schemas.persona_schema import PersonaResponse
from app.models.user import User
from app.models.assessment import Assessment
from app.models.persona import Persona
from app.utils.feature_mapper import assessment_to_dataframe
from app.ml.inference.persona_classifier import classify

router = APIRouter(
    prefix="/persona",
    tags=["Persona"]
)


@router.get("/{assessment_id}", response_model=PersonaResponse)
def get_persona(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get the assessment
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )
    
    # Check authorization
    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this assessment"
        )
    
    # Check if persona already exists
    persona = db.query(Persona).filter(
        Persona.assessment_id == assessment_id
    ).first()
    
    if persona:
        return {
            "cluster_id": persona.cluster_id,
            "persona_name": persona.persona_name
        }
    
    try:
        # Get features and classify
        features_df = assessment_to_dataframe(assessment)
        result = classify(features_df)
        
        # Save persona to database
        persona = Persona(
            assessment_id=assessment.id,
            cluster_id=result["cluster_id"],
            persona_name=result["persona_name"]
        )
        
        db.add(persona)
        db.commit()
        db.refresh(persona)
        
        return {
            "cluster_id": persona.cluster_id,
            "persona_name": persona.persona_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Persona classification failed: {str(e)}"
        )