"""FieldForce - Data Collection Routes for Enumerators"""
from fastapi import APIRouter, HTTPException, status, Request, Depends, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import secrets
import hashlib
import io
import pandas as pd

from auth import get_current_user

router = APIRouter(prefix="/collect", tags=["Data Collection"])


class CollectionTokenCreate(BaseModel):
    """Create a collection token for an enumerator"""
    enumerator_name: str
    enumerator_email: Optional[str] = None
    form_ids: List[str]  # Forms this token can access
    expires_days: int = 30  # Token validity in days
    max_submissions: Optional[int] = None  # Optional limit


class CollectionTokenOut(BaseModel):
    """Collection token response"""
    id: str
    token: str
    enumerator_name: str
    enumerator_email: Optional[str]
    form_ids: List[str]
    created_at: str
    expires_at: str
    submission_count: int
    max_submissions: Optional[int]
    is_active: bool


class EnumeratorFormOut(BaseModel):
    """Form info for enumerator"""
    id: str
    name: str
    description: Optional[str]
    field_count: int
    status: str


class BulkImportResult(BaseModel):
    """Result of bulk enumerator import"""
    success_count: int
    error_count: int
    errors: List[Dict[str, Any]]
    created_tokens: List[Dict[str, Any]]


def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


@router.post("/tokens", response_model=CollectionTokenOut)
async def create_collection_token(
    request: Request,
    data: CollectionTokenCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a collection token for an enumerator (supervisors only)"""
    db = request.app.state.db
    
    # Generate token
    token = generate_token()
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=data.expires_days)
    
    token_doc = {
        "id": f"ct_{secrets.token_hex(8)}",
        "token_hash": token_hash,
        "enumerator_name": data.enumerator_name,
        "enumerator_email": data.enumerator_email,
        "form_ids": data.form_ids,
        "created_by": current_user["user_id"],
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "submission_count": 0,
        "max_submissions": data.max_submissions,
        "is_active": True
    }
    
    await db.collection_tokens.insert_one(token_doc)
    
    return CollectionTokenOut(
        id=token_doc["id"],
        token=token,  # Only returned once at creation!
        enumerator_name=data.enumerator_name,
        enumerator_email=data.enumerator_email,
        form_ids=data.form_ids,
        created_at=token_doc["created_at"],
        expires_at=token_doc["expires_at"],
        submission_count=0,
        max_submissions=data.max_submissions,
        is_active=True
    )


@router.get("/tokens", response_model=List[CollectionTokenOut])
async def list_collection_tokens(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """List all collection tokens created by this user"""
    db = request.app.state.db
    
    tokens = await db.collection_tokens.find(
        {"created_by": current_user["user_id"]},
        {"_id": 0, "token_hash": 0}
    ).to_list(1000)
    
    result = []
    for t in tokens:
        result.append(CollectionTokenOut(
            id=t["id"],
            token="***hidden***",  # Never expose the actual token
            enumerator_name=t["enumerator_name"],
            enumerator_email=t.get("enumerator_email"),
            form_ids=t["form_ids"],
            created_at=t["created_at"],
            expires_at=t["expires_at"],
            submission_count=t.get("submission_count", 0),
            max_submissions=t.get("max_submissions"),
            is_active=t.get("is_active", True)
        ))
    
    return result


@router.delete("/tokens/{token_id}")
async def revoke_collection_token(
    request: Request,
    token_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke a collection token"""
    db = request.app.state.db
    
    result = await db.collection_tokens.update_one(
        {"id": token_id, "created_by": current_user["user_id"]},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    
    return {"message": "Token revoked successfully"}


@router.get("/verify/{token}")
async def verify_collection_token(
    request: Request,
    token: str
):
    """Verify a collection token and return assigned forms (no auth required)"""
    db = request.app.state.db
    
    # Hash the token to compare
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    token_doc = await db.collection_tokens.find_one(
        {"token_hash": token_hash},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    if not token_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Token has been revoked")
    
    # Check expiry
    expires_at = datetime.fromisoformat(token_doc["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=403, detail="Token has expired")
    
    # Check submission limit
    if token_doc.get("max_submissions"):
        if token_doc.get("submission_count", 0) >= token_doc["max_submissions"]:
            raise HTTPException(status_code=403, detail="Submission limit reached")
    
    # Get the forms
    forms = await db.forms.find(
        {"id": {"$in": token_doc["form_ids"]}, "status": "published"},
        {"_id": 0, "id": 1, "name": 1, "description": 1, "fields": 1, "settings": 1}
    ).to_list(100)
    
    return {
        "enumerator_name": token_doc["enumerator_name"],
        "forms": [
            {
                "id": f["id"],
                "name": f["name"],
                "description": f.get("description"),
                "field_count": len(f.get("fields", [])),
                "settings": f.get("settings", {})
            }
            for f in forms
        ],
        "submission_count": token_doc.get("submission_count", 0),
        "max_submissions": token_doc.get("max_submissions")
    }


@router.get("/forms/{token}/{form_id}")
async def get_form_for_collection(
    request: Request,
    token: str,
    form_id: str
):
    """Get full form data for collection (no auth required)"""
    db = request.app.state.db
    
    # Verify token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    token_doc = await db.collection_tokens.find_one(
        {"token_hash": token_hash, "is_active": True},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    # Check if form is in allowed list
    if form_id not in token_doc["form_ids"]:
        raise HTTPException(status_code=403, detail="Form not assigned to this token")
    
    # Get form
    form = await db.forms.find_one(
        {"id": form_id, "status": "published"},
        {"_id": 0}
    )
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    return {
        "id": form["id"],
        "name": form["name"],
        "description": form.get("description"),
        "fields": form.get("fields", []),
        "settings": form.get("settings", {})
    }


@router.post("/submit/{token}")
async def submit_collection(
    request: Request,
    token: str,
    data: Dict[str, Any]
):
    """Submit a form response via collection token (no auth required)"""
    db = request.app.state.db
    
    # Verify token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    token_doc = await db.collection_tokens.find_one(
        {"token_hash": token_hash, "is_active": True},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    form_id = data.get("form_id")
    if not form_id or form_id not in token_doc["form_ids"]:
        raise HTTPException(status_code=403, detail="Form not assigned to this token")
    
    # Check submission limit
    if token_doc.get("max_submissions"):
        if token_doc.get("submission_count", 0) >= token_doc["max_submissions"]:
            raise HTTPException(status_code=403, detail="Submission limit reached")
    
    # Create submission
    submission_id = f"sub_{secrets.token_hex(8)}"
    now = datetime.now(timezone.utc)
    
    submission = {
        "id": submission_id,
        "form_id": form_id,
        "data": data.get("data", {}),
        "enumerator_name": token_doc["enumerator_name"],
        "collection_token_id": token_doc["id"],
        "source": "token_collection",
        "device_info": data.get("device_info", {}),
        "location": data.get("location"),
        "created_at": now.isoformat(),
        "status": "submitted"
    }
    
    await db.submissions.insert_one(submission)
    
    # Increment submission count
    await db.collection_tokens.update_one(
        {"id": token_doc["id"]},
        {"$inc": {"submission_count": 1}}
    )
    
    return {
        "message": "Submission recorded successfully",
        "submission_id": submission_id
    }


@router.get("/my-forms")
async def get_my_assigned_forms(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get forms assigned to the current enumerator (Option A - login-based)"""
    db = request.app.state.db
    
    # Get user's organization memberships
    memberships = await db.org_members.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "org_id": 1, "role": 1}
    ).to_list(100)
    
    org_ids = [m["org_id"] for m in memberships]
    
    # Get projects in those orgs
    projects = await db.projects.find(
        {"org_id": {"$in": org_ids}},
        {"_id": 0, "id": 1}
    ).to_list(1000)
    
    project_ids = [p["id"] for p in projects]
    
    # Get published forms in those projects
    forms = await db.forms.find(
        {"project_id": {"$in": project_ids}, "status": "published"},
        {"_id": 0, "id": 1, "name": 1, "description": 1, "fields": 1, "settings": 1, "project_id": 1}
    ).to_list(100)
    
    return {
        "forms": [
            {
                "id": f["id"],
                "name": f["name"],
                "description": f.get("description"),
                "field_count": len(f.get("fields", [])),
                "settings": f.get("settings", {})
            }
            for f in forms
        ]
    }
