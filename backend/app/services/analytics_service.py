from sqlalchemy import func
from app.models.user import User
from app.models.assessment import Assessment


def get_dashboard_metrics(
    db
):

    total_users = (
        db.query(func.count(User.id))
        .scalar()
    )

    total_assessments = (
        db.query(func.count(Assessment.id))
        .scalar()
    )

    return {
        "total_users":
            total_users,

        "total_assessments":
            total_assessments
    }

