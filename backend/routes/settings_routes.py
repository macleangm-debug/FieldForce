"""FieldForce - User Settings Routes"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "dark"
    notifications_enabled: bool = True
    email_notifications: bool = True
    timezone: str = "UTC"


class UserPreferencesUpdate(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    timezone: Optional[str] = None


# Supported languages
SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native": "English", "flag": "🇺🇸"},
    {"code": "es", "name": "Spanish", "native": "Español", "flag": "🇪🇸"},
    {"code": "fr", "name": "French", "native": "Français", "flag": "🇫🇷"},
    {"code": "de", "name": "German", "native": "Deutsch", "flag": "🇩🇪"},
    {"code": "pt", "name": "Portuguese", "native": "Português", "flag": "🇧🇷"},
    {"code": "zh", "name": "Chinese", "native": "中文", "flag": "🇨🇳"},
    {"code": "ja", "name": "Japanese", "native": "日本語", "flag": "🇯🇵"},
    {"code": "ko", "name": "Korean", "native": "한국어", "flag": "🇰🇷"},
    {"code": "ar", "name": "Arabic", "native": "العربية", "flag": "🇸🇦"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "flag": "🇮🇳"},
    {"code": "sw", "name": "Swahili", "native": "Kiswahili", "flag": "🇰🇪"},
    {"code": "id", "name": "Indonesian", "native": "Bahasa Indonesia", "flag": "🇮🇩"},
]


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {"languages": SUPPORTED_LANGUAGES}


@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user's preferences"""
    db = request.app.state.db
    
    prefs = await db.user_preferences.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not prefs:
        # Return defaults
        return UserPreferences()
    
    return UserPreferences(
        language=prefs.get("language", "en"),
        theme=prefs.get("theme", "dark"),
        notifications_enabled=prefs.get("notifications_enabled", True),
        email_notifications=prefs.get("email_notifications", True),
        timezone=prefs.get("timezone", "UTC")
    )


@router.put("/preferences")
async def update_user_preferences(
    request: Request,
    data: UserPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's preferences"""
    db = request.app.state.db
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.user_preferences.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data},
        upsert=True
    )
    
    return {"success": True, "updated": update_data}


@router.put("/language")
async def update_language(
    request: Request,
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Quick endpoint to update just the language"""
    db = request.app.state.db
    
    language = data.get("language", "en")
    
    # Validate language code
    valid_codes = [lang["code"] for lang in SUPPORTED_LANGUAGES]
    if language not in valid_codes:
        raise HTTPException(status_code=400, detail="Invalid language code")
    
    await db.user_preferences.update_one(
        {"user_id": current_user["user_id"]},
        {
            "$set": {
                "language": language,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"success": True, "language": language}
