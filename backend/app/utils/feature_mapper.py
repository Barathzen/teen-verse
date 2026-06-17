import pandas as pd


def assessment_to_dataframe(
    assessment
):

    return pd.DataFrame([
        {
            "age": assessment.age,
            "gender": assessment.gender,
            "daily_social_media_hours":
                assessment.social_media_hours,
            "platform_usage":
                assessment.platform_usage or "Instagram",
            "sleep_hours":
                assessment.sleep_hours,
            "screen_time_before_sleep":
                assessment.screen_time_before_sleep,
            "academic_performance":
                assessment.academic_performance / 25.0,
            "physical_activity":
                assessment.physical_activity,
            "stress_level":
                assessment.stress_level / 10.0,
            "anxiety_level":
                assessment.anxiety_level / 10.0,
            "addiction_level":
                assessment.addiction_level / 10.0,
            "social_interaction_level":
                assessment.social_interaction_level or "medium"
        }
    ])