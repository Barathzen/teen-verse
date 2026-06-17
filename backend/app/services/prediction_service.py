import joblib

model = joblib.load(
    "app/ml/models/depression_pipeline.pkl"
)

def predict_risk(
    features
):

    prediction = model.predict(
        [features]
    )[0]

    probability = model.predict_proba(
        [features]
    )[0][1]

    risk_score = round(
        probability * 100,
        2
    )

    return {
        "prediction": int(prediction),
        "risk_score": risk_score,
        "confidence_score": probability
    }

def get_risk_category(
    risk_score: float
):
    if risk_score < 25:
        return "Low"

    elif risk_score < 50:
        return "Medium"

    elif risk_score < 75:
        return "High"

    return "Critical"


from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.models.assessment import Assessment
from app.utils.feature_mapper import assessment_to_dataframe
from app.ml.inference.predictor import predict as _predict_df
from fastapi import HTTPException


def create_prediction(
    db: Session,
    assessment_id: int
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")

    df = assessment_to_dataframe(assessment)

    result = _predict_df(df)

    prediction = Prediction(
        assessment_id=assessment.id,
        risk_score=result.get("risk_score"),
        risk_category=get_risk_category(result.get("risk_score")),
        predicted_label=result.get("prediction"),
        confidence_score=result.get("confidence_score")
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction

