def generate_recommendations(
    assessment
):

    recommendations = []

if assessment.sleep_hours < 7:

    recommendations.append(
        "Increase sleep to 7-8 hours."
    )

if assessment.stress_level > 7:

    recommendations.append(
        "Practice stress management."
    )

return recommendations

