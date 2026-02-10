"""
Celery Background Tasks for FieldForce
Handles async processing, scheduled jobs, and heavy operations
"""
import os
from celery import Celery
from celery.schedules import crontab
import logging

logger = logging.getLogger(__name__)

# Initialize Celery
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
celery_app = Celery(
    'fieldforce',
    broker=redis_url,
    backend=redis_url,
    include=['tasks.submission_tasks', 'tasks.export_tasks', 'tasks.notification_tasks']
)

# Celery Configuration
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Task execution settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=4,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    
    # Rate limiting
    task_annotations={
        'tasks.export_tasks.generate_export': {'rate_limit': '10/m'},
        'tasks.notification_tasks.send_email': {'rate_limit': '100/m'},
    },
    
    # Retry settings
    task_default_retry_delay=60,
    task_max_retries=3,
    
    # Scheduled tasks (beat)
    beat_schedule={
        'cleanup-old-exports': {
            'task': 'tasks.export_tasks.cleanup_old_exports',
            'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        },
        'sync-usage-metrics': {
            'task': 'tasks.billing_tasks.sync_usage_metrics',
            'schedule': crontab(minute='*/15'),  # Every 15 minutes
        },
        'check-submission-quality': {
            'task': 'tasks.quality_tasks.batch_quality_check',
            'schedule': crontab(minute='*/30'),  # Every 30 minutes
        },
        'aggregate-analytics': {
            'task': 'tasks.analytics_tasks.aggregate_daily_stats',
            'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        },
    },
)


# Task base class with error handling
class BaseTask(celery_app.Task):
    """Base task with error handling and logging"""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {self.name}[{task_id}] failed: {exc}")
        super().on_failure(exc, task_id, args, kwargs, einfo)
    
    def on_success(self, retval, task_id, args, kwargs):
        logger.info(f"Task {self.name}[{task_id}] completed successfully")
        super().on_success(retval, task_id, args, kwargs)
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.warning(f"Task {self.name}[{task_id}] retrying: {exc}")
        super().on_retry(exc, task_id, args, kwargs, einfo)


celery_app.Task = BaseTask
