from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.core.database import Base

#Predictions

class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id")
    )

    risk_score = Column(Float)

    risk_category = Column(String)

    predicted_label = Column(Integer)

    confidence_score = Column(Float)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    assessment = relationship(
        "Assessment"
    )