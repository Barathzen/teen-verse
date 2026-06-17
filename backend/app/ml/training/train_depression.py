from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    roc_auc_score,
)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
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
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        stratify=y,
        random_state=42,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            (
                "classifier",
                LogisticRegression(
                    class_weight="balanced",
                    random_state=42,
                    max_iter=1000,
                ),
            ),
        ]
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    print("\n===== Evaluation =====")
    print(classification_report(y_test, y_pred))
    print(f"Accuracy : {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC AUC  : {roc_auc_score(y_test, y_prob):.4f}")

    joblib.dump(
        pipeline,
        MODEL_DIR / "depression_pipeline.pkl",
    )

    print("\nSaved depression_pipeline.pkl")


if __name__ == "__main__":
    train()