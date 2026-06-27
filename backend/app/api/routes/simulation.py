"""
Simulation routes.

Improvements:
- Replaced Python-level list comprehension for assessment ID filtering with
  a proper subquery (1 query instead of 2)
- Extracted SimulationResponse construction to a helper method (DRY)
- Added structured logging
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.simulation_schema import (
    SimulationRequest,
    SimulationUpdate,
    SimulationResponse,
)
from app.models.user import User
from app.models.assessment import Assessment
from app.models.simulation import Simulation
from app.utils.feature_mapper import assessment_to_dataframe
from app.ml.inference.predictor import predict as ml_predict

router = APIRouter(
    prefix="/simulation",
    tags=["Simulation"],
)

logger = logging.getLogger(__name__)


def _to_response(sim: Simulation) -> SimulationResponse:
    """Build a SimulationResponse from a Simulation ORM instance (DRY)."""
    return SimulationResponse(
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
        created_at=sim.created_at,
    )


@router.get("/", response_model=list[SimulationResponse])
def list_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List simulations. Admin sees all; regular users see only those linked to their assessments."""
    try:
        query = db.query(Simulation).order_by(Simulation.created_at.desc())

        if current_user.role != "admin":
            # Subquery instead of fetching all assessments into Python and filtering
            user_assessment_ids = (
                db.query(Assessment.id)
                .filter(Assessment.user_id == current_user.id)
                .subquery()
            )
            query = query.filter(
                Simulation.assessment_id.in_(user_assessment_ids)
            )

        return [_to_response(sim) for sim in query.all()]
    except Exception as e:
        logger.exception("Failed to list simulations")
        raise HTTPException(
            status_code=500, detail=f"Failed to list simulations: {e}"
        )


@router.post("/", response_model=SimulationResponse)
def simulate(
    request: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == request.assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if assessment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to run simulations for this assessment.",
        )

    try:
        # Get original prediction
        original_df = assessment_to_dataframe(assessment)
        original_result = ml_predict(original_df)
        current_risk = original_result["risk_score"]

        # Calibrated delta-based adjustment so the simulation responds in the
        # direction a user would expect: better habits lower risk, worse habits
        # raise it. We still anchor the simulation to the current ML risk score.
        sleep_delta = request.sleep_hours - assessment.sleep_hours
        social_media_delta = assessment.social_media_hours - request.social_media_hours
        activity_delta = request.physical_activity - assessment.physical_activity

        risk_adjustment = (
            sleep_delta * 4.0
            + social_media_delta * 5.0
            + activity_delta * 3.0
        )

        future_risk = max(0.0, min(100.0, current_risk - risk_adjustment))

        # Save simulation to database
        simulation = Simulation(
            assessment_id=assessment.id,
            name=request.name or "",
            created_by=current_user.id,
            current_risk=float(current_risk),
            future_risk=float(future_risk),
            modified_sleep_hours=float(request.sleep_hours),
            modified_social_media_hours=float(request.social_media_hours),
            modified_physical_activity=float(request.physical_activity),
        )

        db.add(simulation)
        db.commit()
        db.refresh(simulation)

        logger.info(
            "Simulation %d created for assessment %d by user %d",
            simulation.id,
            assessment.id,
            current_user.id,
        )
        return _to_response(simulation)
    except Exception as e:
        logger.exception("Simulation failed")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")


@router.patch("/{simulation_id}", response_model=SimulationResponse)
def update_simulation(
    simulation_id: int,
    update_data: SimulationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update simulation fields (admin only). Currently supports renaming."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can update simulations.",
        )

    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(simulation, key, value)

    db.commit()
    db.refresh(simulation)

    logger.info("Simulation %d updated by admin %d", simulation_id, current_user.id)
    return _to_response(simulation)


@router.delete("/{simulation_id}")
def delete_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a simulation. Admin can delete any; regular users can only delete their own."""
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # RBAC: admin can delete any, user can only delete own
    if current_user.role != "admin" and simulation.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this simulation",
        )

    db.delete(simulation)
    db.commit()

    logger.info("Simulation %d deleted by user %d", simulation_id, current_user.id)
    return {"message": "Simulation deleted successfully"}
