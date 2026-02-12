"""FieldForce - Notification Routes"""
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import secrets

from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOut(BaseModel):
    id: str
    type: str  # 'submission', 'team', 'system', 'form', 'sync'
    title: str
    message: str
    read: bool
    created_at: str
    action_url: Optional[str] = None
    metadata: Optional[dict] = None


class NotificationsResponse(BaseModel):
    notifications: List[NotificationOut]
    unread_count: int
    total: int


@router.get("", response_model=NotificationsResponse)
async def get_notifications(
    request: Request,
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """Get user's notifications"""
    db = request.app.state.db
    
    query = {"user_id": current_user["user_id"]}
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    
    # Get unread count
    unread_count = await db.notifications.count_documents({
        "user_id": current_user["user_id"],
        "read": False
    })
    
    # Get total count
    total = await db.notifications.count_documents({
        "user_id": current_user["user_id"]
    })
    
    return NotificationsResponse(
        notifications=[NotificationOut(**n) for n in notifications],
        unread_count=unread_count,
        total=total
    )


@router.post("/{notification_id}/read")
async def mark_as_read(
    request: Request,
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    db = request.app.state.db
    
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["user_id"]},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}


@router.post("/read-all")
async def mark_all_as_read(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db = request.app.state.db
    
    result = await db.notifications.update_many(
        {"user_id": current_user["user_id"], "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "updated": result.modified_count}


@router.delete("/{notification_id}")
async def delete_notification(
    request: Request,
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a notification"""
    db = request.app.state.db
    
    result = await db.notifications.delete_one({
        "id": notification_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}


@router.delete("")
async def clear_all_notifications(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Clear all notifications for the user"""
    db = request.app.state.db
    
    result = await db.notifications.delete_many({
        "user_id": current_user["user_id"]
    })
    
    return {"success": True, "deleted": result.deleted_count}


# Helper function to create notifications (used by other parts of the app)
async def create_notification(
    db,
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    action_url: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """Create a new notification for a user"""
    notification = {
        "id": f"notif_{secrets.token_hex(8)}",
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "action_url": action_url,
        "metadata": metadata
    }
    
    await db.notifications.insert_one(notification)
    return notification
