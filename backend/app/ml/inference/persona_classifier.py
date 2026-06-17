import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BASE_DIR /
    "app" /
    "ml" /
    "models" /
    "persona_pipeline.pkl"
)

pipeline = joblib.load(
    MODEL_PATH
)

PERSONAS = {

    0: "Healthy Balanced",

    1: "Digital Addict",

    2: "Academic Burnout",

    3: "Socially Isolated"
}

def classify(dataframe):

    cluster = (
        pipeline.predict(
            dataframe
        )[0]
    )

    return {
        "cluster_id": int(cluster),
        "persona_name":
            PERSONAS.get(
                cluster,
                "Unknown"
            )
    }

