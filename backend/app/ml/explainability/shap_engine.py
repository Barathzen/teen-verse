from pathlib import Path

import joblib
import shap

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BASE_DIR
    / "app"
    / "ml"
    / "models"
    / "depression_pipeline.pkl"
)

pipeline = joblib.load(
    MODEL_PATH
)

model = pipeline.named_steps[
    "classifier"
]

preprocessor = pipeline.named_steps[
    "preprocessor"
]

explainer = shap.TreeExplainer(
    model
)