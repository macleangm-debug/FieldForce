"""
FieldForce Analytics Background Tasks
Aggregation and reporting tasks for high-volume data
"""
import os
from datetime import datetime, timezone, timedelta
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
def aggregate_hourly_stats():
    """
    Aggregate submission stats every hour.
    Pre-computes metrics for dashboard performance.
    """
    try:
        db = get_sync_db()
        
        now = datetime.now(timezone.utc)
        hour_start = now.replace(minute=0, second=0, microsecond=0)
        hour_end = hour_start + timedelta(hours=1)
        
        # Aggregate submissions by organization
        pipeline = [
            {
                "$match": {
                    "submitted_at": {
                        "$gte": hour_start.isoformat(),
                        "$lt": hour_end.isoformat()
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "org_id": "$org_id",
                        "project_id": "$project_id",
                        "form_id": "$form_id"
                    },
                    "count": {"$sum": 1},
                    "avg_quality": {"$avg": "$quality_score"},
                    "validated": {
                        "$sum": {"$cond": [{"$eq": ["$status", "validated"]}, 1, 0]}
                    },
                    "pending": {
                        "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                    },
                    "flagged": {
                        "$sum": {"$cond": [{"$eq": ["$status", "flagged"]}, 1, 0]}
                    }
                }
            }
        ]
        
        results = list(db.submissions.aggregate(pipeline))
        
        # Store aggregated stats
        for result in results:
            stat_doc = {
                "org_id": result["_id"]["org_id"],
                "project_id": result["_id"]["project_id"],
                "form_id": result["_id"]["form_id"],
                "period": "hourly",
                "period_start": hour_start.isoformat(),
                "period_end": hour_end.isoformat(),
                "submission_count": result["count"],
                "avg_quality_score": result["avg_quality"],
                "validated_count": result["validated"],
                "pending_count": result["pending"],
                "flagged_count": result["flagged"],
                "created_at": now.isoformat()
            }
            
            # Upsert to avoid duplicates
            db.analytics_hourly.update_one(
                {
                    "org_id": stat_doc["org_id"],
                    "project_id": stat_doc["project_id"],
                    "form_id": stat_doc["form_id"],
                    "period_start": stat_doc["period_start"]
                },
                {"$set": stat_doc},
                upsert=True
            )
        
        return {
            "status": "success",
            "period": hour_start.isoformat(),
            "aggregations": len(results)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def aggregate_daily_stats():
    """
    Aggregate daily submission stats.
    Runs at end of each day.
    """
    try:
        db = get_sync_db()
        
        now = datetime.now(timezone.utc)
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # Aggregate by organization
        pipeline = [
            {
                "$match": {
                    "submitted_at": {
                        "$gte": day_start.isoformat(),
                        "$lt": day_end.isoformat()
                    }
                }
            },
            {
                "$group": {
                    "_id": "$org_id",
                    "total_submissions": {"$sum": 1},
                    "unique_forms": {"$addToSet": "$form_id"},
                    "unique_users": {"$addToSet": "$submitted_by"},
                    "avg_quality": {"$avg": "$quality_score"},
                    "validated": {
                        "$sum": {"$cond": [{"$eq": ["$status", "validated"]}, 1, 0]}
                    },
                    "with_gps": {
                        "$sum": {"$cond": [{"$ne": ["$gps_location", None]}, 1, 0]}
                    },
                    "with_media": {
                        "$sum": {"$cond": [{"$eq": ["$has_media", True]}, 1, 0]}
                    }
                }
            }
        ]
        
        results = list(db.submissions.aggregate(pipeline))
        
        # Store daily stats
        for result in results:
            stat_doc = {
                "org_id": result["_id"],
                "date": day_start.strftime("%Y-%m-%d"),
                "period": "daily",
                "total_submissions": result["total_submissions"],
                "unique_forms": len(result["unique_forms"]),
                "unique_users": len(result["unique_users"]),
                "avg_quality_score": result["avg_quality"],
                "validated_count": result["validated"],
                "submissions_with_gps": result["with_gps"],
                "submissions_with_media": result["with_media"],
                "created_at": now.isoformat()
            }
            
            db.analytics_daily.update_one(
                {"org_id": stat_doc["org_id"], "date": stat_doc["date"]},
                {"$set": stat_doc},
                upsert=True
            )
        
        # Also aggregate team performance
        team_pipeline = [
            {
                "$match": {
                    "submitted_at": {
                        "$gte": day_start.isoformat(),
                        "$lt": day_end.isoformat()
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "org_id": "$org_id",
                        "user_id": "$submitted_by"
                    },
                    "submission_count": {"$sum": 1},
                    "avg_quality": {"$avg": "$quality_score"},
                    "unique_forms": {"$addToSet": "$form_id"}
                }
            }
        ]
        
        team_results = list(db.submissions.aggregate(team_pipeline))
        
        for result in team_results:
            db.analytics_team_daily.update_one(
                {
                    "org_id": result["_id"]["org_id"],
                    "user_id": result["_id"]["user_id"],
                    "date": day_start.strftime("%Y-%m-%d")
                },
                {"$set": {
                    "org_id": result["_id"]["org_id"],
                    "user_id": result["_id"]["user_id"],
                    "date": day_start.strftime("%Y-%m-%d"),
                    "submission_count": result["submission_count"],
                    "avg_quality_score": result["avg_quality"],
                    "forms_used": len(result["unique_forms"]),
                    "created_at": now.isoformat()
                }},
                upsert=True
            )
        
        return {
            "status": "success",
            "date": day_start.strftime("%Y-%m-%d"),
            "org_aggregations": len(results),
            "team_aggregations": len(team_results)
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def cleanup_old_data():
    """
    Clean up old temporary data and expired records.
    Runs daily to maintain database performance.
    """
    try:
        db = get_sync_db()
        now = datetime.now(timezone.utc)
        
        results = {}
        
        # Clean up old hourly stats (keep 7 days)
        cutoff_hourly = (now - timedelta(days=7)).isoformat()
        hourly_result = db.analytics_hourly.delete_many({
            "created_at": {"$lt": cutoff_hourly}
        })
        results["hourly_stats_deleted"] = hourly_result.deleted_count
        
        # Clean up old session data (keep 30 days)
        cutoff_sessions = (now - timedelta(days=30)).isoformat()
        sessions_result = db.help_chat_sessions.delete_many({
            "created_at": {"$lt": cutoff_sessions}
        })
        results["old_sessions_deleted"] = sessions_result.deleted_count
        
        # Clean up orphaned messages
        messages_result = db.help_chat_messages.delete_many({
            "timestamp": {"$lt": cutoff_sessions}
        })
        results["old_messages_deleted"] = messages_result.deleted_count
        
        # Archive old submissions to cold storage (optional - mark as archived)
        archive_cutoff = (now - timedelta(days=365)).isoformat()
        archive_result = db.submissions.update_many(
            {
                "submitted_at": {"$lt": archive_cutoff},
                "archived": {"$ne": True}
            },
            {"$set": {"archived": True, "archived_at": now.isoformat()}}
        )
        results["submissions_archived"] = archive_result.modified_count
        
        return {"status": "success", "cleanup_results": results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@shared_task
def generate_org_report(org_id: str, report_type: str, date_range: dict):
    """
    Generate organization report on demand.
    """
    try:
        db = get_sync_db()
        
        start_date = date_range.get("start")
        end_date = date_range.get("end")
        
        # Build base query
        query = {
            "org_id": org_id,
            "submitted_at": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        
        report_data = {
            "org_id": org_id,
            "report_type": report_type,
            "date_range": date_range,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if report_type == "summary":
            # Summary statistics
            total = db.submissions.count_documents(query)
            validated = db.submissions.count_documents({**query, "status": "validated"})
            
            # Quality distribution
            quality_pipeline = [
                {"$match": query},
                {"$bucket": {
                    "groupBy": "$quality_score",
                    "boundaries": [0, 50, 70, 85, 100, 101],
                    "default": "unknown",
                    "output": {"count": {"$sum": 1}}
                }}
            ]
            quality_dist = list(db.submissions.aggregate(quality_pipeline))
            
            report_data["summary"] = {
                "total_submissions": total,
                "validated_submissions": validated,
                "validation_rate": round(validated / total * 100, 2) if total > 0 else 0,
                "quality_distribution": quality_dist
            }
            
        elif report_type == "team_performance":
            # Team performance report
            team_pipeline = [
                {"$match": query},
                {"$group": {
                    "_id": "$submitted_by",
                    "submissions": {"$sum": 1},
                    "avg_quality": {"$avg": "$quality_score"},
                    "validated": {"$sum": {"$cond": [{"$eq": ["$status", "validated"]}, 1, 0]}}
                }},
                {"$sort": {"submissions": -1}}
            ]
            team_stats = list(db.submissions.aggregate(team_pipeline))
            
            # Enrich with user names
            user_ids = [s["_id"] for s in team_stats]
            users = {u["id"]: u for u in db.users.find({"id": {"$in": user_ids}})}
            
            for stat in team_stats:
                user = users.get(stat["_id"], {})
                stat["user_name"] = user.get("name", "Unknown")
                stat["user_email"] = user.get("email", "")
            
            report_data["team_performance"] = team_stats
            
        elif report_type == "geographic":
            # Geographic distribution
            geo_pipeline = [
                {"$match": {**query, "gps_location": {"$ne": None}}},
                {"$group": {
                    "_id": {
                        "lat": {"$round": [{"$toDouble": "$gps_location.lat"}, 2]},
                        "lng": {"$round": [{"$toDouble": "$gps_location.lng"}, 2]}
                    },
                    "count": {"$sum": 1}
                }}
            ]
            geo_data = list(db.submissions.aggregate(geo_pipeline))
            report_data["geographic_distribution"] = geo_data
        
        # Store report
        report_data["id"] = f"report_{org_id}_{report_type}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        db.reports.insert_one(report_data)
        
        return {
            "status": "success",
            "report_id": report_data["id"],
            "report_type": report_type
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
