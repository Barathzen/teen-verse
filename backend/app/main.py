"""
TeenVerse backend entry point.

Sets up FastAPI application with CORS, routes, database tables, and the
default admin seed.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    assessment,
    simulation,
    persona,
    analytics,
    chatbot,
    journal,
    questionnaire,
)
from app.api import prediction
from app.core.database import Base, engine, SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User  # noqa: F401
from app.models.assessment import Assessment  # noqa: F401
from app.models.prediction import Prediction  # noqa: F401
from app.models.persona import Persona  # noqa: F401
from app.models.simulation import Simulation  # noqa: F401

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("teenverse")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TeenVerse API",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Register global exception handlers
from app.core.exception_handlers import register_exception_handlers
register_exception_handlers(app)

# ---------------------------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------------------------
# The frontend runs on http://localhost:3000 while the API runs on
# http://localhost:8000.  To allow the browser to make requests from the
# frontend to the backend we enable CORS for all origins (development only).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(prediction.router)
app.include_router(simulation.router)
app.include_router(persona.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)
app.include_router(journal.router)
app.include_router(questionnaire.router)


@app.get("/", tags=["Health"])
def health():
    """Health check endpoint."""
    return {"status": "running", "version": "1.1.0"}


# ---------------------------------------------------------------------------
# Startup: create tables + seed admin
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    logger.info("Creating database tables …")
    Base.metadata.create_all(bind=engine)
    _seed_default_admin()
    logger.info("Startup complete.")


def _seed_default_admin() -> None:
    """Create the default admin user from env vars if it doesn't exist yet."""
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD or not settings.ADMIN_NAME:
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            if existing.role != "admin":
                existing.role = "admin"
                db.commit()
                logger.info("Promoted %s to admin.", settings.ADMIN_EMAIL)
            return

        db.add(
            User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                password=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
            )
        )
        db.commit()
        logger.info("Seeded admin user: %s", settings.ADMIN_EMAIL)
    except Exception:
        db.rollback()
        logger.exception("Failed to seed admin user")
    finally:
        db.close()
