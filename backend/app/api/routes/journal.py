import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.chatbot_service import _get_client
from app.core.config import settings
from app.services.assessment_service import create_assessment
from app.schemas.assessment_schema import AssessmentCreate

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/journal",
    tags=["Journaling"],
)

class JournalRequest(BaseModel):
    entry: str

class JournalResponse(BaseModel):
    message: str
    assessment_id: int


@router.post("/", response_model=JournalResponse)
def submit_journal_entry(
    request: JournalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Passive Sentiment Journaling.
    Takes a raw diary entry, uses an LLM to extract stress, anxiety, sleep, etc.,
    and automatically creates an assessment.
    """
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key missing")

    system_prompt = """
    You are an AI that extracts mental health metrics from teenager diary entries.
    Analyze the text and output a STRICT JSON object matching these exact fields.
    Guess the values based on the tone and context if not explicitly mentioned.

    Expected JSON schema:
    {
        "stress_level": number (0-100),
        "anxiety_level": number (0-100),
        "addiction_level": number (0-100),
        "social_interaction_level": string ("low", "medium", or "high"),
        "sleep_hours": number (0-24),
        "social_media_hours": number (0-24),
        "screen_time_before_sleep": number (0-24),
        "academic_performance": number (0-100),
        "physical_activity": number (0-10)
    }

    Return ONLY the raw JSON object, no markdown formatting, no backticks.
    """

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.entry},
        ],
        "temperature": 0.1,
        "max_tokens": 150,
    }

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_HTTP_REFERER,
        "X-Title": settings.OPENROUTER_APP_TITLE,
    }

    try:
        client = _get_client()
        response = client.post(
            settings.OPENROUTER_API_BASE_URL, json=payload, headers=headers
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        # Clean up any potential markdown backticks returned by mistake
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()

        extracted_data = json.loads(content)
        
        # Create an assessment using the extracted data
        assessment_data = AssessmentCreate(
            name="Journal Entry Analysis",
            age=16, # Default age if not provided
            gender="Prefer not to say",
            platform_usage="Instagram",
            **extracted_data
        )
        
        assessment = create_assessment(db, current_user.id, assessment_data)
        
        logger.info(f"Journal entry processed for user {current_user.id}, created assessment {assessment.id}")
        
        return {
            "message": "Journal entry processed and assessment created successfully.",
            "assessment_id": assessment.id
        }

    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON from LLM: {content}")
        raise HTTPException(status_code=502, detail="Failed to analyze journal entry.")
    except Exception as e:
        logger.exception("Journal processing error")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
