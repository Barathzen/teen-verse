import pandas as pd

from app.ml.explainability.shap_engine import (
    explainer,
    preprocessor
)

def explain_prediction(
    dataframe: pd.DataFrame
):

    transformed = (
        preprocessor.transform(
            dataframe
        )
    )

    shap_values = (
        explainer.shap_values(
            transformed
        )
    )

    feature_names = (
        preprocessor
        .get_feature_names_out()
    )

    contributions = {}

    for feature, value in zip(
        feature_names,
        shap_values[0]
    ):

        contributions[
            feature
        ] = round(
            float(value),
            4
        )

    return contributions