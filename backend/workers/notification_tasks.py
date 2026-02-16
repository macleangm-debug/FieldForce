"""
FieldForce Notification Background Tasks
Handles async notification delivery
"""
import os
from datetime import datetime, timezone
from celery import shared_task
from pymongo import MongoClient

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'fieldforce')


def get_sync_db():
    """Get synchronous MongoDB client for Celery tasks"""
    client = MongoClient(MONGO_URL)
    return client[DB_NAME]


@shared_task
def send_email_notification(user_id: str, template: str, data: dict):
    """
    Send email notification asynchronously.
    """
    try:
        db = get_sync_db()
        
        user = db.users.find_one({"id": user_id})
        if not user or not user.get("email"):
            return {"status": "error", "message": "User not found or no email"}
        
        # Check user notification preferences
        prefs = user.get("notification_preferences", {})
        if not prefs.get("email_enabled", True):
            return {"status": "skipped", "message": "Email notifications disabled"}
        
        # TODO: Integrate with email service (Resend, SendGrid, etc.)
        # For now, log the notification
        notification_log = {
            "user_id": user_id,
            "email": user["email"],
            "template": template,
            "data": data,
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        db.notification_logs.insert_one(notification_log)
        
        return {
            "status": "success",
            "email": user["email"],
            "template": template
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """
    Send push notification to user's devices.
    """
    try:
        db = get_sync_db()
        
        # Get user's registered devices
        devices = list(db.devices.find({
            "user_id": user_id,
            "push_token": {"$ne": None},
            "status": "active"
        }))
        
        if not devices:
            return {"status": "skipped", "message": "No registered devices"}
        
        # TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        sent_count = 0
        for device in devices:
            # Log push notification
            db.notification_logs.insert_one({
                "user_id": user_id,
                "device_id": device["id"],
                "type": "push",
                "title": title,
                "body": body,
                "data": data,
                "status": "sent",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            sent_count += 1
        
        return {
            "status": "success",
            "devices_notified": sent_count
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def notify_submission_flagged(submission_id: str):
    """
    Notify supervisors when a submission is flagged for review.
    """
    try:
        db = get_sync_db()
        
        submission = db.submissions.find_one({"id": submission_id})
        if not submission:
            return {"status": "error", "message": "Submission not found"}
        
        # Get organization supervisors
        org_id = submission["org_id"]
        supervisors = list(db.org_members.find({
            "org_id": org_id,
            "role": {"$in": ["admin", "supervisor", "qa_reviewer"]}
        }))
        
        notified = 0
        for supervisor in supervisors:
            # Create in-app notification
            db.notifications.insert_one({
                "user_id": supervisor["user_id"],
                "type": "submission_flagged",
                "title": "Submission Flagged",
                "message": f"Submission {submission_id[:8]} requires review",
                "data": {
                    "submission_id": submission_id,
                    "form_id": submission["form_id"],
                    "quality_flags": submission.get("quality_flags", [])
                },
                "read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            notified += 1
        
        return {
            "status": "success",
            "supervisors_notified": notified
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def notify_daily_summary(org_id: str):
    """
    Send daily summary to organization admins.
    """
    try:
        db = get_sync_db()
        
        # Get yesterday's stats
        from datetime import timedelta
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        
        daily_stats = db.analytics_daily.find_one({
            "org_id": org_id,
            "date": yesterday
        })
        
        if not daily_stats:
            return {"status": "skipped", "message": "No stats for yesterday"}
        
        # Get admins
        admins = list(db.org_members.find({
            "org_id": org_id,
            "role": "admin"
        }))
        
        notified = 0
        for admin in admins:
            # Queue email notification
            send_email_notification.delay(
                admin["user_id"],
                "daily_summary",
                {
                    "date": yesterday,
                    "total_submissions": daily_stats["total_submissions"],
                    "avg_quality": daily_stats.get("avg_quality_score", 0),
                    "active_users": daily_stats.get("unique_users", 0)
                }
            )
            notified += 1
        
        return {
            "status": "success",
            "admins_notified": notified,
            "date": yesterday
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
