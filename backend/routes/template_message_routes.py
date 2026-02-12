"""
Message Templates Routes
Handles CRUD operations for custom message templates used in link sharing.
Supports both user-level and organization-level templates.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone
from bson import ObjectId
import os
from motor.motor_asyncio import AsyncIOMotorClient

from auth import get_current_user

router = APIRouter(prefix="/api/message-templates", tags=["Message Templates"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "fieldforce")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Pydantic Models
class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["whatsapp", "email", "sms"] = "whatsapp"
    subject: Optional[str] = None  # For email templates
    body: str = Field(..., min_length=1)
    scope: Literal["user", "organization"] = "user"

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None

class TemplateResponse(BaseModel):
    id: str
    name: str
    type: str
    subject: Optional[str] = None
    body: str
    scope: str
    is_default: bool = False
    created_by: str
    org_id: Optional[str] = None
    created_at: str
    updated_at: str

# Default templates to seed
DEFAULT_TEMPLATES = [
    {
        "name": "WhatsApp - Friendly",
        "type": "whatsapp",
        "body": "Hi {name}! 👋\n\nHere's your data collection link for FieldForce:\n\n{link}\n\n{pin_section}Open this link on your phone to start collecting data. The link expires on {expiry}.\n\nLet me know if you have any questions!",
        "scope": "system",
        "is_default": True
    },
    {
        "name": "WhatsApp - Professional",
        "type": "whatsapp",
        "body": "Dear {name},\n\nYou have been assigned as a data collector. Please use the following link to access your surveys:\n\n{link}\n\n{pin_section}Link valid until: {expiry}\n\nBest regards",
        "scope": "system",
        "is_default": True
    },
    {
        "name": "Email - Standard",
        "type": "email",
        "subject": "Your FieldForce Data Collection Link",
        "body": "Dear {name},\n\nYou have been assigned to collect data using FieldForce. Please find your unique collection link below:\n\n{link}\n\n{pin_section}Important Information:\n- This link is valid until {expiry}\n- Open on your mobile device for best experience\n- Data will sync automatically when online\n\nIf you have any questions, please contact your supervisor.\n\nBest regards,\nFieldForce Team",
        "scope": "system",
        "is_default": True
    },
    {
        "name": "SMS - Short",
        "type": "sms",
        "body": "Hi {name}! Your FieldForce link: {link} {pin_section}Expires: {expiry}",
        "scope": "system",
        "is_default": True
    },
    {
        "name": "SMS - With Instructions",
        "type": "sms",
        "body": "{name}, your data collection link is ready: {link} {pin_section}Open on phone to collect data. Valid till {expiry}.",
        "scope": "system",
        "is_default": True
    }
]


async def ensure_default_templates():
    """Ensure default templates exist in database"""
    existing = await db.message_templates.count_documents({"scope": "system"})
    if existing == 0:
        for template in DEFAULT_TEMPLATES:
            template["created_by"] = "system"
            template["org_id"] = None
            template["created_at"] = datetime.now(timezone.utc).isoformat()
            template["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.message_templates.insert_one(template)


@router.get("", response_model=List[TemplateResponse])
async def list_templates(
    type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List all templates accessible to the user:
    - System default templates
    - User's personal templates
    - Organization templates (if user belongs to an org)
    """
    await ensure_default_templates()
    
    user_id = current_user.get("id") or current_user.get("user_id")
    org_id = current_user.get("org_id")
    
    # Build query for templates user can access
    query = {
        "$or": [
            {"scope": "system"},  # Default templates
            {"scope": "user", "created_by": user_id},  # User's own templates
        ]
    }
    
    # Add org templates if user belongs to an org
    if org_id:
        query["$or"].append({"scope": "organization", "org_id": org_id})
    
    # Filter by type if specified
    if type:
        query["type"] = type
    
    templates = []
    cursor = db.message_templates.find(query).sort("created_at", -1)
    
    async for doc in cursor:
        templates.append(TemplateResponse(
            id=str(doc["_id"]),
            name=doc["name"],
            type=doc["type"],
            subject=doc.get("subject"),
            body=doc["body"],
            scope=doc["scope"],
            is_default=doc.get("is_default", False),
            created_by=doc["created_by"],
            org_id=doc.get("org_id"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        ))
    
    return templates


@router.post("", response_model=TemplateResponse)
async def create_template(
    template: TemplateCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new message template (user or organization level)"""
    user_id = current_user.get("id") or current_user.get("user_id")
    org_id = current_user.get("org_id")
    
    # Validate org scope
    if template.scope == "organization" and not org_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot create organization template without belonging to an organization"
        )
    
    now = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "name": template.name,
        "type": template.type,
        "subject": template.subject,
        "body": template.body,
        "scope": template.scope,
        "is_default": False,
        "created_by": user_id,
        "org_id": org_id if template.scope == "organization" else None,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.message_templates.insert_one(doc)
    
    return TemplateResponse(
        id=str(result.inserted_id),
        name=doc["name"],
        type=doc["type"],
        subject=doc.get("subject"),
        body=doc["body"],
        scope=doc["scope"],
        is_default=False,
        created_by=doc["created_by"],
        org_id=doc.get("org_id"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"]
    )


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    update: TemplateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing template (only owner can update)"""
    user_id = current_user.get("id") or current_user.get("user_id")
    org_id = current_user.get("org_id")
    
    try:
        obj_id = ObjectId(template_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    # Find template
    template = await db.message_templates.find_one({"_id": obj_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check permissions
    if template["scope"] == "system":
        raise HTTPException(status_code=403, detail="Cannot modify system templates")
    
    if template["scope"] == "user" and template["created_by"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot modify another user's template")
    
    if template["scope"] == "organization" and template.get("org_id") != org_id:
        raise HTTPException(status_code=403, detail="Cannot modify template from another organization")
    
    # Build update
    update_doc = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if update.name is not None:
        update_doc["name"] = update.name
    if update.subject is not None:
        update_doc["subject"] = update.subject
    if update.body is not None:
        update_doc["body"] = update.body
    
    await db.message_templates.update_one({"_id": obj_id}, {"$set": update_doc})
    
    # Fetch updated
    updated = await db.message_templates.find_one({"_id": obj_id})
    
    return TemplateResponse(
        id=str(updated["_id"]),
        name=updated["name"],
        type=updated["type"],
        subject=updated.get("subject"),
        body=updated["body"],
        scope=updated["scope"],
        is_default=updated.get("is_default", False),
        created_by=updated["created_by"],
        org_id=updated.get("org_id"),
        created_at=updated["created_at"],
        updated_at=updated["updated_at"]
    )


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a template (only owner can delete, cannot delete system templates)"""
    user_id = current_user.get("id") or current_user.get("user_id")
    org_id = current_user.get("org_id")
    
    try:
        obj_id = ObjectId(template_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    # Find template
    template = await db.message_templates.find_one({"_id": obj_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check permissions
    if template["scope"] == "system":
        raise HTTPException(status_code=403, detail="Cannot delete system templates")
    
    if template["scope"] == "user" and template["created_by"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's template")
    
    if template["scope"] == "organization" and template.get("org_id") != org_id:
        raise HTTPException(status_code=403, detail="Cannot delete template from another organization")
    
    await db.message_templates.delete_one({"_id": obj_id})
    
    return {"success": True, "message": "Template deleted"}


@router.post("/preview")
async def preview_template(
    template_id: str,
    name: str = "John Smith",
    link: str = "https://example.com/collect/t/abc123",
    pin: Optional[str] = None,
    expiry: str = "March 15, 2026",
    current_user: dict = Depends(get_current_user)
):
    """Preview a template with sample data"""
    try:
        obj_id = ObjectId(template_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    template = await db.message_templates.find_one({"_id": obj_id})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Build PIN section
    pin_section = f"Your PIN: {pin}\n\n" if pin else ""
    
    # Replace variables
    body = template["body"]
    body = body.replace("{name}", name)
    body = body.replace("{link}", link)
    body = body.replace("{pin_section}", pin_section)
    body = body.replace("{pin}", pin or "")
    body = body.replace("{expiry}", expiry)
    
    subject = None
    if template.get("subject"):
        subject = template["subject"]
        subject = subject.replace("{name}", name)
    
    return {
        "subject": subject,
        "body": body,
        "type": template["type"]
    }
