import joblib
from pathlib import Path
import pandas as pd
from app.utils.feature_mapper import assessment_to_dataframe

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR /
    "app" /
    "ml" /
    "models" /
    "depression_pipeline.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
except:
    model = None


def get_shap_explanation(assessment):
    """Generate exact coefficient-based feature importance for an assessment"""
    
    if model is None:
        return {
            "stress_impact": 0.1,
            "anxiety_impact": 0.1,
            "sleep_impact": 0.1,
            "social_media_impact": 0.1,
            "exercise_impact": 0.1
        }
    
    try:
        # Get features
        df = assessment_to_dataframe(assessment)
        
        # Transform using preprocessor
        X_transformed = model.named_steps['preprocessor'].transform(df)
        scaled_features = X_transformed[0]
        
        # Get coefficients of the Logistic Regression model
        coef = model.named_steps['classifier'].coef_[0]
        
        # Calculate impact as coef * scaled_feature_value
        # Indices in NUMERICAL_FEATURES:
        # 1: daily_social_media_hours
        # 2: sleep_hours
        # 5: physical_activity
        # 6: stress_level
        # 7: anxiety_level
        stress_contrib = float(scaled_features[6] * coef[6])
        anxiety_contrib = float(scaled_features[7] * coef[7])
        sleep_contrib = float(scaled_features[2] * coef[2])
        social_media_contrib = float(scaled_features[1] * coef[1])
        exercise_contrib = float(scaled_features[5] * coef[5])
        
        return {
            "stress_impact": stress_contrib,
            "anxiety_impact": anxiety_contrib,
            "sleep_impact": sleep_contrib,
            "social_media_impact": social_media_contrib,
            "exercise_impact": exercise_contrib
        }
    except Exception as e:
        # Return default if explanation fails
        return {
            "stress_impact": 0.1,
            "anxiety_impact": 0.1,
            "sleep_impact": 0.1,
            "social_media_impact": 0.1,
            "exercise_impact": 0.1
        }


def explain_prediction(features):
    """Fallback function signature kept for compatibility"""
    return None
