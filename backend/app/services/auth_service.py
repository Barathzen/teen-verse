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

    # Public registration always creates regular users.
    # Admin access is granted later from the admin portal.
    user_role = "user"

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


def google_login_user(db: Session, email: str, name: str, uid: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user if it doesn't exist
        user = User(
            name=name,
            email=email,
            password=hash_password(uid), # Use UID as dummy password since authentication is managed by Google
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

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
