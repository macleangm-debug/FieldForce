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

## Interactive Demo (/demo/sandbox)
Comprehensive product demo with pre-populated sample data:
- **Dashboard Tab**: Clickable project cards, stats cards that navigate to tabs
- **Forms Tab**: Clickable form cards showing form details with questions
- **Submissions Tab**: Clickable table rows showing submission details
- **Team Tab**: Clickable team member cards showing profiles
- **GPS Map Tab**: Visual map with submission clusters
- **Media Tab**: Photo gallery from submissions

All interactive elements open detail modals. Locked features show "Sign up to unlock" tooltips.

## Changelog

### Feb 11, 2026
- **Light/Dark Mode** - Implemented theme switching functionality:
  - Created `ThemeSwitcher` component with icon-only and labeled variants
  - Added theme toggle to Public Header (landing page, pricing page)
  - Added theme toggle to Dashboard Layout (all authenticated pages)
  - Added theme toggle to Interactive Demo page header
  - Theme preference persisted in localStorage via Zustand store
  - Dashboard and app pages fully support light/dark modes via CSS variables
  - Marketing pages (landing, demo) maintain dark aesthetic by design
  - Available variants: `icon` (for headers), `header` (for public nav), default (with label)

- **Guided Tour Feature** - Added interactive tour like Survey360:
  - 7-step guided tour auto-starts on first visit
  - Welcome modal with emoji and friendly message
  - Element highlighting with cyan border and spotlight effect
  - Step-by-step tooltips pointing to Dashboard, Projects, Navigation, Forms, Team
  - Completion modal with "Start Exploring" CTA
  - "Take a Tour" button appears after completing tour
  - Progress bar showing current step (Step X of 7)
  - Skip Tour option and Back navigation
  - Persists completion state in localStorage

- **Customizable Industry Demo Data** - Added industry selector to personalize demo experience:
  - Healthcare: Health surveys, vaccination tracking, facility assessments
  - Agriculture: Crop surveys, livestock monitoring, farm assessments  
  - Education: School surveys, enrollment tracking, facility audits
  - Each industry has unique projects, forms, team members, stats, and activity
  - Dropdown selector in header with animated transitions
  - Dynamic banner text updates based on selected industry

- **Interactive Demo Presentation Redesign** - Wrapped the demo in an elegant browser window frame:
  - Page header with "Back to Demo" navigation, FieldForce branding, and "Start Free Trial" CTA
  - macOS-style browser window frame with red/yellow/green window controls
  - Fake URL bar showing "app.fieldforce.io/dashboard" with lock icon
  - "Live Demo" badge indicating interactive status
  - Compact sidebar with Demo Mode upsell card
  - Bottom text inviting users to start free trial

- **Demo Page Redesign** - Complete overhaul to match landing page styling:
  - Hero section with animated floating icons (BarChart3, FileText, MapPin, Users, Camera)
  - Gradient headline "Experience FieldForce Before You Sign Up"
  - Feature preview cards (6 clickable cards linking to interactive demo)
  - Removed Video Walkthrough, replaced with Interactive Demo focus
  - Enhanced tab styling with gradient active states
  - Polished final CTA section with gradient text

- **Animated Tab Transitions** - Added polished animations to the interactive demo:
  - Spring-animated sidebar navigation with sliding active tab indicator
  - Directional slide animations for tab content (context-aware left/right)
  - Animated header title transitions
  - Enhanced demo banner with shimmer effect and pulsing icon
  - Hover animations on navigation items and buttons

- **Interactive Demo Clickability** - Added full click functionality to all UI elements:
  - Project cards open ProjectDetail modal
  - Form cards open FormDetail modal with sample questions
  - Submission table rows open SubmissionDetail modal
  - Team member cards open TeamMemberDetail modal
  - Stats cards navigate to appropriate tabs
  - All detail modals include "Start Free Trial" CTA

### Feb 10, 2026
- Production infrastructure scaffolding (Redis, Celery, Nginx, S3)
- Interactive Demo page created with sample data
- Hidden pricing calculator at /internal/cost-analyzer
