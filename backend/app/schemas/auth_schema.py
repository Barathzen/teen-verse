from pydantic import BaseModel
from pydantic import EmailStr

class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str

    role: str = "user"

class LoginRequest(BaseModel):

    email: EmailStr

    password: str

class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"

class GoogleLoginRequest(BaseModel):
    email: EmailStr
    name: str
    uid: str
