"""
Prometheus Metrics Middleware for FieldForce
Exposes application metrics for monitoring
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import logging

logger = logging.getLogger(__name__)

# Metrics definitions
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

REQUESTS_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'Number of HTTP requests in progress',
    ['method', 'endpoint']
)

# Application-specific metrics
SUBMISSIONS_TOTAL = Counter(
    'fieldforce_submissions_total',
    'Total submissions received',
    ['form_id', 'status']
)

SUBMISSIONS_PROCESSING_TIME = Histogram(
    'fieldforce_submission_processing_seconds',
    'Time to process a submission',
    ['form_id'],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

BULK_SUBMISSIONS = Counter(
    'fieldforce_bulk_submissions_total',
    'Total bulk submission batches',
    ['status']
)

BULK_SUBMISSION_SIZE = Histogram(
    'fieldforce_bulk_submission_size',
    'Number of submissions per bulk request',
    buckets=[10, 50, 100, 500, 1000, 5000, 10000]
)

ACTIVE_USERS = Gauge(
    'fieldforce_active_users',
    'Number of active users in last 5 minutes'
)

DB_CONNECTIONS = Gauge(
    'fieldforce_db_connections',
    'Number of active database connections',
    ['database']
)

CELERY_QUEUE_LENGTH = Gauge(
    'celery_queue_length',
    'Number of tasks in Celery queue',
    ['queue']
)

CELERY_WORKERS = Gauge(
    'celery_workers_total',
    'Number of active Celery workers'
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP request metrics"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip metrics endpoint
        if request.url.path == "/metrics":
            return await call_next(request)
        
        method = request.method
        # Normalize endpoint paths (remove IDs)
        path = self._normalize_path(request.url.path)
        
        # Track request start
        REQUESTS_IN_PROGRESS.labels(method=method, endpoint=path).inc()
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status = response.status_code
        except Exception as e:
            status = 500
            raise e
        finally:
            # Record metrics
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=path, status=status).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)
            REQUESTS_IN_PROGRESS.labels(method=method, endpoint=path).dec()
        
        return response
    
    def _normalize_path(self, path: str) -> str:
        """Normalize path to avoid high cardinality from IDs"""
        import re
        # Replace UUIDs
        path = re.sub(r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', '{id}', path)
        # Replace MongoDB ObjectIds
        path = re.sub(r'[a-f0-9]{24}', '{id}', path)
        # Replace numeric IDs
        path = re.sub(r'/\d+', '/{id}', path)
        return path


def get_metrics():
    """Generate Prometheus metrics output"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


# Helper functions to record custom metrics
def record_submission(form_id: str, status: str = "success"):
    """Record a submission event"""
    SUBMISSIONS_TOTAL.labels(form_id=form_id, status=status).inc()


def record_submission_time(form_id: str, duration: float):
    """Record submission processing time"""
    SUBMISSIONS_PROCESSING_TIME.labels(form_id=form_id).observe(duration)


def record_bulk_submission(success: bool, batch_size: int):
    """Record a bulk submission event"""
    status = "success" if success else "error"
    BULK_SUBMISSIONS.labels(status=status).inc()
    BULK_SUBMISSION_SIZE.observe(batch_size)


def update_active_users(count: int):
    """Update active users gauge"""
    ACTIVE_USERS.set(count)


def update_db_connections(database: str, count: int):
    """Update database connections gauge"""
    DB_CONNECTIONS.labels(database=database).set(count)


def update_celery_queue(queue: str, length: int):
    """Update Celery queue length gauge"""
    CELERY_QUEUE_LENGTH.labels(queue=queue).set(length)


def update_celery_workers(count: int):
    """Update Celery workers count"""
    CELERY_WORKERS.set(count)
