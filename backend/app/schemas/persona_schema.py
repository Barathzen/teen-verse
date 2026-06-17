from pydantic import BaseModel

class PersonaResponse(BaseModel):

    cluster_id: int

    persona_name: str

