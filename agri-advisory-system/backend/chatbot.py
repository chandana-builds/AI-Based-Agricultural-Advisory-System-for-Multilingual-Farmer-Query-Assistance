import json
from database import get_db
import models
import schemas
from fastapi import APIRouter, Depends, HTTPException
from services import generate_llm_response, check_greeting_or_identity
from sqlalchemy.orm import Session

router = APIRouter(tags=["Chatbot"])


@router.get("/sessions")
def get_sessions(
    user_id: int, include_archived: bool = False, db: Session = Depends(get_db)
):
    if not hasattr(models, "ChatSession"):
        return []
        
    query = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == user_id
    )
    if not include_archived:
        query = query.filter(models.ChatSession.is_archived == False)
    sessions = query.order_by(models.ChatSession.updated_at.desc()).all()
    return sessions


@router.get("/history")
def get_chat_history(
    session_id: int, user_id: int, db: Session = Depends(get_db)
):
    if not hasattr(models, "ChatSession"):
        raise HTTPException(status_code=404, detail="Chat tables not initialized.")

    session = (
        db.query(models.ChatSession)
        .filter(
            models.ChatSession.session_id == session_id,
            models.ChatSession.user_id == user_id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    formatted_messages = []
    for msg in getattr(session, "messages", []):
        parsed_sources = []
        if getattr(msg, "sources_json", None):
            try:
                parsed_sources = json.loads(msg.sources_json)
            except Exception:
                parsed_sources = []
        formatted_messages.append({
            "id": msg.id,
            "sender": msg.sender,
            "content": msg.content,
            "language_code": msg.language_code,
            "sources": parsed_sources,
        })

    return {
        "session_id": session.session_id,
        "title": session.title,
        "messages": formatted_messages,
    }


@router.post("/query")
@router.post("")
def post_query(payload: schemas.QueryRequest, db: Session = Depends(get_db)):
    # Auto-create user if missing so it never throws a user error
    user = db.query(models.User).filter_by(user_id=payload.user_id).first()
    if not user and hasattr(models, "User"):
        try:
            user = models.User(
                user_id=payload.user_id, 
                first_name="Farmer",
                last_name="",
                username=f"user_{payload.user_id}", 
                email=f"user{payload.user_id}@example.com", 
                hashed_password="nopassword"
            )
            db.add(user)
            db.commit()
        except Exception:
            db.rollback()

    user_query = payload.message.strip() if payload.message else ""
    client_lang = payload.language_code or "en-IN"

    # Retrieve or Create Chat Session
    session = None
    conversation_history = []
    
    if payload.session_id and hasattr(models, "ChatSession"):
        session = db.query(models.ChatSession).filter_by(
            session_id=payload.session_id, user_id=payload.user_id
        ).first()
        
        # Load previous messages for multi-turn context
        if session and hasattr(session, "messages"):
            for m in session.messages[-8:]:  # Last 8 messages for context
                role = "user" if m.sender == "user" else "assistant"
                conversation_history.append({"role": role, "content": m.content})

    # Append current user query
    conversation_history.append({"role": "user", "content": user_query})

    # Call main RAG orchestrator in services.py
    try:
        llm_result = generate_llm_response(conversation_history, language_code=client_lang)
        reply_text = llm_result.get("reply", "I am here to assist with your agricultural advisory questions.")
        sources_list = llm_result.get("sources", [])
        response_lang = llm_result.get("language_code", client_lang)
        source_file_name = sources_list[0]["title"] if sources_list else None
    except Exception as err:
        print(f"RAG LLM Execution Error: {err}")
        reply_text = "I encountered an error processing your agricultural query. Please try again."
        sources_list = []
        response_lang = client_lang
        source_file_name = None

    # Create session if none exists
    if not session and hasattr(models, "ChatSession"):
        if check_greeting_or_identity(user_query):
            title_snippet = "General Greetings & Info"
        else:
            title_snippet = user_query[:35] + "..." if len(user_query) > 35 else (user_query or "Agricultural Advisory")
            
        session = models.ChatSession(user_id=payload.user_id, title=title_snippet)
        db.add(session)
        db.commit()
        db.refresh(session)

    # Persist Messages to Database
    if session and hasattr(models, "ChatMessage"):
        try:
            user_msg = models.ChatMessage(
                session_id=session.session_id,
                sender="user",
                content=user_query,
                language_code=response_lang,
            )
            db.add(user_msg)
            
            bot_msg = models.ChatMessage(
                session_id=session.session_id,
                sender="bot",
                content=reply_text,
                language_code=response_lang,
                sources_json=json.dumps(sources_list),
            )
            db.add(bot_msg)
            db.commit()
        except Exception as db_err:
            print(f"Database message logging error: {db_err}")
            db.rollback()

    return {
        "session_id": session.session_id if session else (payload.session_id or 1),
        "response": reply_text,
        "reply": reply_text,
        "language_code": response_lang,
        "source": source_file_name,
        "sources": sources_list,
    }


@router.delete("/session/{session_id}")
def delete_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    if not hasattr(models, "ChatSession"):
        raise HTTPException(status_code=404, detail="Session not found.")
    
    session = db.query(models.ChatSession).filter_by(session_id=session_id, user_id=user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    
    if hasattr(models, "ChatMessage"):
        db.query(models.ChatMessage).filter_by(session_id=session_id).delete()
        
    db.delete(session)
    db.commit()
    return {"status": "success", "message": "Session deleted successfully"}


@router.patch("/session/{session_id}/rename")
def rename_session(
    session_id: int,
    payload: schemas.SessionRenameRequest,
    db: Session = Depends(get_db),
):
    if not hasattr(models, "ChatSession"):
        raise HTTPException(status_code=404, detail="Session not found.")
    session = db.query(models.ChatSession).filter_by(session_id=session_id, user_id=payload.user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session.title = payload.title
    db.commit()
    return {"session_id": session.session_id, "title": session.title}


@router.post("/session/{session_id}/pin")
def pin_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    if not hasattr(models, "ChatSession"):
        raise HTTPException(status_code=404, detail="Session not found.")
    session = db.query(models.ChatSession).filter_by(session_id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session.is_pinned = not session.is_pinned
    db.commit()
    return {"session_id": session.session_id, "is_pinned": session.is_pinned}


@router.post("/session/{session_id}/archive")
def archive_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    if not hasattr(models, "ChatSession"):
        raise HTTPException(status_code=404, detail="Session not found.")
    session = db.query(models.ChatSession).filter_by(session_id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session.is_archived = True
    db.commit()
    return {"status": "success"}