def simulate_changes(
    original_features,
    updated_features
):

    current_result = predict_risk(
        original_features
    )

    future_result = predict_risk(
        updated_features
    )

    return {
        "current_risk":
            current_result["risk_score"],

        "future_risk":
            future_result["risk_score"],

        "risk_reduction":
            current_result["risk_score"]
            - future_result["risk_score"]
    }

