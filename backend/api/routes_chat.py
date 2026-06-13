from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import tempfile
from chat.engine import chat, get_history
from chat.stt import transcribe_audio
from auth.auth_middleware import get_optional_user, get_current_user
from database.connection import get_connection

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


@router.post("/", response_model=ChatResponse)
def send_message(req: ChatRequest, user: Optional[dict] = Depends(get_optional_user)):
    """Send a message and get a RAG-powered response."""
    session_id = req.session_id or str(uuid.uuid4())
    history    = get_history(session_id)
    user_id    = user["id"] if user else None

    # Auto-create/update conversation entry for authenticated users
    if user_id:
        _upsert_conversation(session_id, user_id, req.message)

    try:
        response = chat(req.message, session_id, history, user_id)
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
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("DELETE FROM chat_messages WHERE session_id = %s", (session_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "History cleared", "session_id": session_id}


# ─── Conversations CRUD (DB-based, per user) ─────────────────────────────────

@router.get("/conversations")
def list_conversations(user: dict = Depends(get_current_user)):
    """List all conversations for the authenticated user."""
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        """SELECT id, title, pinned, created_at, updated_at
           FROM conversations
           WHERE user_id = %s
           ORDER BY pinned DESC, updated_at DESC""",
        (user["id"],)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0],
            "title": r[1],
            "pinned": r[2],
            "createdAt": r[3].isoformat() if r[3] else None,
            "updatedAt": r[4].isoformat() if r[4] else None,
        }
        for r in rows
    ]


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    """Delete a conversation and its messages."""
    conn = get_connection()
    cur  = conn.cursor()
    # Verify ownership
    cur.execute("SELECT user_id FROM conversations WHERE id = %s", (conversation_id,))
    row = cur.fetchone()
    if not row or row[0] != user["id"]:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation non trouvée.")

    cur.execute("DELETE FROM chat_messages WHERE session_id = %s", (conversation_id,))
    cur.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Conversation supprimée"}


@router.patch("/conversations/{conversation_id}/pin")
def toggle_pin_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    """Toggle pin status of a conversation."""
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("SELECT user_id, pinned FROM conversations WHERE id = %s", (conversation_id,))
    row = cur.fetchone()
    if not row or row[0] != user["id"]:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation non trouvée.")

    new_pinned = not row[1]
    cur.execute("UPDATE conversations SET pinned = %s WHERE id = %s", (new_pinned, conversation_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"pinned": new_pinned}


# ─── Helper ───────────────────────────────────────────────────────────────────

def _upsert_conversation(session_id: str, user_id: int, first_message: str):
    """Create conversation if it doesn't exist, or update its timestamp."""
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT id FROM conversations WHERE id = %s", (session_id,))
        exists = cur.fetchone()
        if not exists:
            # Generate title from first message
            title = first_message.replace("\n", " ").strip()
            if len(title) > 50:
                title = title[:50] + "…"
            if not title:
                title = "Nouvelle conversation"
            cur.execute(
                "INSERT INTO conversations (id, user_id, title) VALUES (%s, %s, %s)",
                (session_id, user_id, title)
            )
        else:
            cur.execute(
                "UPDATE conversations SET updated_at = NOW() WHERE id = %s",
                (session_id,)
            )
        conn.commit()
    except Exception as e:
        print(f"Erreur upsert conversation: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


# ─── Audio Transcription ─────────────────────────────────────────────────────

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """Transcribe an audio file using faster-whisper."""
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Transcribe
        text = transcribe_audio(tmp_path)

        # Cleanup
        os.unlink(tmp_path)

        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
