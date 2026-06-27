"""
Prediction service — creates predictions and auto-generates personas.

When a prediction is created for an assessment, a persona is automatically
classified using the K-Means clustering pipeline and saved to the database.
"""

import logging

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.prediction import Prediction
from app.models.persona import Persona
from app.models.assessment import Assessment
from app.utils.feature_mapper import assessment_to_dataframe
from app.ml.inference.predictor import predict as _predict_df
from app.ml.inference.persona_classifier import classify as _classify_persona


logger = logging.getLogger(__name__)


# ── Legacy standalone functions (kept for backward compatibility) ──────────

import joblib

model = joblib.load("app/ml/models/depression_pipeline.pkl")


def predict_risk(features):
    prediction = model.predict([features])[0]
    probability = model.predict_proba([features])[0][1]
    risk_score = round(probability * 100, 2)

    return {
        "prediction": int(prediction),
        "risk_score": float(risk_score),
        "confidence_score": float(probability),
    }


def get_risk_category(risk_score: float) -> str:
    """Map a 0-100 risk score to a human-readable category."""
    if risk_score < 25:
        return "Low"
    elif risk_score < 50:
        return "Medium"
    elif risk_score < 75:
        return "High"
    return "Critical"


# ── Main service functions ────────────────────────────────────────────────


def create_prediction(db: Session, assessment_id: int) -> Prediction:
    """Create a prediction for an assessment and auto-generate its persona.

    Args:
        db: SQLAlchemy session.
        assessment_id: ID of the assessment to predict.

    Returns:
        The created Prediction ORM instance.

    Raises:
        HTTPException: If the assessment is not found.
    """
    from app.models.user import User
    
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")

    df = assessment_to_dataframe(assessment)

    # ── Risk prediction ───────────────────────────────────────────────
    result = _predict_df(df)

    prediction = Prediction(
        assessment_id=assessment.id,
        risk_score=float(result.get("risk_score", 0)),
        risk_category=get_risk_category(result.get("risk_score", 0)),
        predicted_label=int(result.get("prediction", 0)),
        confidence_score=float(result.get("confidence_score", 0)),
    )

    db.add(prediction)
    db.flush()  # Get prediction.id before persona creation

    # ── Auto-generate persona ─────────────────────────────────────────
    _auto_generate_persona(db, assessment)

    db.commit()
    db.refresh(prediction)

    logger.info(
        "Prediction %d created for assessment %d (risk=%.1f, category=%s)",
        prediction.id,
        assessment.id,
        prediction.risk_score,
        prediction.risk_category,
    )

    # ── Trusted Guardian Circuit Breaker ──────────────────────────────
    if prediction.risk_score >= 75:
        user = db.query(User).filter(User.id == assessment.user_id).first()
        if user and user.guardian_email:
            logger.warning(
                "🚨 CIRCUIT BREAKER TRIGGERED: User %d hit critical risk (%.1f). "
                "Simulating alert sent to Guardian: %s (%s)",
                user.id, prediction.risk_score, user.guardian_name, user.guardian_email
            )

    return prediction


def _auto_generate_persona(db: Session, assessment: Assessment) -> None:
    """Classify and store a persona for the given assessment.

    If a persona already exists for this assessment, it is skipped.
    Failures are logged but do not block prediction creation.
    """
    # Skip if persona already exists
    existing = (
        db.query(Persona)
        .filter(Persona.assessment_id == assessment.id)
        .first()
    )
    if existing:
        logger.debug(
            "Persona already exists for assessment %d, skipping",
            assessment.id,
        )
        return

    try:
        df = assessment_to_dataframe(assessment)
        result = _classify_persona(df)

        persona = Persona(
            assessment_id=assessment.id,
            cluster_id=int(result["cluster_id"]),
            persona_name=str(result["persona_name"]),
        )
        db.add(persona)
        db.flush()

        logger.info(
            "Persona '%s' (cluster %d) auto-generated for assessment %d",
            persona.persona_name,
            persona.cluster_id,
            assessment.id,
        )
    except Exception:
        logger.exception(
            "Failed to auto-generate persona for assessment %d "
            "(prediction will still be saved)",
            assessment.id,
        )
