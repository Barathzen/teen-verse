from app.ml.explainability.shap_engine import (
    model
)

def get_global_importance():

    importance = (
        model.feature_importances_
    )

    return importance.tolist()

