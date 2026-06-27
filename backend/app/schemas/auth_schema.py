"""Authentication schemas — request/response models with validation."""

from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class RegisterRequest(BaseModel):
    """User registration request with validation."""

    name: str = Field(
        ..., min_length=2, max_length=100,
        description="User's display name (2-100 characters).",
    )
    email: EmailStr = Field(
        ..., description="Valid email address.",
    )
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="Password (8-128 characters, must include a digit).",
    )
    role: str = Field(
        default="user",
        description="Role is always set to 'user' on registration.",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty")
        if not re.match(r"^[\w\s.\-']+$", cleaned):
            raise ValueError("Name contains invalid characters")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        return v


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr = Field(
        ..., description="Registered email address.",
    )
    password: str = Field(
        ..., min_length=1,
        description="Account password.",
    )


class TokenResponse(BaseModel):
    """JWT token response returned after successful auth."""

    access_token: str = Field(
        ..., description="JWT access token.",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer').",
    )


class GoogleLoginRequest(BaseModel):
    """Google OAuth login request."""

    email: EmailStr = Field(
        ..., description="Google account email.",
    )
    name: str = Field(
        ..., min_length=1, max_length=100,
        description="Google display name.",
    )
    uid: str = Field(
        ..., min_length=1, max_length=255,
        description="Firebase UID from Google auth.",
    )
