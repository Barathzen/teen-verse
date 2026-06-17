from sqlalchemy.orm import Session

from app.models.user import User

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

def register_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str = "user"
):

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise ValueError(
            "Email already exists"
        )

    # Ensure role is lowercased and clean
    user_role = role.lower() if role else "user"

    user = User(
        name=name,
        email=email,
        password=hash_password(password),
        role=user_role
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user

def login_user(
    db: Session,
    email: str,
    password: str
):

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise ValueError(
            "Invalid credentials"
        )

    if not verify_password(
        password,
        user.password
    ):
        raise ValueError(
            "Invalid credentials"
        )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return token

