from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.core.database import Base

class Simulation(Base):

    __tablename__ = "simulations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id")
    )

    name = Column(String, default="")

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    current_risk = Column(Float)

    future_risk = Column(Float)

    modified_sleep_hours = Column(Float)

    modified_social_media_hours = Column(Float)

    modified_physical_activity = Column(Float)

    ripple_story = Column(String, default="")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    assessment = relationship(
        "Assessment"
    )
