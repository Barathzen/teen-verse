from pydantic import BaseModel
from datetime import datetime

class UserResponse(BaseModel):

    id: int

    name: str

    email: str

    role: str

    guardian_name: str | None = None

    guardian_email: str | None = None

    created_at: datetime

    class Config:
        from_attributes = True

