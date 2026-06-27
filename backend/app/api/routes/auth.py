import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    GoogleLoginRequest
)
from app.schemas.user_schema import UserResponse
from app.services.auth_service import (
    register_user,
    login_user,
    list_users,
    update_user_role,
    google_login_user,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

logger = logging.getLogger(__name__)


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
        logger.exception("Registration failed")
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


@router.post("/google", response_model=TokenResponse)
def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    try:
        token = google_login_user(
            db,
            request.email,
            request.name,
            request.uid
        )
        return TokenResponse(access_token=token)
    except Exception as e:
        logger.exception("Google Login failed")
        raise HTTPException(
            status_code=500,
            detail=f"Google Login failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get("/users", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return list_users(db)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        role = payload.get("role")
        if not role:
            raise ValueError("Role is required")
        return update_user_role(db, user_id, role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
