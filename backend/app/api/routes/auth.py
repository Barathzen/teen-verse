from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse
)
from app.schemas.user_schema import UserResponse
from app.services.auth_service import (
    register_user,
    login_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=TokenResponse)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    try:
        user = register_user(
            db,
            request.name,
            request.email,
            request.password,
            request.role
        )
        token = login_user(
            db,
            request.email,
            request.password
        )
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    try:
        token = login_user(
            db,
            request.email,
            request.password
        )
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Login failed"
        )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user