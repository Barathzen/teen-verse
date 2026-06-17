import pandas as pd
import joblib

from pathlib import Path

from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)

from sklearn.model_selection import (
    train_test_split
)

from xgboost import XGBClassifier

from app.ml.preprocessing.feature_pipeline import (
    build_preprocessor,
    TARGET_COLUMN
)

BASE_DIR = Path(__file__).resolve().parents[3]

DATASET_PATH = (
    BASE_DIR /
    "datasets" /
    "Teen_Mental_Health_Dataset.csv"
)

MODEL_PATH = (
    BASE_DIR /
    "app" /
    "ml" /
    "models" /
    "depression_pipeline.pkl"
)

def train():

    df = pd.read_csv(DATASET_PATH)

    X = df.drop(
        columns=[TARGET_COLUMN]
    )

    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y
        )
    )

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor()
            ),
            (
                "classifier",
                XGBClassifier(
                    n_estimators=300,
                    max_depth=5,
                    learning_rate=0.05,
                    random_state=42
                )
            )
        ]
    )

    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    probabilities = (
        pipeline.predict_proba(X_test)
        [:, 1]
    )

    print(
        f"Accuracy: "
        f"{accuracy_score(y_test,predictions):.4f}"
    )

    print(
        f"Precision: "
        f"{precision_score(y_test,predictions):.4f}"
    )

    print(
        f"Recall: "
        f"{recall_score(y_test,predictions):.4f}"
    )

    print(
        f"F1 Score: "
        f"{f1_score(y_test,predictions):.4f}"
    )

    print(
        f"ROC AUC: "
        f"{roc_auc_score(y_test,probabilities):.4f}"
    )

    joblib.dump(
        pipeline,
        MODEL_PATH
    )

    print("Model saved.")

if __name__ == "__main__":
    train()