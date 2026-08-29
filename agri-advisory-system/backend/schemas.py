from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class UserCreate(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str  # Can accept either email address or username
    password: str


class UserUpdate(BaseModel):
    user_id: Optional[int] = None
    userId: Optional[int] = None  # Frontend alternative
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    name: Optional[str] = None    # Frontend alternative for combined name
    username: Optional[str] = None


class PasswordReset(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    newPassword: Optional[str] = None
    password: Optional[str] = None       # Frontend alternative
    confirmPassword: Optional[str] = None # Frontend alternative


class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


class SourceItem(BaseModel):
    title: str
    url: Optional[str] = None


class QueryRequest(BaseModel):
    user_id: int
    message: str
    session_id: Optional[int] = None
    language_code: Optional[str] = "en-IN"


class QueryResponse(BaseModel):
    session_id: int
    reply: str
    language_code: str
    sources: List[SourceItem] = []


class SessionRenameRequest(BaseModel):
    user_id: int
    title: str


class SessionItem(BaseModel):
    session_id: int
    title: str
    updated_at: datetime
    is_pinned: bool
    is_archived: bool

    class Config:
        from_attributes = True


class MessageItem(BaseModel):
    id: int
    sender: str
    content: str
    language_code: str
    sources: List[SourceItem] = []

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    session_id: int
    title: str
    messages: List[MessageItem]


class TtsRequest(BaseModel):
    text: str
    language_code: Optional[str] = "en-IN"
    speaker: Optional[str] = "shubh"
    pace: Optional[float] = 1.0