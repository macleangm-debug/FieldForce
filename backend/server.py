"""FieldForce - Mobile Data Collection Suite API
A streamlined version focused on field data collection for DataVision International
Production-ready with Redis caching, rate limiting, and S3 storage support
"""
from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Production mode check
PRODUCTION_MODE = os.environ.get("PRODUCTION_MODE", "false").lower() == "true"

# MongoDB connection with connection pooling
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    minPoolSize=10,
    maxPoolSize=100,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
    retryWrites=True,
    w='majority'
)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="FieldForce API",
    description="Mobile Data Collection Suite by DataVision International",
    version="1.0.0",
    docs_url="/api/docs" if not PRODUCTION_MODE else None,
    redoc_url="/api/redoc" if not PRODUCTION_MODE else None,
)

# Store db in app state for route access
app.state.db = db

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import core routes only (FieldForce slim version)
from routes.auth_routes import router as auth_router
from routes.org_routes import router as org_router
from routes.project_routes import router as project_router
from routes.form_routes import router as form_router
from routes.submission_routes import router as submission_router
from routes.case_routes import router as case_router
from routes.case_import_routes import router as case_import_router
from routes.export_routes import router as export_router
from routes.media_routes import router as media_router
from routes.gps_routes import router as gps_router
from routes.template_routes import router as template_router
from routes.logic_routes import router as logic_router
from routes.widget_routes import router as widget_router
from routes.device_routes import router as device_router
from routes.rbac_routes import router as rbac_router
from routes.analytics_routes import router as analytics_router
from routes.translation_routes import router as translation_router
from routes.paradata_routes import router as paradata_router
from routes.revision_routes import router as revision_router
from routes.dataset_routes import router as dataset_router
from routes.cawi_routes import router as cawi_router
from routes.quality_ai_routes import router as quality_ai_router
from routes.billing_routes import router as billing_router

# Include core route modules
api_router.include_router(auth_router)
api_router.include_router(org_router)
api_router.include_router(project_router)
api_router.include_router(form_router)
api_router.include_router(submission_router)
api_router.include_router(case_router)
api_router.include_router(case_import_router)
api_router.include_router(export_router)
api_router.include_router(media_router)
api_router.include_router(gps_router)
api_router.include_router(template_router)
api_router.include_router(logic_router)
api_router.include_router(widget_router)
api_router.include_router(device_router)
api_router.include_router(rbac_router)
api_router.include_router(analytics_router)
api_router.include_router(translation_router)
api_router.include_router(paradata_router)
api_router.include_router(revision_router)
api_router.include_router(dataset_router)
api_router.include_router(cawi_router)
api_router.include_router(quality_ai_router)
api_router.include_router(billing_router)


# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "FieldForce API is running", "version": "1.0.0", "provider": "DataVision International"}


@api_router.get("/health")
async def health_check():
    """Basic health check endpoint for load balancer"""
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@api_router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with all services"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # MongoDB check
    try:
        await db.command("ping")
        # Check if we can read/write
        test_result = await db.health_check.find_one({"type": "ping"})
        health_status["checks"]["mongodb"] = {
            "status": "healthy",
            "connection_pool": {
                "min": 10,
                "max": 100
            }
        }
    except Exception as e:
        health_status["checks"]["mongodb"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "degraded"
    
    # Redis check (if enabled)
    try:
        from config.production import RedisConfig
        redis = await RedisConfig.get_client()
        if redis:
            await redis.ping()
            health_status["checks"]["redis"] = {"status": "healthy"}
        else:
            health_status["checks"]["redis"] = {"status": "unavailable", "message": "Redis not configured"}
    except Exception as e:
        health_status["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
    
    # S3 check (if configured)
    try:
        from config.production import S3Storage
        if S3Storage.is_available():
            health_status["checks"]["s3"] = {"status": "healthy"}
        else:
            health_status["checks"]["s3"] = {"status": "unavailable", "message": "S3 not configured"}
    except Exception as e:
        health_status["checks"]["s3"] = {"status": "error", "error": str(e)}
    
    # Memory usage
    try:
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        health_status["checks"]["memory"] = {
            "status": "healthy",
            "rss_mb": round(memory_info.rss / 1024 / 1024, 2),
            "vms_mb": round(memory_info.vms / 1024 / 1024, 2)
        }
    except:
        pass
    
    return health_status


@api_router.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics endpoint"""
    try:
        # Get basic metrics
        from config.production import RedisConfig
        redis = await RedisConfig.get_client()
        
        metrics = []
        
        if redis:
            # Get all metric keys
            keys = await redis.keys("metrics:*")
            for key in keys:
                value = await redis.get(key)
                if value:
                    metric_name = key.replace("metrics:", "fieldforce_")
                    metrics.append(f"{metric_name} {value}")
        
        return "\n".join(metrics) if metrics else "# No metrics available"
    except Exception as e:
        return f"# Error: {e}"


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production middleware (rate limiting, timing, security headers)
if PRODUCTION_MODE:
    try:
        from middleware.production import (
            RateLimitMiddleware,
            RequestTimingMiddleware,
            SecurityHeadersMiddleware,
            RequestLoggingMiddleware
        )
        app.add_middleware(SecurityHeadersMiddleware)
        app.add_middleware(RequestTimingMiddleware, enabled=True)
        app.add_middleware(RateLimitMiddleware, enabled=True)
        logger.info("Production middleware enabled")
    except ImportError as e:
        logger.warning(f"Could not load production middleware: {e}")
else:
    # Development mode - just add timing
    try:
        from middleware.production import RequestTimingMiddleware, RequestLoggingMiddleware
        app.add_middleware(RequestTimingMiddleware, enabled=True)
        logger.info("Development middleware enabled")
    except ImportError:
        pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_db_client():
    """Initialize database indexes and production services on startup"""
    logger.info("FieldForce API starting up...")
    logger.info(f"Production Mode: {PRODUCTION_MODE}")
    
    # Initialize Redis if available
    try:
        from config.production import RedisConfig
        redis = await RedisConfig.get_client()
        if redis:
            logger.info("Redis connected successfully")
        else:
            logger.info("Redis not available - caching disabled")
    except Exception as e:
        logger.warning(f"Redis initialization error: {e}")
    
    # Initialize S3 if configured
    try:
        from config.production import S3Storage
        if S3Storage.is_available():
            logger.info("S3 storage initialized")
        else:
            logger.info("S3 not configured - using local storage")
    except Exception as e:
        logger.warning(f"S3 initialization error: {e}")
    
    try:
        # Users
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        
        # Organizations
        await db.organizations.create_index("slug", unique=True)
        await db.organizations.create_index("id", unique=True)
        
        # Org Members
        await db.org_members.create_index([("org_id", 1), ("user_id", 1)], unique=True)
        
        # Projects
        await db.projects.create_index("id", unique=True)
        await db.projects.create_index([("org_id", 1), ("status", 1)])
        
        # Forms
        await db.forms.create_index("id", unique=True)
        await db.forms.create_index([("project_id", 1), ("status", 1)])
        
        # Submissions
        await db.submissions.create_index("id", unique=True)
        await db.submissions.create_index([("form_id", 1), ("submitted_at", -1)])
        await db.submissions.create_index([("org_id", 1), ("submitted_at", -1)])
        await db.submissions.create_index([("project_id", 1), ("status", 1)])
        
        # Cases
        await db.cases.create_index("id", unique=True)
        await db.cases.create_index([("project_id", 1), ("respondent_id", 1)], unique=True)
        
        # Lookup Datasets
        await db.lookup_datasets.create_index("id", unique=True)
        await db.lookup_datasets.create_index([("org_id", 1), ("is_active", 1)])
        
        # Device Management
        await db.devices.create_index("id", unique=True)
        await db.devices.create_index([("org_id", 1), ("user_id", 1)])
        await db.devices.create_index([("org_id", 1), ("status", 1)])
        await db.device_activity_logs.create_index([("device_id", 1), ("timestamp", -1)])
        
        # Paradata Sessions
        await db.paradata_sessions.create_index("id", unique=True)
        await db.paradata_sessions.create_index([("submission_id", 1)])
        
        # Quality Alerts
        await db.quality_alerts.create_index("id", unique=True)
        await db.quality_alerts.create_index([("org_id", 1), ("status", 1)])
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Cleanup on shutdown"""
    logger.info("FieldForce API shutting down...")
    
    # Close Redis connection
    try:
        from config.production import RedisConfig
        await RedisConfig.close()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.warning(f"Redis close error: {e}")
    
    # Close MongoDB connection
    client.close()
    logger.info("MongoDB connection closed")
