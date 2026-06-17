from app.ml.preprocessing.feature_pipeline import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)

ALL_FEATURES = (
    NUMERICAL_FEATURES
    +
    CATEGORICAL_FEATURES
)

def build_importance_response(
    importances
):

    result = []

    for name, value in zip(
        ALL_FEATURES,
        importances
    ):

        result.append(
            {
                "feature": name,
                "importance":
                    round(
                        float(value),
                        4
                    )
            }
        )

    return sorted(
        result,
        key=lambda x:
        x["importance"],
        reverse=True
    )