from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline

from app.ml.preprocessing.feature_pipeline import (
    TARGET_COLUMN,
    build_preprocessor,
)

BASE_DIR = Path(__file__).resolve().parents[3]

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "Teen_Mental_Health_Dataset.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "app"
    / "ml"
    / "models"
)

MODEL_DIR.mkdir(parents=True, exist_ok=True)


def train():
    df = pd.read_csv(DATASET_PATH)

    X = df.drop(columns=[TARGET_COLUMN])

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            (
                "detector",
                IsolationForest(
                    contamination=0.05,
                    random_state=42,
                ),
            ),
        ]
    )

    pipeline.fit(X)

    joblib.dump(
        pipeline,
        MODEL_DIR / "anomaly_pipeline.pkl",
    )

    print("Saved anomaly_pipeline.pkl")


if __name__ == "__main__":
    train()