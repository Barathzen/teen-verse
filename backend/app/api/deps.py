"""
Shared FastAPI dependencies — database sessions and auth.
"""

import logging
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import verify_token
from app.models.user import User

logger = logging.getLogger(__name__)
security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    """Yield a database session that is automatically closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract the current user from the Bearer token.

    Separates 'invalid token' from 'user not found' for clearer diagnostics.
    """
    token = credentials.credentials

    try:
        payload = verify_token(token)
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject claim",
            )
        user_id = int(sub)
    except (JWTError, ValueError) as exc:
        logger.warning("Invalid token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user