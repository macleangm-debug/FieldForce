"""
FieldForce - Submission Routes
Optimized for 2M+ daily submissions with bulk operations and async processing
"""
from fastapi import APIRouter, HTTPException, status, Request, Depends, Query, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from pymongo import InsertOne, UpdateOne
import logging

from models import Submission, SubmissionCreate, SubmissionOut
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/submissions", tags=["Submissions"])

# Try to import Celery tasks (optional - graceful fallback if not available)
try:
    from workers.submission_tasks import (
        process_submission,
        process_bulk_submissions,
        validate_submission_media,
        trigger_submission_webhooks
    )
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    logger.warning("Celery workers not available - running in synchronous mode")


class SubmissionReview(BaseModel):
    status: str  # approved, rejected, flagged
    notes: Optional[str] = None


class BulkSubmissionCreate(BaseModel):
    submissions: List[SubmissionCreate]
    async_processing: bool = True  # Enable async processing by default


class BulkSubmissionResponse(BaseModel):
    success_count: int
    error_count: int
    submission_ids: List[str]
    errors: List[dict]
    processing_mode: str  # "async" or "sync"
    task_id: Optional[str] = None


async def check_form_access(db, form_id: str, user_id: str):
    """Check if user has access to form's organization"""
    form = await db.forms.find_one({"id": form_id}, {"_id": 0})
    if not form:
        return None, None
    
    membership = await db.org_members.find_one(
        {"org_id": form["org_id"], "user_id": user_id},
        {"_id": 0}
    )
    return membership, form


def calculate_quality_score(data: Dict[str, Any], form_fields: List[Dict]) -> tuple:
    """Calculate submission quality score and flags"""
    score = 100.0
    flags = []
    
    field_map = {f["name"]: f for f in form_fields}
    
    for field_name, field_config in field_map.items():
        value = data.get(field_name)
        
        # Check required fields
        if field_config.get("validation", {}).get("required") and not value:
            score -= 10
            flags.append(f"missing_required:{field_name}")
        
        # Check value constraints
        validation = field_config.get("validation", {})
        if value is not None:
            if validation.get("min_value") and isinstance(value, (int, float)):
                if value < validation["min_value"]:
                    score -= 5
                    flags.append(f"below_min:{field_name}")
            
            if validation.get("max_value") and isinstance(value, (int, float)):
                if value > validation["max_value"]:
                    score -= 5
                    flags.append(f"above_max:{field_name}")
    
    return max(0, score), flags


@router.post("", response_model=SubmissionOut)
async def create_submission(
    request: Request,
    data: SubmissionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Submit form data"""
    db = request.app.state.db
    
    # Check form access
    membership, form = await check_form_access(db, data.form_id, current_user["user_id"])
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit to this form"
        )
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    if form["status"] != "published":
        raise HTTPException(status_code=400, detail="Form is not published")
    
    # Calculate quality score
    quality_score, quality_flags = calculate_quality_score(
        data.data,
        form.get("fields", [])
    )
    
    # Extract GPS if present
    gps_location = None
    gps_accuracy = None
    if "_gps" in data.data:
        gps_data = data.data["_gps"]
        if isinstance(gps_data, dict):
            gps_location = {
                "lat": gps_data.get("latitude"),
                "lng": gps_data.get("longitude")
            }
            gps_accuracy = gps_data.get("accuracy")
    
    # Create submission
    submission = Submission(
        form_id=data.form_id,
        form_version=data.form_version or form["version"],
        data=data.data,
        device_id=data.device_id,
        device_info=data.device_info,
        org_id=form["org_id"],
        project_id=form["project_id"],
        submitted_by=current_user["user_id"],
        gps_location=gps_location,
        gps_accuracy=gps_accuracy,
        quality_score=quality_score,
        quality_flags=quality_flags
    )
    
    submission_dict = submission.model_dump()
    submission_dict["submitted_at"] = submission_dict["submitted_at"].isoformat()
    if submission_dict.get("synced_at"):
        submission_dict["synced_at"] = submission_dict["synced_at"].isoformat()
    if submission_dict.get("reviewed_at"):
        submission_dict["reviewed_at"] = submission_dict["reviewed_at"].isoformat()
    
    await db.submissions.insert_one(submission_dict)
    
    # Trigger async processing if Celery is available and Redis is connected
    if CELERY_AVAILABLE:
        try:
            process_submission.delay(submission.id)
            validate_submission_media.delay(submission.id)
            trigger_submission_webhooks.delay(submission.id)
        except Exception as e:
            # Celery not available (Redis down), skip async processing
            logger.warning(f"Celery task failed (Redis unavailable): {e}")
    
    return SubmissionOut(
        id=submission.id,
        form_id=submission.form_id,
        form_version=submission.form_version,
        data=submission.data,
        submitted_by=submission.submitted_by,
        submitted_at=submission.submitted_at,
        status=submission.status,
        quality_score=submission.quality_score,
        quality_flags=submission.quality_flags,
        gps_location=submission.gps_location
    )


@router.post("/bulk", response_model=BulkSubmissionResponse)
async def create_bulk_submissions(
    request: Request,
    data: BulkSubmissionCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit multiple form entries (optimized for offline sync).
    
    Supports 2M+ daily submissions with:
    - Bulk MongoDB operations (10-50x faster)
    - Async background processing via Celery
    - Graceful error handling per submission
    
    Args:
        data: BulkSubmissionCreate with list of submissions
        data.async_processing: If True, heavy processing happens in background
    
    Returns:
        BulkSubmissionResponse with success/error counts and task_id for tracking
    """
    db = request.app.state.db
    
    submission_ids = []
    errors = []
    bulk_operations = []
    submissions_for_processing = []
    
    # Pre-fetch all unique forms in one query (optimization)
    form_ids = list(set(sub.form_id for sub in data.submissions))
    forms_cursor = db.forms.find({"id": {"$in": form_ids}}, {"_id": 0})
    forms_map = {form["id"]: form async for form in forms_cursor}
    
    # Pre-check user access to organizations
    org_ids = list(set(f.get("org_id") for f in forms_map.values() if f))
    memberships_cursor = db.org_members.find(
        {"org_id": {"$in": org_ids}, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    user_orgs = {m["org_id"] async for m in memberships_cursor}
    is_superadmin = current_user.get("is_superadmin", False)
    
    # Process each submission
    for idx, sub_data in enumerate(data.submissions):
        try:
            form = forms_map.get(sub_data.form_id)
            
            if not form:
                errors.append({"index": idx, "error": "Form not found", "form_id": sub_data.form_id})
                continue
            
            # Check access
            if not is_superadmin and form["org_id"] not in user_orgs:
                errors.append({"index": idx, "error": "Not authorized", "form_id": sub_data.form_id})
                continue
            
            # Extract GPS if present
            gps_location = None
            gps_accuracy = None
            if "_gps" in sub_data.data:
                gps_data = sub_data.data["_gps"]
                if isinstance(gps_data, dict):
                    gps_location = {
                        "lat": gps_data.get("latitude"),
                        "lng": gps_data.get("longitude")
                    }
                    gps_accuracy = gps_data.get("accuracy")
            
            # Create submission object (quality score calculated async if enabled)
            submission = Submission(
                form_id=sub_data.form_id,
                form_version=sub_data.form_version or form["version"],
                data=sub_data.data,
                device_id=sub_data.device_id,
                device_info=sub_data.device_info,
                org_id=form["org_id"],
                project_id=form["project_id"],
                submitted_by=current_user["user_id"],
                synced_at=datetime.now(timezone.utc),
                gps_location=gps_location,
                gps_accuracy=gps_accuracy,
                # Quality score will be calculated async if enabled
                quality_score=None if data.async_processing else None,
                quality_flags=[],
                processing_status="pending" if data.async_processing else "completed"
            )
            
            submission_dict = submission.model_dump()
            submission_dict["submitted_at"] = submission_dict["submitted_at"].isoformat()
            submission_dict["synced_at"] = submission_dict["synced_at"].isoformat()
            
            # Calculate quality score synchronously if not using async processing
            if not data.async_processing:
                quality_score, quality_flags = calculate_quality_score(
                    sub_data.data,
                    form.get("fields", [])
                )
                submission_dict["quality_score"] = quality_score
                submission_dict["quality_flags"] = quality_flags
                submission_dict["processing_status"] = "completed"
            
            # Add to bulk operations
            bulk_operations.append(InsertOne(submission_dict))
            submission_ids.append(submission.id)
            submissions_for_processing.append(submission.id)
            
        except Exception as e:
            logger.error(f"Error processing submission {idx}: {str(e)}")
            errors.append({"index": idx, "error": str(e)})
    
    # Execute bulk insert (single round-trip to MongoDB)
    task_id = None
    if bulk_operations:
        try:
            result = await db.submissions.bulk_write(bulk_operations, ordered=False)
            logger.info(f"Bulk insert: {result.inserted_count} submissions inserted")
            
            # Trigger async processing if Celery is available and async mode enabled
            if CELERY_AVAILABLE and data.async_processing and submissions_for_processing:
                task = process_bulk_submissions.delay(submissions_for_processing)
                task_id = task.id
                logger.info(f"Async processing task queued: {task_id}")
            
        except Exception as e:
            logger.error(f"Bulk write error: {str(e)}")
            # Try to extract which operations failed
            errors.append({"index": -1, "error": f"Bulk write error: {str(e)}"})
    
    return BulkSubmissionResponse(
        success_count=len(submission_ids),
        error_count=len(errors),
        submission_ids=submission_ids,
        errors=errors,
        processing_mode="async" if (CELERY_AVAILABLE and data.async_processing) else "sync",
        task_id=task_id
    )


@router.get("", response_model=List[SubmissionOut])
async def list_submissions(
    request: Request,
    form_id: str,
    status_filter: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """List form submissions"""
    db = request.app.state.db
    
    # Check form access
    membership, form = await check_form_access(db, form_id, current_user["user_id"])
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Build query
    query = {"form_id": form_id}
    if status_filter:
        query["status"] = status_filter
    if start_date:
        query["submitted_at"] = {"$gte": start_date}
    if end_date:
        if "submitted_at" in query:
            query["submitted_at"]["$lte"] = end_date
        else:
            query["submitted_at"] = {"$lte": end_date}
    
    skip = (page - 1) * page_size
    
    submissions = await db.submissions.find(
        query, {"_id": 0}
    ).sort("submitted_at", -1).skip(skip).limit(page_size).to_list(page_size)
    
    return [
        SubmissionOut(
            id=s["id"],
            form_id=s["form_id"],
            form_version=s["form_version"],
            data=s["data"],
            submitted_by=s["submitted_by"],
            submitted_at=datetime.fromisoformat(s["submitted_at"]) if isinstance(s["submitted_at"], str) else s["submitted_at"],
            status=s["status"],
            quality_score=s.get("quality_score"),
            quality_flags=s.get("quality_flags", []),
            gps_location=s.get("gps_location")
        )
        for s in submissions
    ]


@router.get("/{submission_id}", response_model=SubmissionOut)
async def get_submission(
    request: Request,
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get submission details"""
    db = request.app.state.db
    
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check access
    membership = await db.org_members.find_one(
        {"org_id": submission["org_id"], "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return SubmissionOut(
        id=submission["id"],
        form_id=submission["form_id"],
        form_version=submission["form_version"],
        data=submission["data"],
        submitted_by=submission["submitted_by"],
        submitted_at=datetime.fromisoformat(submission["submitted_at"]) if isinstance(submission["submitted_at"], str) else submission["submitted_at"],
        status=submission["status"],
        quality_score=submission.get("quality_score"),
        quality_flags=submission.get("quality_flags", []),
        gps_location=submission.get("gps_location")
    )


@router.patch("/{submission_id}/review")
async def review_submission(
    request: Request,
    submission_id: str,
    data: SubmissionReview,
    current_user: dict = Depends(get_current_user)
):
    """Review a submission (approve/reject/flag)"""
    db = request.app.state.db
    
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check manager/analyst access
    membership = await db.org_members.find_one(
        {
            "org_id": submission["org_id"],
            "user_id": current_user["user_id"],
            "role": {"$in": ["admin", "manager", "analyst"]}
        },
        {"_id": 0}
    )
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or analyst access required"
        )
    
    valid_statuses = ["pending", "approved", "rejected", "flagged"]
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {
            "status": data.status,
            "reviewer_id": current_user["user_id"],
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "review_notes": data.notes
        }}
    )
    
    return {"message": "Submission reviewed", "status": data.status}


@router.delete("/{submission_id}")
async def delete_submission(
    request: Request,
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a submission"""
    db = request.app.state.db
    
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check admin access
    membership = await db.org_members.find_one(
        {
            "org_id": submission["org_id"],
            "user_id": current_user["user_id"],
            "role": "admin"
        },
        {"_id": 0}
    )
    
    if not membership and not current_user.get("is_superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    await db.submissions.delete_one({"id": submission_id})
    
    return {"message": "Submission deleted"}
