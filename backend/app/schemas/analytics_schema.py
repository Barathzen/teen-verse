from pydantic import BaseModel

class DashboardOverview(BaseModel):

    total_users: int

    total_assessments: int

    average_risk_score: float

    high_risk_users: int

class RiskDistribution(BaseModel):

    low: int

    medium: int

    high: int

    critical: int

class PersonaDistribution(BaseModel):

    persona_name: str

    count: int

