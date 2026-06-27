from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Assessment(Base):

    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String, default="")

    age = Column(Integer)
    gender = Column(String)

    social_media_hours = Column(Float)
    platform_usage = Column(String, default="Instagram")
    sleep_hours = Column(Float)
    screen_time_before_sleep = Column(Float)
    academic_performance = Column(Float)
    physical_activity = Column(Float)
    stress_level = Column(Float)
    anxiety_level = Column(Float)
    addiction_level = Column(Float)
    social_interaction_level = Column(String, default="medium")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    prediction = relationship(
        "Prediction", uselist=False, back_populates="assessment", lazy="select"
    )
    persona = relationship(
        "Persona", uselist=False, back_populates="assessment", lazy="select"
    )