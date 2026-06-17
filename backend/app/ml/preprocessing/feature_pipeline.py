from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

NUMERICAL_FEATURES = [
    "age",
    "daily_social_media_hours",
    "sleep_hours",
    "screen_time_before_sleep",
    "academic_performance",
    "physical_activity",
    "stress_level",
    "anxiety_level",
    "addiction_level"
]

CATEGORICAL_FEATURES = [
    "gender",
    "platform_usage",
    "social_interaction_level"
]

TARGET_COLUMN = "depression_label"


def build_preprocessor():

    numeric_transformer = Pipeline(
        steps=[
            ("scaler", StandardScaler())
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore"
                )
            )
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                numeric_transformer,
                NUMERICAL_FEATURES
            ),
            (
                "cat",
                categorical_transformer,
                CATEGORICAL_FEATURES
            )
        ]
    )

    return preprocessor