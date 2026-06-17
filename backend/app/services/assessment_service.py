from sqlalchemy.orm import Session

from app.models.assessment import Assessment

def create_assessment(
    db: Session,
    user_id: int,
    assessment_data
):

    assessment = Assessment(
        user_id=user_id,
        **assessment_data.model_dump()
    )

    db.add(assessment)

    db.commit()

    db.refresh(assessment)

    return assessment

def get_assessment(
    db: Session,
    assessment_id: int
):

    return (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id
        )
        .first()
    )

