# FieldForce - Mobile Data Collection Platform

## Product Overview
FieldForce is a full-stack PWA for offline-capable mobile data collection, designed for field research organizations like DataVision International.

## Original Problem Statement
Pull repository from https://github.com/macleangm-debug/FieldForce

## Architecture
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Zustand, Framer Motion, i18next
- **Backend**: FastAPI, Python 3.11, Motor (async MongoDB driver)
- **Database**: MongoDB
- **PWA**: Service workers for offline support

## User Personas
1. **Field Supervisors** - Manage enumerators, create collection links, view analytics
2. **Enumerators** - Collect data in the field using mobile devices
3. **Admins** - Organization management, user roles, billing

## Core Features (Implemented)
- JWT-based authentication
- Organization-based multi-tenancy
- Project and Form management
- Collection Links with 3 security modes
- Multi-language support (6 languages)
- Offline data collection with auto-sync
- Bulk enumerator import
- Message templates for distribution
- PWA for mobile deployment

## What's Been Implemented
- [Feb 14, 2026] Repository cloned and services started
- Full application with 30+ backend routes
- Complete React frontend with dashboard, forms, submissions, team management

## Backlog (P0/P1/P2)
### P0 (Critical)
- [ ] Complete Settings page translations
- [ ] RTL support for Arabic

### P1 (Important)
- [ ] Auto-open single-form surveys
- [ ] Component refactoring for CollectionLinksPage

### P2 (Nice to have)
- [ ] Full light/dark theme consistency
- [ ] Additional languages

## Environment Configuration
- Backend: `/app/backend/.env` (MONGO_URL, DB_NAME, JWT_SECRET)
- Frontend: `/app/frontend/.env` (REACT_APP_BACKEND_URL)
- Email service: Add RESEND_API_KEY to enable bulk email

## Test Credentials
- Email: `demo@fieldforce.io`
- Password: `Test123!`

## Next Tasks
- User to specify what features or fixes to work on

## Updates (Feb 14, 2026)

### Help Center Feature Added
- **Route**: `/help` with DashboardLayout
- **Component**: `/app/frontend/src/components/HelpCenterTemplate.jsx`
- **Page**: `/app/frontend/src/pages/HelpCenterPage.jsx`
- **Access**: Header "?" button navigates to Help Center

### Help Center Categories:
1. Getting Started - Quick start, account setup, navigation
2. Forms & Surveys - Form builder, templates, publishing
3. Data Collection - Collection links, offline mode, GPS
4. Team Management - Invitations, roles & permissions
5. Analytics & Reports - Dashboard metrics, data export
6. Integrations - API access, webhooks

### Features:
- Full-text search across all articles
- Quick Actions shortcuts
- Article feedback (helpful/not helpful)
- Contact support options (email, chat, docs)
- Responsive design matching app theme

### Test Results:
- 95% pass rate (19/20 tests)
- All core functionality verified

## Update - Feb 14, 2026 (Screenshots Added)

### Help Center Screenshots Implementation
- Created `/app/frontend/public/help-images/` with 18 actual app screenshots
- Updated `HelpCenterTemplate.jsx` with Screenshot component featuring:
  - Zoomable images (click to enlarge)
  - Modal overlay for full-size view
  - Captions under each screenshot
  - Error fallback for missing images
  - Screenshot count badges in article list

### Screenshots Added:
1. dashboard-overview.png - Main dashboard
2. settings-page.png - Profile settings
3. collection-links.png - Collection links page
4. analytics-page.png - Analytics dashboard with charts
5. forms-page.png - Forms listing
6. templates-page.png - Form templates
7. team-page.png - Team management
8. gps-map.png - GPS map view
9. nav-sidebar.png - Sidebar navigation
10. Plus 9 more placeholder screenshots

### Test Results:
- 85% pass rate
- Fixed: Screenshot modal click interaction (pointer-events)

## Update - Feb 15, 2026 (New Help Center with AI Assistant)

### New Help Center Implementation
- **Page**: `/app/frontend/src/pages/HelpCenterNew.jsx`
- **AI Assistant**: `/app/frontend/src/components/HelpAssistant.jsx`
- **Backend Routes**: `/app/backend/routes/help_assistant.py`

### Features:
1. Two-column layout with expandable categories
2. Full-text search across all articles
3. FAQ accordion with category grouping
4. Troubleshooting guide with symptoms/solutions
5. Keyboard shortcuts reference
6. What's New changelog (v2.5.0, v2.4.0)
7. AI Assistant powered by GPT-5.2

### AI Assistant Capabilities:
- Multi-turn conversation with session management
- Context-aware responses about FieldForce
- Article links included in responses
- Feedback tracking (helpful/not helpful)
- Question analytics for FAQ improvement

### Backend API Endpoints:
- POST /api/help-assistant/chat - Chat with AI
- POST /api/help-assistant/feedback - Submit feedback
- GET /api/help-assistant/analytics - Question analytics
- POST /api/help-assistant/reset - Reset session

### Test Results:
- 100% pass rate (backend, frontend, integration)
