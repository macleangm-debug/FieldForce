# FieldForce - Product Requirements Document

## Overview
FieldForce is a Mobile Data Collection Suite by DataVision International, derived from DataPulse with a focus on field data collection operations.

## Current Status: Production Ready

### Completed Features
- [x] **Marketing Website**
  - Landing page with workflow visualization
  - Interactive Demo page with Form Builder sandbox
  - Pricing page with subscription plans
  - Use Cases section (8 industries)
  
- [x] **Core Application**
  - Form builder with drag-and-drop
  - Offline data collection
  - GPS tracking
  - Media capture (photos, audio)
  - Data sync
  - Team management
  
- [x] **Production Infrastructure**
  - Redis caching configuration
  - S3 storage integration
  - Rate limiting middleware
  - Health check endpoints
  - Background job system (Celery)
  - Load balancer configuration (Nginx)
  - Docker Compose for production
  - Connection pooling (MongoDB)
  - Security headers middleware
  - Request timing & metrics

## Pricing Model

### Subscription Plans (Current)
| Plan | Price | Submissions | Storage | Users | Est. Margin |
|------|-------|-------------|---------|-------|-------------|
| Free | $0 | 250/mo | 0.5 GB | 3 | Lead gen |
| Starter | $69/mo | 1,500/mo | 5 GB | 10 | ~63% |
| Pro | $189/mo | 5,000/mo | 25 GB | 30 | ~50% |
| Enterprise | $499/mo | 20,000/mo | 100 GB | Unlimited | ~54% |

### Prepaid Credit Packs
| Credits | Price | Per Credit | Margin |
|---------|-------|------------|--------|
| 500 | $20 | $0.040 | 75% |
| 2,000 | $70 | $0.035 | 74% |
| 10,000 | $280 | $0.028 | 73% |
| 50,000 | $1,100 | $0.022 | 73% |

### Credit Usage Rates
- 1 submission (text/GPS) = 1 credit
- 1 submission + photos = 2 credits
- 1 submission + audio = 2 credits
- 1 submission + video = 5 credits
- 1 GB storage/month = 20 credits

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python) + Gunicorn
- Database: MongoDB (Replica Set ready)
- Cache: Redis
- Storage: AWS S3
- Queue: Celery
- Load Balancer: Nginx

## API Endpoints

### Health & Monitoring
- `GET /api/health` - Basic health (load balancer)
- `GET /api/health/detailed` - Full system status
- `GET /api/metrics` - Prometheus metrics

### Core APIs
- `/api/auth/*` - Authentication
- `/api/projects/*` - Project management
- `/api/forms/*` - Form CRUD
- `/api/submissions/*` - Data submission
- `/api/media/*` - File uploads

## Production Deployment

### Files Created
- `docker-compose.production.yml` - Full stack deployment
- `backend/Dockerfile` - API server image
- `nginx/api.conf` - Load balancer config
- `backend/config/production.py` - Redis, S3, caching
- `backend/middleware/production.py` - Rate limiting, security
- `backend/celery_app.py` - Background jobs
- `backend/tasks/*.py` - Task definitions
- `DEPLOYMENT.md` - Full deployment guide
- `.env.production.template` - Environment template

### Scaling Capabilities
| Load Level | API Servers | Celery Workers | Est. Capacity |
|------------|-------------|----------------|---------------|
| Light | 2 | 1 | ~500 users |
| Medium | 3-5 | 2-3 | ~5,000 users |
| Heavy | 5-10 | 3-5 | ~25,000 users |
| Enterprise | 10+ | 5+ | ~100,000+ users |

## Hidden Admin Pages
- `/internal/cost-analyzer` - Pricing calculator (not linked publicly)

## Date: Feb 10, 2026
