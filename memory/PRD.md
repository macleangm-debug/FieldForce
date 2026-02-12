# FieldForce PRD

## Original Problem Statement
Build a comprehensive field data collection platform (FieldForce/DataPulse) with survey creation, management, and data collection capabilities.

## Core Requirements
- Full authentication system (JWT-based)
- Organization and project management
- Form/Survey builder with multiple field types
- Data collection via web (CAWI) and mobile
- Dashboard with analytics
- Device management for field teams

## User Personas
1. **Survey Administrators** - Create and manage surveys, view analytics
2. **Data Collectors/Enumerators** - Fill out surveys in the field
3. **Respondents** - Complete public surveys via shared links

---

## What's Been Implemented

### Authentication & User Management ✅
- JWT-based login/registration
- User profiles and organization membership

### Survey/Form Management ✅
- Form builder with drag-and-drop fields
- Multiple field types (text, number, date, select, radio, checkbox, GPS, photo, etc.)
- Form publishing and versioning
- Form duplication

### Survey Settings & Branding ✅
- **SurveySettingsSidebar component** with:
  - Survey name and description
  - Logo upload
  - Close date with calendar picker + time selector
  - Max responses limit
  - Thank you message customization
  - **Primary color picker with live preview**
  - Progress bar toggle
  - Shuffle questions toggle
  - Multiple submissions toggle
  - Require login toggle

### Survey Sharing ✅
- **ShareSurveyDialog** with three tabs:
  - Direct link (copy to clipboard)
  - QR code (downloadable)
  - Embed code (customizable dimensions)

### Public Survey Page (CAWI) ✅
- Multi-page navigation
- Auto-save and progress restoration
- Offline support
- Dynamic theming based on primary color setting
- Custom thank you message on completion

### Mobile Data Collection (PWA) ✅ - NEW
- **PWA Infrastructure:**
  - manifest.json with app icons
  - Service worker for offline caching
  - App installable on mobile devices

- **Option A: Login-Based Collection (`/collect`):**
  - Mobile-optimized login screen
  - Form list showing assigned forms
  - Online/offline status indicator
  - Sync status for pending submissions

- **Option B: Token-Based Collection (`/collect/t/{token}`):**
  - No login required
  - Token identifies enumerator
  - Supervisor-generated collection links
  - Submission limits and expiry tracking

### Light/Dark Mode ✅
- Theme switcher in all headers
- Persisted via localStorage

### Dashboard & Analytics ✅
- Stats overview (forms, submissions, devices)
- Recent activity

---

## API Endpoints

### Forms
- `GET /api/forms` - List forms
- `POST /api/forms` - Create form
- `GET /api/forms/{id}` - Get form details
- `PUT /api/forms/{id}` - Update form
- `PATCH /api/forms/{id}/fields` - Update fields
- `PATCH /api/forms/{id}/settings` - Update survey settings
- `GET /api/forms/{id}/public` - Get public form with settings
- `POST /api/forms/{id}/publish` - Publish form
- `POST /api/forms/{id}/duplicate` - Duplicate form

### Data Collection (NEW)
- `POST /api/collect/tokens` - Create collection token
- `GET /api/collect/tokens` - List tokens
- `DELETE /api/collect/tokens/{id}` - Revoke token
- `GET /api/collect/verify/{token}` - Verify token & get forms
- `GET /api/collect/forms/{token}/{form_id}` - Get form for collection
- `POST /api/collect/submit/{token}` - Submit via token
- `GET /api/collect/my-forms` - Get forms for logged-in enumerator

### Submissions
- `POST /api/submissions` - Submit survey response
- `GET /api/submissions` - List submissions

---

## Technical Architecture

### Frontend
- React with Vite
- Tailwind CSS + Shadcn/UI components
- Zustand for state management
- Framer Motion for animations
- PWA with Service Worker

### Backend
- FastAPI (Python)
- MongoDB database
- JWT authentication

### Key Files
- `/frontend/src/pages/CollectPage.jsx` - Login-based mobile collection
- `/frontend/src/pages/TokenCollectPage.jsx` - Token-based collection
- `/frontend/src/pages/MobileFormPage.jsx` - Mobile form filling
- `/frontend/public/manifest.json` - PWA manifest
- `/frontend/public/sw.js` - Service worker
- `/backend/routes/collect_routes.py` - Collection APIs

---

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Create UI for supervisors to generate collection tokens
- Add "Share Collection Link" button in admin dashboard
- Test full mobile form filling flow

### P2 (Medium Priority)
- Photo/audio capture in mobile form
- GPS auto-capture during collection
- Background sync improvements
- Refactor Landing/Demo pages for full light/dark mode support

### P3 (Low Priority/Future)
- Custom branding fonts
- Email notifications for submissions
- Advanced analytics dashboard
- Extract inline components from InteractiveDemoPage
