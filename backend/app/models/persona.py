from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.core.database import Base

class Persona(Base):

    __tablename__ = "personas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
        unique=True,
    )

    cluster_id = Column(Integer)

    persona_name = Column(String)

    assessment = relationship(
        "Assessment", back_populates="persona"
    )