"""
Help Center AI Assistant Routes

A reusable FastAPI router for AI-powered help center assistant.

Features:
- Multi-turn conversation with session management (MongoDB-backed)
- Feedback tracking for quality improvement (MongoDB-backed)
- Question analytics for FAQ improvements (MongoDB-backed)
- LLM integration via emergentintegrations

Usage:
    from routes.help_assistant import router as help_assistant_router
    app.include_router(help_assistant_router, prefix="/api")

Environment Variables:
    EMERGENT_LLM_KEY: API key for the LLM service
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/help-assistant", tags=["Help Assistant"])

# ============================================================
# CUSTOMIZE THIS: Update the base URL for your help center
# ============================================================
HELP_CENTER_BASE = "/help"

# ============================================================
# CUSTOMIZE THIS: Update the context with your app's knowledge
# ============================================================
HELP_CENTER_CONTEXT = """
You are a helpful AI Assistant for FieldForce - a mobile data collection platform.

IMPORTANT: When answering questions, include relevant article links using this format: [Article Title](LINK)

## Article Links Reference:
- Welcome Guide: [Welcome Guide]({base}?tab=article&category=getting-started&article=welcome)
- Dashboard Overview: [Dashboard Overview]({base}?tab=article&category=getting-started&article=dashboard-overview)
- Create Your First Project: [First Project]({base}?tab=article&category=getting-started&article=first-project)
- FAQ: [FAQ]({base}?tab=faq)
- Troubleshooting: [Troubleshooting]({base}?tab=troubleshooting)

## About FieldForce
FieldForce is a comprehensive mobile data collection platform designed for field research organizations.
Key features include:
- Drag-and-drop form builder
- Offline data collection with PWA
- GPS tracking and geofencing
- Collection links with security modes (Standard, Device Locked, PIN Protected)
- Multi-language support (6 languages)
- Real-time analytics and reporting
- Team management with role-based permissions

## Common Topics:

### Creating Forms
Users can create forms using the drag-and-drop builder. Navigate to Projects > Forms > New Form.
Question types include: Text, Number, Select, Date, GPS, Photo, Signature, Barcode.

### Collection Links
Collection links allow enumerators to submit data without accounts.
Security modes: Standard (simple link), Device Locked (locks to first device), PIN Protected (requires PIN).

### Offline Mode
FieldForce works offline using PWA technology. Forms are cached locally and sync when online.

### Team Management
Invite team members via Settings > Team. Roles: Admin, Supervisor, Enumerator, Viewer.

### Analytics
View submission trends, quality scores, and team performance in the Analytics dashboard.

## Response Guidelines:
1. Be helpful and concise
2. Provide step-by-step instructions when needed
3. Include 1-2 relevant article links at the end of your response
4. Format links as: [Article Name](link)
5. If unsure, recommend checking the Help Center or contacting support
6. Keep responses friendly and professional
""".format(base=HELP_CENTER_BASE)


# ============================================================
# Request/Response Models
# ============================================================

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class FeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    message_id: str
    is_helpful: bool
    question: Optional[str] = None


# ============================================================
# MongoDB Collections Setup
# ============================================================
# Collections used:
# - help_chat_sessions: Store chat session metadata
# - help_chat_messages: Store individual messages in sessions
# - help_feedback: Store user feedback on AI responses
# - help_question_analytics: Aggregated analytics on questions

# In-memory LLM chat instances (needed for conversation context)
# We still keep LlmChat objects in memory but persist session metadata to MongoDB
chat_sessions = {}


# ============================================================
# Helper Functions
# ============================================================

def get_db(request: Request):
    """Get MongoDB database from app state"""
    return request.app.state.db


async def get_or_create_session(db, session_id: str):
    """Get existing session or create new one in MongoDB"""
    session = await db.help_chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        session = {
            "session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "message_count": 0
        }
        await db.help_chat_sessions.insert_one(session)
    return session


async def save_message(db, session_id: str, role: str, content: str):
    """Save a message to the chat history"""
    message = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.help_chat_messages.insert_one(message)
    
    # Update session
    await db.help_chat_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"message_count": 1}
        }
    )
    return message


async def update_question_analytics(db, question: str, is_helpful: bool):
    """Update analytics for a question"""
    question_lower = question.lower().strip()
    
    existing = await db.help_question_analytics.find_one({"question_key": question_lower}, {"_id": 0})
    
    if existing:
        update_data = {"$inc": {"count": 1}}
        if is_helpful:
            update_data["$inc"]["helpful_count"] = 1
        else:
            update_data["$inc"]["not_helpful_count"] = 1
        update_data["$set"] = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        await db.help_question_analytics.update_one(
            {"question_key": question_lower},
            update_data
        )
    else:
        analytics_entry = {
            "question_key": question_lower,
            "question": question,
            "count": 1,
            "helpful_count": 1 if is_helpful else 0,
            "not_helpful_count": 0 if is_helpful else 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.help_question_analytics.insert_one(analytics_entry)


# ============================================================
# API Endpoints
# ============================================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: Request, chat_message: ChatMessage):
    """
    Chat with the Help Center AI Assistant.
    
    Maintains conversation context via session_id.
    Creates new session if session_id not provided.
    Messages are persisted to MongoDB for history.
    """
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        db = get_db(request)
        
        # Get or create session
        session_id = chat_message.session_id or str(uuid.uuid4())
        await get_or_create_session(db, session_id)
        
        # Save user message to MongoDB
        await save_message(db, session_id, "user", chat_message.message)
        
        # Create or get LLM chat instance (in-memory for conversation context)
        if session_id not in chat_sessions:
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=HELP_CENTER_CONTEXT
            ).with_model("openai", "gpt-5.2")
            chat_sessions[session_id] = chat
        else:
            chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_message.message)
        response = await chat.send_message(user_message)
        
        # Save assistant response to MongoDB
        await save_message(db, session_id, "assistant", response)
        
        return ChatResponse(
            response=response,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")


@router.post("/feedback")
async def submit_feedback(request: Request, feedback: FeedbackRequest):
    """
    Submit feedback for an AI response.
    
    Tracks user satisfaction and question patterns
    for continuous improvement of the Help Center.
    Data is persisted to MongoDB.
    """
    try:
        db = get_db(request)
        
        # Store feedback in MongoDB
        feedback_entry = {
            "id": str(uuid.uuid4()),
            "session_id": feedback.session_id,
            "message_id": feedback.message_id,
            "is_helpful": feedback.is_helpful,
            "question": feedback.question,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.help_feedback.insert_one(feedback_entry)
        
        # Track question frequency for FAQ improvements
        if feedback.question:
            await update_question_analytics(db, feedback.question, feedback.is_helpful)
        
        return {"message": "Feedback recorded", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {str(e)}")


@router.get("/analytics")
async def get_question_analytics(request: Request):
    """
    Get analytics on most asked questions.
    
    Use this data to:
    - Improve FAQ section
    - Identify documentation gaps
    - Train AI assistant better
    
    Data is retrieved from MongoDB.
    """
    try:
        db = get_db(request)
        
        # Get all analytics from MongoDB
        cursor = db.help_question_analytics.find({}, {"_id": 0})
        all_analytics = await cursor.to_list(length=1000)
        
        # Sort by count descending
        sorted_questions = sorted(all_analytics, key=lambda x: x.get("count", 0), reverse=True)
        
        # Get total counts
        total_questions = sum(q.get("count", 0) for q in sorted_questions)
        total_helpful = sum(q.get("helpful_count", 0) for q in sorted_questions)
        total_not_helpful = sum(q.get("not_helpful_count", 0) for q in sorted_questions)
        
        # Find questions that need improvement
        needs_improvement = [
            q for q in sorted_questions 
            if q.get("not_helpful_count", 0) > q.get("helpful_count", 0) and q.get("count", 0) >= 2
        ][:5]
        
        return {
            "total_questions": total_questions,
            "total_helpful": total_helpful,
            "total_not_helpful": total_not_helpful,
            "top_questions": sorted_questions[:10],
            "needs_improvement": needs_improvement
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.post("/reset")
async def reset_chat_session(request: Request, session_id: str):
    """Reset a chat session to start fresh."""
    try:
        db = get_db(request)
        
        # Remove from in-memory cache
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        
        # Mark session as reset in MongoDB (keep history for analytics)
        await db.help_chat_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"reset_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"message": "Session reset", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset session: {str(e)}")


@router.get("/sessions/{session_id}/history")
async def get_session_history(request: Request, session_id: str):
    """
    Get chat history for a session.
    
    Returns all messages in chronological order.
    """
    try:
        db = get_db(request)
        
        # Get session info
        session = await db.help_chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get all messages for the session
        cursor = db.help_chat_messages.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1)
        messages = await cursor.to_list(length=1000)
        
        return {
            "session": session,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")


@router.get("/stats")
async def get_overall_stats(request: Request):
    """
    Get overall statistics for the help assistant.
    
    Returns total sessions, messages, feedback counts, etc.
    """
    try:
        db = get_db(request)
        
        # Count documents in each collection
        total_sessions = await db.help_chat_sessions.count_documents({})
        total_messages = await db.help_chat_messages.count_documents({})
        total_feedback = await db.help_feedback.count_documents({})
        
        # Get helpful/not helpful feedback counts
        helpful_count = await db.help_feedback.count_documents({"is_helpful": True})
        not_helpful_count = await db.help_feedback.count_documents({"is_helpful": False})
        
        # Get recent sessions (last 24 hours)
        yesterday = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        recent_sessions = await db.help_chat_sessions.count_documents({
            "created_at": {"$gte": yesterday.isoformat()}
        })
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "total_feedback": total_feedback,
            "helpful_feedback": helpful_count,
            "not_helpful_feedback": not_helpful_count,
            "satisfaction_rate": round(helpful_count / total_feedback * 100, 1) if total_feedback > 0 else 0,
            "sessions_today": recent_sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
