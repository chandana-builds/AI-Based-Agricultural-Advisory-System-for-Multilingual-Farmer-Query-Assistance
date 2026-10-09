import os
import sys

# Force UTF-8 stdout/stderr on Windows to avoid UnicodeEncodeError when printing Telugu/Hindi
def safe_log(*args):
    try:
        msg = " ".join(str(a) for a in args)
        if sys.stdout and hasattr(sys.stdout, "buffer"):
            sys.stdout.buffer.write((msg + "\n").encode("utf-8", errors="replace"))
            sys.stdout.buffer.flush()
        else:
            print(msg.encode("ascii", errors="replace").decode("ascii"))
    except Exception:
        pass

from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

from database import Base, engine, get_db
import chatbot
import models
import schemas
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import requests
import time

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgriAI Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def normalize_slashes(request, call_next):
    if "//" in request.scope.get("path", ""):
        import re
        request.scope["path"] = re.sub(r"/+", "/", request.scope["path"])
    return await call_next(request)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mount chatbot router to support both prefixes seamlessly
app.include_router(chatbot.router, prefix="/chat")
app.include_router(chatbot.router, prefix="/api/chat")


@app.get("/")
@app.get("/health")
def root_health():
    return {
        "status": "online",
        "service": "AgriAssist AI Agricultural Advisory Backend",
        "version": "2.0",
        "documentation": "/docs",
        "endpoints": {
            "chat": "/chat",
            "login": "/auth/login",
            "signup": "/auth/signup",
            "docs": "/docs"
        }
    }



@app.on_event("startup")
def seed_default_user():
    db = next(get_db())
    try:
        user = db.query(models.User).filter_by(user_id=1).first()
        if not user:
            hashed_pw = pwd_context.hash("Password123")
            default_user = models.User(
                user_id=1, 
                first_name="User",
                last_name="",
                username="user", 
                email="user@example.com",
                hashed_password=hashed_pw
            )
            db.add(default_user)
            db.commit()
    except Exception as e:
        print(f"Startup seeding error: {e}")
    finally:
        db.close()


# --- ROOT USER PROFILE ROUTE ---
@app.get("/user/{user_id}", response_model=schemas.UserResponse)
@app.get("/api/user/{user_id}", response_model=schemas.UserResponse)
def get_root_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


# --- AUTHENTICATION & USER ROUTES ---

@app.post("/signup")
@app.post("/api/auth/signup")
@app.post("/auth/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered.")
    
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        first_name=user.firstName,
        last_name=user.lastName,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Account created successfully!"}


@app.post("/login")
@app.post("/api/auth/login")
@app.post("/auth/login")
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.email == credentials.email) | (models.User.username == credentials.email)
    ).first()
    
    if not db_user or not pwd_context.verify(credentials.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email/username or password.")
    
    return {
        "message": "Login successful",
        "user": {
            "id": db_user.user_id,
            "email": db_user.email,
            "username": db_user.username,
            "firstName": db_user.first_name,
            "lastName": db_user.last_name
        }
    }


@app.post("/api/user/update")
@app.post("/user/update")
def update_user_profile(payload: dict, db: Session = Depends(get_db)):
    uid = payload.get("userId") or payload.get("user_id") or 1
    db_user = db.query(models.User).filter_by(user_id=uid).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Update profile fields
    if "firstName" in payload:
        db_user.first_name = payload["firstName"]
    if "lastName" in payload:
        db_user.last_name = payload["lastName"]
    if "username" in payload and payload["username"]:
        db_user.username = payload["username"]
    if "email" in payload and payload["email"]:
        db_user.email = payload["email"]

    # Update password if provided
    if "newPassword" in payload and payload["newPassword"]:
        if "currentPassword" in payload and payload["currentPassword"]:
            if not pwd_context.verify(payload["currentPassword"], db_user.hashed_password):
                raise HTTPException(status_code=400, detail="Current password is incorrect.")
        db_user.hashed_password = pwd_context.hash(payload["newPassword"])

    db.commit()
    db.refresh(db_user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": db_user.user_id,
            "email": db_user.email,
            "username": db_user.username,
            "firstName": db_user.first_name,
            "lastName": db_user.last_name
        }
    }
# --- SPEECH TO TEXT (SARVAM AI saaras:v3) ---
@app.post("/chat/stt")
@app.post("/api/chat/stt")
async def speech_to_text_endpoint(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form(None)
):
    import tempfile
    import os
    from sarvamai import SarvamAI

    try:
        audio_bytes = await file.read()
        if not audio_bytes or len(audio_bytes) < 50:
            raise HTTPException(status_code=400, detail="Audio data is empty.")

        filename = file.filename or "audio.webm"
        suffix = os.path.splitext(filename)[1]
        if not suffix:
            suffix = ".webm"

        sarvam_api_key = os.getenv("SARVAM_API_KEY")
        if not sarvam_api_key:
            raise HTTPException(status_code=500, detail="SARVAM_API_KEY is missing from backend/.env")

        sarvam = SarvamAI(api_subscription_key=sarvam_api_key)

        transcript = ""
        detected_language = None
        language_probability = None
        temp_path = None

        try:
            # 1. Save temporary audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
                temp.write(audio_bytes)
                temp.flush()
                temp_path = temp.name

            # 2. Sarvam STT SDK (exact friend implementation)
            safe_log(f"Sarvam STT: saaras:v3 | {len(audio_bytes) / 1024:.1f} KB")
            with open(temp_path, "rb") as audio_file:
                response = sarvam.speech_to_text.transcribe(
                    file=audio_file,
                    model="saaras:v3",
                    mode="transcribe",
                    language_code="unknown",
                )

            transcript = getattr(response, "transcript", "")
            detected_language = getattr(response, "language_code", None) or getattr(response, "language", None)
            language_probability = getattr(response, "language_probability", None)
            transcript = (transcript or "").strip()

            safe_log("Sarvam STT transcript:", transcript)
            safe_log("Sarvam STT language:", detected_language)

            # Fallback to REST API if transcript was empty
            if not transcript:
                with open(temp_path, "rb") as audio_file:
                    url = "https://api.sarvam.ai/speech-to-text"
                    headers = {"api-subscription-key": sarvam_api_key}
                    mime = "audio/wav" if suffix == ".wav" else "audio/mp4" if suffix == ".mp4" else "audio/webm"
                    files = {"file": (f"recording{suffix}", audio_file, mime)}
                    data = {"model": "saaras:v3", "mode": "transcribe", "language_code": "unknown"}
                    r_rest = requests.post(url, files=files, data=data, headers=headers, timeout=30)
                    if r_rest.status_code == 200:
                        res_j = r_rest.json()
                        transcript = (res_j.get("transcript") or "").strip()
                        detected_language = res_j.get("language_code") or res_j.get("language") or detected_language
                        language_probability = res_j.get("language_probability") or language_probability

        except Exception as sdk_err:
            safe_log("Sarvam STT SDK/REST error:", repr(sdk_err))

        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

        # Fallback to Gemini if Sarvam returned no transcript
        if not transcript:
            gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if gemini_api_key:
                try:
                    from google import genai
                    from google.genai import types
                    client = genai.Client(api_key=gemini_api_key)
                    g_res = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[
                            "Provide an exact, verbatim text transcription of what is spoken in this audio. Output ONLY the transcribed words. If silent or no speech, output nothing.",
                            types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm"),
                        ],
                    )
                    if g_res and g_res.text:
                        t_text = g_res.text.strip()
                        if t_text and t_text.lower() not in ["nothing", "none", "empty string"]:
                            transcript = t_text
                except Exception as g_err:
                    safe_log("Gemini STT fallback error:", g_err)

        # Fallback to Whisper if still empty
        if not transcript:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                try:
                    from openai import OpenAI
                    import io
                    o_client = OpenAI(api_key=openai_api_key)
                    a_file = io.BytesIO(audio_bytes)
                    a_file.name = f"audio{suffix}"
                    w_res = o_client.audio.transcriptions.create(model="whisper-1", file=a_file)
                    if w_res and w_res.text:
                        transcript = w_res.text.strip()
                except Exception as w_err:
                    safe_log("Whisper STT fallback error:", w_err)

        if not transcript:
            raise HTTPException(status_code=400, detail="Could not detect speech in audio. Please speak clearly and try again.")

        from services import detect_query_language
        auto_lang = detect_query_language(transcript, fallback_lang="en-IN")
        if auto_lang in ["te-IN", "hi-IN", "en-IN"]:
            detected_language = auto_lang

        return {
            "transcript": transcript,
            "text": transcript,
            "language": detected_language or "en-IN",
            "language_code": detected_language or "en-IN",
            "language_probability": language_probability,
        }

    except HTTPException as he:
        raise he
    except Exception as exc:
        safe_log("Sarvam STT error:", repr(exc))
        raise HTTPException(status_code=500, detail=f"Sarvam STT failed: {exc}")


# --- SARVAM AI TEXT-TO-SPEECH (TTS) ROUTE ---
@app.post("/chat/tts")
@app.post("/api/chat/tts")
def text_to_speech(payload: schemas.TtsRequest):
    sarvam_api_key = os.getenv("SARVAM_API_KEY")
    if not sarvam_api_key:
        raise HTTPException(status_code=500, detail="SARVAM_API_KEY is not set in environment variables.")

    try:
        import re
        import base64
        
        # Clean formatting tags & markdown for smooth speech
        clean_text = re.sub(r"[*#_`~\[\]()]", "", payload.text).strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Text is required for speech synthesis.")

        # Limit characters to avoid API timeouts
        max_chars = 1800
        if len(clean_text) > max_chars:
            clean_text = clean_text[:max_chars]
            last_space = clean_text.rfind(" ")
            if last_space > 500:
                clean_text = clean_text[:last_space]

        target_lang = getattr(payload, "language_code", "en-IN") or "en-IN"
        speaker = getattr(payload, "speaker", "shubh") or "shubh"
        
        url = "https://api.sarvam.ai/text-to-speech"
        headers = {
            "api-subscription-key": sarvam_api_key,
            "Content-Type": "application/json"
        }
        body = {
            "text": clean_text,
            "target_language_code": target_lang,
            "speaker": speaker,
            "model": "bulbul:v3",
            "output_audio_codec": "wav"
        }

        response = requests.post(url, json=body, headers=headers, timeout=45)
        
        # Fallback to bulbul:v1 if bulbul:v3 format is different
        if response.status_code != 200:
            legacy_body = {
                "inputs": [clean_text],
                "target_language_code": target_lang,
                "speaker": speaker if speaker in ["shubh", "aditi", "priya"] else "shubh",
                "model": "bulbul:v1"
            }
            response = requests.post(url, json=legacy_body, headers=headers, timeout=45)

        if response.status_code != 200:
            print(f"Sarvam TTS Error ({response.status_code}): {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Sarvam TTS failed: {response.text}")
            
        res_json = response.json()
        audios = res_json.get("audios", [])
        if not audios:
            raise HTTPException(status_code=500, detail="Sarvam TTS returned no audio.")

        audio_base64 = "".join(audios) if isinstance(audios, list) else str(audios)
        return {"audio_base64": audio_base64}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"TTS Exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)