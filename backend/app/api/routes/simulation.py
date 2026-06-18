from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.api.deps import get_db, get_current_user
from app.schemas.simulation_schema import (
    SimulationRequest,
    SimulationUpdate,
    SimulationResponse
)
from app.models.user import User
from app.models.assessment import Assessment
from app.models.simulation import Simulation
from app.utils.feature_mapper import assessment_to_dataframe
from app.ml.inference.predictor import predict as ml_predict

router = APIRouter(
    prefix="/simulation",
    tags=["Simulation"]
)


@router.get("/", response_model=list[SimulationResponse])
def list_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List simulations. Admin sees all; regular users see only those linked to their assessments."""
    try:
        if current_user.role == "admin":
            simulations = db.query(Simulation).order_by(Simulation.created_at.desc()).all()
        else:
            # Get user's assessment IDs, then filter simulations
            user_assessment_ids = [
                a.id for a in db.query(Assessment).filter(
                    Assessment.user_id == current_user.id
                ).all()
            ]
            simulations = db.query(Simulation).filter(
                Simulation.assessment_id.in_(user_assessment_ids)
            ).order_by(Simulation.created_at.desc()).all()
        
        # Calculate risk_reduction for response
        results = []
        for sim in simulations:
            results.append(SimulationResponse(
                id=sim.id,
                assessment_id=sim.assessment_id,
                name=sim.name or "",
                created_by=sim.created_by,
                current_risk=sim.current_risk,
                future_risk=sim.future_risk,
                risk_reduction=sim.current_risk - sim.future_risk,
                modified_sleep_hours=sim.modified_sleep_hours,
                modified_social_media_hours=sim.modified_social_media_hours,
                modified_physical_activity=sim.modified_physical_activity,
                created_at=sim.created_at
            ))
        
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list simulations: {str(e)}"
        )


@router.post("/", response_model=SimulationResponse)
def simulate(
    request: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get the original assessment
    assessment = db.query(Assessment).filter(
        Assessment.id == request.assessment_id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to run simulations for this assessment."
        )
    
    try:
        # Get original prediction
        original_df = assessment_to_dataframe(assessment)
        original_result = ml_predict(original_df)
        current_risk = original_result["risk_score"]
        
        # Create modified assessment data
        modified_data = {
            "age": assessment.age,
            "gender": assessment.gender,
            "daily_social_media_hours": request.social_media_hours,
            "sleep_hours": request.sleep_hours,
            "screen_time_before_sleep": assessment.screen_time_before_sleep,
            "academic_performance": assessment.academic_performance,
            "physical_activity": request.physical_activity,
            "stress_level": assessment.stress_level,
            "anxiety_level": assessment.anxiety_level,
            "addiction_level": assessment.addiction_level,
            "social_interaction_level": assessment.social_interaction_level,
            "platform_usage": getattr(assessment, 'platform_usage', 'Instagram')
        }
        
        # Create modified dataframe
        modified_df = pd.DataFrame([modified_data])
        modified_result = ml_predict(modified_df)
        future_risk = modified_result["risk_score"]
        
        # Calculate risk reduction
        risk_reduction = current_risk - future_risk
        
        # Save simulation to database
        simulation = Simulation(
            assessment_id=assessment.id,
            name=request.name or "",
            created_by=current_user.id,
            current_risk=current_risk,
            future_risk=future_risk,
            modified_sleep_hours=request.sleep_hours,
            modified_social_media_hours=request.social_media_hours,
            modified_physical_activity=request.physical_activity
        )
        
        db.add(simulation)
        db.commit()
        db.refresh(simulation)
        
        return SimulationResponse(
            id=simulation.id,
            assessment_id=simulation.assessment_id,
            name=simulation.name or "",
            created_by=simulation.created_by,
            current_risk=current_risk,
            future_risk=future_risk,
            risk_reduction=risk_reduction,
            modified_sleep_hours=simulation.modified_sleep_hours,
            modified_social_media_hours=simulation.modified_social_media_hours,
            modified_physical_activity=simulation.modified_physical_activity,
            created_at=simulation.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )


@router.patch("/{simulation_id}", response_model=SimulationResponse)
def update_simulation(
    simulation_id: int,
    update_data: SimulationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update simulation fields (admin only). Currently supports renaming."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can update simulations."
        )
    
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )
    
    # Apply updates
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(simulation, key, value)
    
    db.commit()
    db.refresh(simulation)
    
    return SimulationResponse(
        id=simulation.id,
        assessment_id=simulation.assessment_id,
        name=simulation.name or "",
        created_by=simulation.created_by,
        current_risk=simulation.current_risk,
        future_risk=simulation.future_risk,
        risk_reduction=simulation.current_risk - simulation.future_risk,
        modified_sleep_hours=simulation.modified_sleep_hours,
        modified_social_media_hours=simulation.modified_social_media_hours,
        modified_physical_activity=simulation.modified_physical_activity,
        created_at=simulation.created_at
    )


@router.delete("/{simulation_id}")
def delete_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a simulation. Admin can delete any; regular users can only delete their own."""
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )
    
    # RBAC: admin can delete any, user can only delete own
    if current_user.role != "admin" and simulation.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this simulation"
        )
    
    db.delete(simulation)
    db.commit()
    
    return {"message": "Simulation deleted successfully"}
