import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.chatbot_service import _get_client
from app.core.config import settings
from app.services.assessment_service import create_assessment
from app.schemas.assessment_schema import AssessmentCreate

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/questionnaire",
    tags=["Questionnaire"],
)

class GenerateResponse(BaseModel):
    questions: List[str]

class AnalyzeRequest(BaseModel):
    questions: List[str]
    answers: List[str]
    assessment_data: AssessmentCreate

class AnalyzeResponse(BaseModel):
    message: str
    assessment_id: int


@router.get("/generate", response_model=GenerateResponse)
def generate_questions(current_user: User = Depends(get_current_user)):
    """
    Use OpenRouter to generate 5 randomized relevant mental health questions.
    """
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key missing")

    system_prompt = """
    You are an AI mental health assistant. Generate EXACTLY 5 engaging, 
    randomized, and deeply empathetic conversational questions to ask a teenager. 
    DO NOT ask direct metric questions (like "How many hours did you sleep?" or "What is your stress level?"). 
    Instead, ask open-ended, psychological, or situational questions that allow them to express their feelings, 
    daily struggles, and habits naturally. We want to understand their mental state indirectly through their stories.
    Output ONLY a JSON array of strings, nothing else. No markdown formatting.
    Example: ["What was the most exhausting part of your week?", "If you had a magic wand, what would you change about your daily routine?", "How do you usually unwind when you feel overwhelmed?"]
    """

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate 5 questions now."}
        ],
        "temperature": 0.8
    }

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_HTTP_REFERER,
        "X-Title": settings.OPENROUTER_APP_TITLE,
    }

    try:
        client = _get_client()
        response = client.post(settings.OPENROUTER_API_BASE_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        # Clean up possible markdown
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        questions = json.loads(content.strip())
        
        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("Invalid format from LLM")
            
        return GenerateResponse(questions=questions[:5])
    except Exception as e:
        logger.error(f"Failed to generate questions: {e}")
        # Fallback questions
        return GenerateResponse(questions=[
            "What was the most challenging part of your week, and how did you handle it?",
            "If you could describe your energy levels lately using a weather forecast, what would it be?",
            "When you feel overwhelmed or stressed, what is your go-to way to unwind?",
            "What is something you wish you spent less time doing every day?",
            "What made you feel proud or happy recently, no matter how small?"
        ])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_answers(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze the Q&A pairs to generate an Assessment.
    """
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key missing")

    # Combine Q&A into a transcript
    transcript = ""
    for q, a in zip(request.questions, request.answers):
        transcript += f"Q: {q}\nA: {a}\n\n"

    system_prompt = """
    You are an AI that extracts psychological metrics from a teenager's questionnaire answers.
    Analyze the Q&A transcript and output a STRICT JSON object matching these exact fields.
    Guess the values based on the tone and context if not explicitly mentioned.

    Expected JSON schema:
    {
        "stress_level": number (0-100),
        "anxiety_level": number (0-100),
        "addiction_level": number (0-100),
        "social_interaction_level": string ("low", "medium", or "high")
    }

    Return ONLY the raw JSON object, no markdown formatting, no backticks.
    """

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript}
        ],
        "temperature": 0.3
    }

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OPENROUTER_HTTP_REFERER,
        "X-Title": settings.OPENROUTER_APP_TITLE,
    }

    try:
        client = _get_client()
        response = client.post(settings.OPENROUTER_API_BASE_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        metrics = json.loads(content.strip())
        
        # Overwrite the psychological fields in the user's form data with the AI's extraction
        request.assessment_data.stress_level = metrics.get("stress_level", 40)
        request.assessment_data.anxiety_level = metrics.get("anxiety_level", 40)
        request.assessment_data.addiction_level = metrics.get("addiction_level", 30)
        request.assessment_data.social_interaction_level = metrics.get("social_interaction_level", "medium")

        assessment = create_assessment(db, current_user.id, request.assessment_data)
        
        return AnalyzeResponse(
            message="Questionnaire analyzed successfully",
            assessment_id=assessment.id
        )
    except Exception as e:
        logger.error(f"Failed to analyze questionnaire: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze answers")
