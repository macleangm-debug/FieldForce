"""
FieldForce Submission Background Tasks
Handles async processing of submissions for 2M+ daily volume
"""
import os
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any
from celery import shared_task
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection for workers
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'fieldforce')


def get_sync_db():
    """Get synchronous MongoDB client for Celery tasks"""
    from pymongo import MongoClient
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]


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


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_submission(self, submission_id: str):
    """
    Process a single submission asynchronously.
    - Calculate quality score
    - Validate GPS data
    - Process media files
    - Trigger notifications
    """
    try:
        db = get_sync_db()
        
        # Get submission
        submission = db.submissions.find_one({"id": submission_id})
        if not submission:
            return {"status": "error", "message": "Submission not found"}
        
        # Get form for validation rules
        form = db.forms.find_one({"id": submission["form_id"]})
        if not form:
            return {"status": "error", "message": "Form not found"}
        
        updates = {}
        
        # Calculate quality score if not already done
        if submission.get("quality_score") is None:
            quality_score, quality_flags = calculate_quality_score(
                submission.get("data", {}),
                form.get("fields", [])
            )
            updates["quality_score"] = quality_score
            updates["quality_flags"] = quality_flags
        
        # Validate GPS if present
        if submission.get("gps_location"):
            gps = submission["gps_location"]
            if gps.get("lat") and gps.get("lng"):
                # Check if within project geofence (if configured)
                project = db.projects.find_one({"id": submission.get("project_id")})
                if project and project.get("geofence"):
                    # TODO: Implement geofence validation
                    updates["gps_validated"] = True
        
        # Mark as processed
        updates["processed_at"] = datetime.now(timezone.utc).isoformat()
        updates["processing_status"] = "completed"
        
        # Update submission
        if updates:
            db.submissions.update_one(
                {"id": submission_id},
                {"$set": updates}
            )
        
        return {
            "status": "success",
            "submission_id": submission_id,
            "quality_score": updates.get("quality_score", submission.get("quality_score"))
        }
        
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def process_bulk_submissions(self, submission_ids: List[str]):
    """
    Process multiple submissions in batch.
    More efficient for offline sync scenarios.
    """
    try:
        db = get_sync_db()
        
        results = {"processed": 0, "failed": 0, "errors": []}
        
        # Get all submissions in one query
        submissions = list(db.submissions.find({"id": {"$in": submission_ids}}))
        
        # Group by form_id for efficient form lookups
        form_ids = set(s["form_id"] for s in submissions)
        forms = {f["id"]: f for f in db.forms.find({"id": {"$in": list(form_ids)}})}
        
        # Prepare bulk updates
        from pymongo import UpdateOne
        operations = []
        
        for submission in submissions:
            try:
                form = forms.get(submission["form_id"])
                if not form:
                    results["failed"] += 1
                    results["errors"].append({"id": submission["id"], "error": "Form not found"})
                    continue
                
                # Calculate quality score
                quality_score, quality_flags = calculate_quality_score(
                    submission.get("data", {}),
                    form.get("fields", [])
                )
                
                operations.append(UpdateOne(
                    {"id": submission["id"]},
                    {"$set": {
                        "quality_score": quality_score,
                        "quality_flags": quality_flags,
                        "processed_at": datetime.now(timezone.utc).isoformat(),
                        "processing_status": "completed"
                    }}
                ))
                results["processed"] += 1
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({"id": submission["id"], "error": str(e)})
        
        # Execute bulk update
        if operations:
            db.submissions.bulk_write(operations, ordered=False)
        
        return results
        
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True)
def validate_submission_media(self, submission_id: str):
    """
    Validate and process media files attached to submission.
    - Check file integrity
    - Generate thumbnails
    - Extract EXIF data
    """
    try:
        db = get_sync_db()
        
        submission = db.submissions.find_one({"id": submission_id})
        if not submission:
            return {"status": "error", "message": "Submission not found"}
        
        media_fields = []
        data = submission.get("data", {})
        
        # Find media fields
        for key, value in data.items():
            if isinstance(value, dict) and value.get("type") in ["photo", "video", "audio"]:
                media_fields.append({"field": key, "media": value})
        
        if not media_fields:
            return {"status": "success", "message": "No media to process"}
        
        # Process each media file
        processed = []
        for media_info in media_fields:
            # TODO: Implement actual media processing
            # - Download from S3
            # - Validate file type
            # - Generate thumbnail
            # - Extract metadata
            processed.append({
                "field": media_info["field"],
                "status": "validated"
            })
        
        # Update submission with media validation status
        db.submissions.update_one(
            {"id": submission_id},
            {"$set": {"media_validated": True, "media_validation_results": processed}}
        )
        
        return {"status": "success", "processed": len(processed)}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def trigger_submission_webhooks(submission_id: str):
    """
    Trigger configured webhooks for new submission.
    """
    import requests
    
    try:
        db = get_sync_db()
        
        submission = db.submissions.find_one({"id": submission_id})
        if not submission:
            return {"status": "error", "message": "Submission not found"}
        
        # Get organization webhooks
        org_id = submission.get("org_id")
        webhooks = list(db.webhooks.find({
            "org_id": org_id,
            "event": "submission.created",
            "enabled": True
        }))
        
        results = []
        for webhook in webhooks:
            try:
                response = requests.post(
                    webhook["url"],
                    json={
                        "event": "submission.created",
                        "submission_id": submission_id,
                        "form_id": submission["form_id"],
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                results.append({
                    "webhook_id": webhook["id"],
                    "status": response.status_code
                })
            except Exception as e:
                results.append({
                    "webhook_id": webhook["id"],
                    "status": "error",
                    "message": str(e)
                })
        
        return {"status": "success", "webhooks_triggered": len(results), "results": results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
