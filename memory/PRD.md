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
