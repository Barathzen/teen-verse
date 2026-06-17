import joblib

cluster_model = joblib.load(
    "app/ml/models/cluster_model.pkl"
)

PERSONAS = {

    0: "Healthy Balanced",

    1: "Digital Addict",

    2: "Academic Burnout",

    3: "Socially Isolated"
}


def classify_persona(
    features
):

    cluster = cluster_model.predict(
        [features]
    )[0]

    return {
        "cluster_id": int(cluster),
        "persona_name":
            PERSONAS.get(
                cluster,
                "Unknown"
            )
    }