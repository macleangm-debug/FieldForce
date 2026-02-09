"""FieldForce - Mobile Data Collection Suite API
A streamlined version focused on field data collection for DataVision International
"""
from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with connection pooling
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    minPoolSize=5,
    maxPoolSize=50,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000
)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="FieldForce API",
    description="Mobile Data Collection Suite by DataVision International",
    version="1.0.0"
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
api_router.include_router(device_routes)
api_router.include_router(rbac_router)
api_router.include_router(analytics_router)
api_router.include_router(translation_router)
api_router.include_router(paradata_router)
api_router.include_router(revision_router)
api_router.include_router(dataset_router)
api_router.include_router(cawi_router)
api_router.include_router(quality_ai_router)


# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "FieldForce API is running", "version": "1.0.0", "provider": "DataVision International"}


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_db_client():
    """Initialize database indexes on startup"""
    logger.info("FieldForce API starting up...")
    
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
    client.close()
