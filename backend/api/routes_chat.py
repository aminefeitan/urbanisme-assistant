from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from chat.engine import chat, get_history

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


@router.post("/", response_model=ChatResponse)
def send_message(req: ChatRequest):
    """Send a message and get a RAG-powered response."""
    session_id = req.session_id or str(uuid.uuid4())
    history    = get_history(session_id)

    try:
        response = chat(req.message, session_id, history)
        return ChatResponse(response=response, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/history/{session_id}")
def fetch_history(session_id: str):
    """Get conversation history for a session."""
    return {"session_id": session_id, "messages": get_history(session_id)}


@router.delete("/history/{session_id}")
def clear_history(session_id: str):
    """Clear conversation history for a session."""
    from database.connection import get_connection
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("DELETE FROM chat_messages WHERE session_id = %s", (session_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "History cleared", "session_id": session_id}
