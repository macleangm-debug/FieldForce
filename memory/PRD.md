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
2. **Data Collectors** - Fill out surveys in the field
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

### Survey Settings & Branding (Dec 2025) ✅
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

### Survey Sharing (Dec 2025) ✅
- **ShareSurveyDialog** with three tabs:
  - Direct link (copy to clipboard)
  - QR code (downloadable)
  - Embed code (customizable dimensions)

### Public Survey Page (CAWI) ✅
- Multi-page navigation
- Auto-save and progress restoration
- Offline support
- **Dynamic theming based on primary color setting**
- Custom thank you message on completion

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
- `PATCH /api/forms/{id}/settings` - Update survey settings (NEW)
- `GET /api/forms/{id}/public` - Get public form with settings (NEW)
- `POST /api/forms/{id}/publish` - Publish form
- `POST /api/forms/{id}/duplicate` - Duplicate form

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

### Backend
- FastAPI (Python)
- MongoDB database
- JWT authentication

### Key Files
- `/frontend/src/components/SurveySettingsSidebar.jsx` - Survey config panel
- `/frontend/src/components/ShareSurveyDialog.jsx` - Share modal
- `/frontend/src/pages/CAWISurveyPage.jsx` - Public survey page
- `/backend/routes/form_routes.py` - Form API endpoints

---

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Wire up Save Settings button to persist to backend API
- Test full survey flow with primary color applied

### P2 (Medium Priority)
- Refactor Landing/Demo pages for full light/dark mode support
- Extract inline components from InteractiveDemoPage
- Add preset color palette options

### P3 (Low Priority/Future)
- Custom branding fonts
- Email notifications for submissions
- Advanced analytics dashboard
