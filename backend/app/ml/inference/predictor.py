import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BASE_DIR /
    "app" /
    "ml" /
    "models" /
    "depression_pipeline.pkl"
)

# Load the trained model pipeline
pipeline = joblib.load(
    MODEL_PATH
)

def predict(dataframe):

    prediction = (
        pipeline.predict(dataframe)
        [0]
    )

    probability = (
        pipeline.predict_proba(
            dataframe
        )[0][1]
    )

    return {
        "prediction": int(prediction),
        "risk_score": float(round(
            probability * 100,
            2
        )),
        "confidence_score": float(round(
            probability,
            4
        )),
    }