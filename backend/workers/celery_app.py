"""
FieldForce Celery Configuration
Background task processing for high-volume submission handling
Supports 2M+ daily submissions
"""
import os
from celery import Celery
from kombu import Queue, Exchange
from dotenv import load_dotenv

load_dotenv()

# Redis URL for Celery broker and backend
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')

# Create Celery app
celery_app = Celery(
    'fieldforce',
    broker=REDIS_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        'workers.submission_tasks',
        'workers.analytics_tasks',
        'workers.notification_tasks',
    ]
)

# Celery Configuration for High Throughput
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Performance settings for 2M+ daily submissions
    worker_prefetch_multiplier=4,  # Prefetch 4 tasks per worker
    worker_concurrency=8,  # 8 concurrent tasks per worker
    task_acks_late=True,  # Acknowledge after task completion
    task_reject_on_worker_lost=True,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_compression='gzip',
    
    # Rate limiting
    task_annotations={
        'workers.submission_tasks.process_submission': {'rate_limit': '1000/m'},
        'workers.submission_tasks.process_bulk_submissions': {'rate_limit': '100/m'},
        'workers.analytics_tasks.aggregate_daily_stats': {'rate_limit': '1/m'},
    },
    
    # Task routing - separate queues for different priorities
    task_routes={
        'workers.submission_tasks.*': {'queue': 'submissions'},
        'workers.analytics_tasks.*': {'queue': 'analytics'},
        'workers.notification_tasks.*': {'queue': 'notifications'},
    },
    
    # Queue definitions
    task_queues=(
        Queue('submissions', Exchange('submissions'), routing_key='submissions',
              queue_arguments={'x-max-priority': 10}),
        Queue('analytics', Exchange('analytics'), routing_key='analytics'),
        Queue('notifications', Exchange('notifications'), routing_key='notifications'),
        Queue('default', Exchange('default'), routing_key='default'),
    ),
    
    # Default queue
    task_default_queue='default',
    task_default_exchange='default',
    task_default_routing_key='default',
    
    # Beat scheduler for periodic tasks
    beat_schedule={
        'aggregate-hourly-stats': {
            'task': 'workers.analytics_tasks.aggregate_hourly_stats',
            'schedule': 3600.0,  # Every hour
        },
        'aggregate-daily-stats': {
            'task': 'workers.analytics_tasks.aggregate_daily_stats',
            'schedule': 86400.0,  # Every 24 hours
        },
        'cleanup-old-results': {
            'task': 'workers.analytics_tasks.cleanup_old_data',
            'schedule': 86400.0,  # Daily cleanup
        },
    },
)

# Task priorities
class TaskPriority:
    LOW = 1
    NORMAL = 5
    HIGH = 8
    CRITICAL = 10
