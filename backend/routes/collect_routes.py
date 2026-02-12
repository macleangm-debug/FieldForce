"""FieldForce - Data Collection Routes for Enumerators"""
from fastapi import APIRouter, HTTPException, status, Request, Depends, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import secrets
import hashlib
import io
import random
import pandas as pd

from auth import get_current_user
from utils.url_shortener import shorten_url

router = APIRouter(prefix="/collect", tags=["Data Collection"])


class CollectionTokenCreate(BaseModel):
    """Create a collection token for an enumerator"""
    enumerator_name: str
    enumerator_email: Optional[str] = None
    form_ids: List[str]  # Forms this token can access
    expires_days: int = 30  # Token validity in days
    max_submissions: Optional[int] = None  # Optional limit
    security_mode: str = "standard"  # 'standard' | 'device_locked' | 'pin_protected'
    require_pin: bool = False
    pin_code: Optional[str] = None


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
    
    # Validate PIN if required
    if data.security_mode == "pin_protected":
        if not data.pin_code or len(data.pin_code) != 4 or not data.pin_code.isdigit():
            raise HTTPException(status_code=400, detail="PIN must be a 4-digit number")
    
    # Generate token
    token = generate_token()
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    # Hash PIN if provided (don't store plaintext)
    pin_hash = None
    if data.pin_code:
        pin_hash = hashlib.sha256(data.pin_code.encode()).hexdigest()
    
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
        "is_active": True,
        # Security settings
        "security_mode": data.security_mode,
        "require_pin": data.require_pin,
        "pin_hash": pin_hash,
        # Device tracking
        "locked_device_id": None,  # Will be set when device_locked mode activates
        "device_info": None,  # Captured device info
        "device_registered_at": None
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
        {"_id": 0, "token_hash": 0, "pin_hash": 0}
    ).to_list(1000)
    
    result = []
    for t in tokens:
        token_out = CollectionTokenOut(
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
        )
        # Add security_mode as extra field (not in Pydantic model but passed through)
        result.append({
            **token_out.dict(),
            "security_mode": t.get("security_mode", "standard"),
            "device_locked": t.get("locked_device_id") is not None
        })
    
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
        "max_submissions": token_doc.get("max_submissions"),
        # Security info for frontend
        "security_mode": token_doc.get("security_mode", "standard"),
        "require_pin": token_doc.get("require_pin", False),
        "device_locked": token_doc.get("locked_device_id") is not None,
        "token_id": token_doc["id"]
    }


class DeviceRegistration(BaseModel):
    """Device registration data from frontend"""
    device_id: str  # Generated on frontend, stored in localStorage
    device_type: str  # 'mobile' | 'tablet' | 'desktop'
    browser: str
    os: str
    screen_width: int
    screen_height: int
    user_agent: str
    pin: Optional[str] = None


@router.post("/register-device/{token}")
async def register_device(
    request: Request,
    token: str,
    data: DeviceRegistration
):
    """
    Register a device for a collection token.
    Called when enumerator first opens the link.
    """
    db = request.app.state.db
    
    # Verify token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    token_doc = await db.collection_tokens.find_one(
        {"token_hash": token_hash, "is_active": True},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    security_mode = token_doc.get("security_mode", "standard")
    
    # Check PIN if required
    if security_mode == "pin_protected" or token_doc.get("require_pin"):
        if not data.pin:
            raise HTTPException(status_code=403, detail="PIN required")
        
        pin_hash = hashlib.sha256(data.pin.encode()).hexdigest()
        if pin_hash != token_doc.get("pin_hash"):
            raise HTTPException(status_code=403, detail="Invalid PIN")
    
    # Check if device is already locked to another device
    if security_mode in ["device_locked", "pin_protected"]:
        locked_device = token_doc.get("locked_device_id")
        if locked_device and locked_device != data.device_id:
            raise HTTPException(
                status_code=403, 
                detail="This link is locked to another device. Contact your supervisor."
            )
    
    # Register/update device info
    now = datetime.now(timezone.utc)
    device_info = {
        "device_id": data.device_id,
        "device_type": data.device_type,
        "browser": data.browser,
        "os": data.os,
        "screen": f"{data.screen_width}x{data.screen_height}",
        "user_agent": data.user_agent,
        "registered_at": now.isoformat(),
        "last_seen": now.isoformat()
    }
    
    update_data = {
        "device_info": device_info,
        "device_registered_at": now.isoformat()
    }
    
    # Lock device if mode requires it
    if security_mode in ["device_locked", "pin_protected"]:
        update_data["locked_device_id"] = data.device_id
    
    await db.collection_tokens.update_one(
        {"token_hash": token_hash},
        {"$set": update_data}
    )
    
    # Also add to collection_devices for the Devices page
    device_doc = {
        "id": f"dev_{secrets.token_hex(8)}",
        "device_id": data.device_id,
        "token_id": token_doc["id"],
        "enumerator_name": token_doc["enumerator_name"],
        "device_type": data.device_type,
        "device_name": f"{data.browser} on {data.os}",
        "os_name": data.os,
        "browser": data.browser,
        "screen": f"{data.screen_width}x{data.screen_height}",
        "user_agent": data.user_agent,
        "status": "active",
        "registered_at": now.isoformat(),
        "last_seen": now.isoformat(),
        "created_by": token_doc.get("created_by"),
        "source": "token_collection"
    }
    
    # Upsert - update if exists, insert if not
    await db.collection_devices.update_one(
        {"device_id": data.device_id, "token_id": token_doc["id"]},
        {"$set": device_doc},
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Device registered successfully",
        "device_locked": security_mode in ["device_locked", "pin_protected"]
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



@router.post("/tokens/bulk-import", response_model=BulkImportResult)
async def bulk_import_enumerators(
    request: Request,
    file: UploadFile = File(...),
    form_ids: str = None,  # Comma-separated form IDs
    expires_days: int = 30,
    max_submissions: Optional[int] = None,
    security_mode: str = "standard",  # 'standard' | 'device_locked' | 'pin_protected'
    pin_mode: str = "auto",  # 'auto' | 'shared' (for pin_protected mode)
    shared_pin: Optional[str] = None,  # Used when pin_mode is 'shared'
    current_user: dict = Depends(get_current_user)
):
    """
    Bulk import enumerators from CSV or Excel file with security options.
    
    Expected columns:
    - name (required): Enumerator name
    - email (optional): Enumerator email
    
    Query params:
    - form_ids: Comma-separated list of form IDs to assign
    - expires_days: Token validity in days (default: 30)
    - max_submissions: Max submissions per enumerator (optional)
    - security_mode: 'standard', 'device_locked', or 'pin_protected'
    - pin_mode: 'auto' (unique PINs) or 'shared' (same PIN for all)
    - shared_pin: 4-digit PIN when pin_mode is 'shared'
    """
    db = request.app.state.db
    
    # Validate file type
    filename = file.filename.lower()
    if not filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a CSV or Excel file."
        )
    
    # Parse form_ids
    if not form_ids:
        raise HTTPException(
            status_code=400,
            detail="Please specify form_ids to assign to enumerators"
        )
    
    assigned_form_ids = [fid.strip() for fid in form_ids.split(',') if fid.strip()]
    if not assigned_form_ids:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one form ID"
        )
    
    # Validate security mode
    valid_security_modes = ['standard', 'device_locked', 'pin_protected']
    if security_mode not in valid_security_modes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid security_mode. Must be one of: {', '.join(valid_security_modes)}"
        )
    
    # Validate PIN settings
    if security_mode == 'pin_protected':
        if pin_mode == 'shared' and (not shared_pin or len(shared_pin) != 4):
            raise HTTPException(
                status_code=400,
                detail="Shared PIN must be exactly 4 digits"
            )
    
    # Read file content
    content = await file.read()
    
    try:
        # Parse file based on type
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Normalize column names (lowercase, strip whitespace)
        df.columns = [col.lower().strip() for col in df.columns]
        
        # Check required columns
        if 'name' not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="Missing required column: 'name'. File must have a 'name' column."
            )
        
        # Process each row
        results = {
            "success_count": 0,
            "error_count": 0,
            "errors": [],
            "created_tokens": []
        }
        
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=expires_days)
        
        # Hash shared PIN once if applicable
        shared_pin_hash = None
        if security_mode == 'pin_protected' and pin_mode == 'shared' and shared_pin:
            shared_pin_hash = hashlib.sha256(shared_pin.encode()).hexdigest()
        
        for idx, row in df.iterrows():
            row_num = idx + 2  # Account for header and 0-indexing
            
            # Get name
            name = str(row.get('name', '')).strip()
            if not name or name.lower() == 'nan':
                results["error_count"] += 1
                results["errors"].append({
                    "row": row_num,
                    "error": "Missing or empty name"
                })
                continue
            
            # Get email (optional)
            email = str(row.get('email', '')).strip() if 'email' in df.columns else None
            if email and email.lower() == 'nan':
                email = None
            
            # Generate token
            token = generate_token()
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            
            # Generate PIN if needed
            pin_value = None
            pin_hash_value = None
            if security_mode == 'pin_protected':
                if pin_mode == 'auto':
                    # Generate unique 4-digit PIN
                    pin_value = str(random.randint(1000, 9999))
                    pin_hash_value = hashlib.sha256(pin_value.encode()).hexdigest()
                else:
                    # Use shared PIN
                    pin_value = shared_pin
                    pin_hash_value = shared_pin_hash
            
            token_doc = {
                "id": f"ct_{secrets.token_hex(8)}",
                "token_hash": token_hash,
                "enumerator_name": name,
                "enumerator_email": email,
                "form_ids": assigned_form_ids,
                "created_by": current_user["user_id"],
                "created_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "submission_count": 0,
                "max_submissions": max_submissions,
                "is_active": True,
                "source": "bulk_import",
                "security_mode": security_mode,
                "pin_hash": pin_hash_value,
                "locked_device_id": None,
                "device_info": None
            }
            
            try:
                await db.collection_tokens.insert_one(token_doc)
                
                results["success_count"] += 1
                results["created_tokens"].append({
                    "id": token_doc["id"],
                    "token": token,
                    "name": name,
                    "email": email,
                    "pin": pin_value  # Include PIN in response for distribution
                })
            except Exception as e:
                results["error_count"] += 1
                results["errors"].append({
                    "row": row_num,
                    "name": name,
                    "error": str(e)
                })
        
        return BulkImportResult(**results)
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")


@router.get("/tokens/template")
async def download_import_template():
    """Download a sample CSV template for bulk enumerator import"""
    return {
        "template_url": "data:text/csv;charset=utf-8,name,email\nJohn Smith,john@example.com\nJane Doe,jane@example.com",
        "columns": [
            {"name": "name", "required": True, "description": "Enumerator's full name"},
            {"name": "email", "required": False, "description": "Enumerator's email address (optional)"}
        ],
        "instructions": "Upload a CSV or Excel file with 'name' column (required) and optional 'email' column."
    }



class ShortenURLRequest(BaseModel):
    """Request to shorten a URL"""
    url: str


class ShortenURLResponse(BaseModel):
    """Response with shortened URL"""
    original_url: str
    short_url: Optional[str]
    success: bool
    error: Optional[str] = None


@router.post("/shorten-url", response_model=ShortenURLResponse)
async def shorten_collection_url(
    data: ShortenURLRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Shorten a collection link URL using TinyURL.
    
    This is useful for creating shorter, more shareable links
    for WhatsApp, SMS, or other channels with character limits.
    """
    original_url = data.url.strip()
    
    if not original_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=400,
            detail="URL must start with http:// or https://"
        )
    
    short_url = await shorten_url(original_url)
    
    if short_url:
        return ShortenURLResponse(
            original_url=original_url,
            short_url=short_url,
            success=True
        )
    else:
        return ShortenURLResponse(
            original_url=original_url,
            short_url=None,
            success=False,
            error="Failed to shorten URL. The link shortening service may be temporarily unavailable."
        )
