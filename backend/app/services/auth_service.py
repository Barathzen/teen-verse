import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.models.user import User

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

async def register_user(
    db: AsyncSession,
    name: str,
    email: str,
    password: str,
    role: str = "user"
):

    result = await db.execute(
        select(User)
        .filter(User.email == email)
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise ValueError(
            "Email already exists"
        )

    # Public registration always creates regular users.
    # Admin access is granted later from the admin portal.
    user_role = "user"

    hashed_pw = await asyncio.to_thread(hash_password, password)

    user = User(
        name=name,
        email=email,
        password=hashed_pw,
        role=user_role
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user

async def login_user(
    db: AsyncSession,
    email: str,
    password: str
):

    result = await db.execute(
        select(User)
        .filter(User.email == email)
    )
    user = result.scalars().first()

    if not user:
        raise ValueError(
            "Invalid credentials"
        )

    is_valid = await asyncio.to_thread(verify_password, password, user.password)
    if not is_valid:
        raise ValueError(
            "Invalid credentials"
        )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return token


async def google_login_user(db: AsyncSession, email: str, name: str, uid: str):
    result = await db.execute(
        select(User).filter(User.email == email)
    )
    user = result.scalars().first()
    if not user:
        # Create user if it doesn't exist
        hashed_pw = await asyncio.to_thread(hash_password, uid)
        user = User(
            name=name,
            email=email,
            password=hashed_pw, # Use UID as dummy password since authentication is managed by Google
            role="user"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return token

def update_user_role(
    db: Session,
    user_id: int,
    role: str
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    cleaned_role = role.lower().strip()
    if cleaned_role not in {"user", "admin"}:
        raise ValueError("Role must be either user or admin")

    user.role = cleaned_role
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session):
    return db.query(User).order_by(User.id.asc()).all()
