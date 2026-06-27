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

def classify(dataframe):
    # K-Means clustering still outputs 0-3
    cluster = int(pipeline.predict(dataframe)[0])
    
    # Extract values for sub-classification
    sleep = float(dataframe['sleep_hours'].iloc[0])
    stress = float(dataframe['stress_level'].iloc[0])
    anxiety = float(dataframe['anxiety_level'].iloc[0])
    academic = float(dataframe['academic_performance'].iloc[0])
    
    # Sub-classify to create 8 distinct personas (Constellations)
    persona_name = "Unknown"
    
    if cluster == 0:
        if stress < 5 and anxiety < 5:
            persona_name = "Mindful Achiever"
        else:
            persona_name = "Zen Surfer"
            
    elif cluster == 1:
        if sleep < 6:
            persona_name = "Midnight Scroller"
        else:
            persona_name = "Social Media Junkie"
            
    elif cluster == 2:
        if academic > 80:
            persona_name = "Overworked Scholar"
        else:
            persona_name = "Stressed Student"
            
    elif cluster == 3:
        if anxiety > 6:
            persona_name = "Silent Observer"
        else:
            persona_name = "Lone Wolf"

    return {
        "cluster_id": cluster,
        "persona_name": persona_name
    }

