from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from app.ml.preprocessing.feature_pipeline import TARGET_COLUMN

BASE_DIR = Path(__file__).resolve().parents[3]

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "Teen_Mental_Health_Dataset.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "app"
    / "ml"
    / "models"
    / "depression_pipeline.pkl"
)


def evaluate():
    df = pd.read_csv(DATASET_PATH)

    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]

    pipeline = joblib.load(MODEL_PATH)

    y_pred = pipeline.predict(X)
    y_prob = pipeline.predict_proba(X)[:, 1]

    print("\n========== MODEL EVALUATION ==========\n")

    print(f"Accuracy : {accuracy_score(y, y_pred):.4f}")
    print(f"Precision: {precision_score(y, y_pred):.4f}")
    print(f"Recall   : {recall_score(y, y_pred):.4f}")
    print(f"F1 Score : {f1_score(y, y_pred):.4f}")
    print(f"ROC AUC  : {roc_auc_score(y, y_prob):.4f}")

    print("\nConfusion Matrix")
    print(confusion_matrix(y, y_pred))

    print("\nClassification Report")
    print(classification_report(y, y_pred))


if __name__ == "__main__":
    evaluate()