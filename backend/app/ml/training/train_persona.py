
from pathlib import Path

import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline

from app.ml.preprocessing.feature_pipeline import (
    build_preprocessor,
    TARGET_COLUMN,
)

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------

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

MODEL_PATH = MODEL_DIR / "persona_pipeline.pkl"


# -------------------------------------------------------------------
# Training
# -------------------------------------------------------------------

def train():
    # Load dataset
    df = pd.read_csv(DATASET_PATH)

    # Remove target column
    X = df.drop(columns=[TARGET_COLUMN])

    # Build preprocessing + clustering pipeline
    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(),
            ),
            (
                "cluster",
                KMeans(
                    n_clusters=4,
                    random_state=42,
                    n_init=10,
                ),
            ),
        ]
    )

    # Train model
    pipeline.fit(X)

    # Save pipeline
    joblib.dump(pipeline, MODEL_PATH)

    print("=" * 50)
    print("Persona clustering model trained successfully.")
    print(f"Dataset Shape : {df.shape}")
    print(f"Clusters      : 4")
    print(f"Saved Model   : {MODEL_PATH}")
    print("=" * 50)


if __name__ == "__main__":
    train()

