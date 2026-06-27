"""Persona schemas — response models for persona classification."""

from pydantic import BaseModel, Field


class PersonaResponse(BaseModel):
    """Response schema for a classified persona."""

    cluster_id: int = Field(
        ..., description="K-Means cluster identifier (0-3)."
    )
    persona_name: str = Field(
        ..., description="Human-readable persona label.",
        examples=["Healthy Balanced", "Digital Addict", "Academic Burnout", "Socially Isolated"],
    )

    class Config:
        from_attributes = True
