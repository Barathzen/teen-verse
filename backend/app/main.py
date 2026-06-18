from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    assessment,
    simulation,
    persona,
    analytics,
    chatbot,
)
from app.api import prediction
from app.core.database import Base, engine
from app.models import *


app = FastAPI(title="TeenVerse API")

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

app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(prediction.router)
app.include_router(simulation.router)
app.include_router(persona.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)


@app.get("/")
def health():
    return {"status": "running"}


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
