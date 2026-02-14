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
