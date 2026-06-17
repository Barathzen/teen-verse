from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User
from app.services.chatbot_service import MentalHealthCoach

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


coach = MentalHealthCoach()


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    try:
        response = coach.respond(request.message)
        return {"reply": response}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Chat provider error: {str(e)}"
        )
