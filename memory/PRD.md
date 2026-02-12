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
2. **Supervisors** - Generate collection links, manage enumerators
3. **Data Collectors/Enumerators** - Fill out surveys in the field
4. **Respondents** - Complete public surveys via shared links

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
  - Primary color picker with live preview
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

### Mobile Data Collection (PWA) ✅
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

### Collection Links Management ✅
- **Page:** `/collection-links` (under Field menu)
- Supervisors can:
  - Create collection tokens for enumerators
  - Assign specific forms to each token
  - Set expiry period (7 days - 1 year)
  - Set max submissions limit
- Generated links display:
  - Direct URL
  - QR code (downloadable)
  - Security warning
- Table view of all tokens with:
  - Status (Active/Expired/Revoked)
  - Submission count
  - Revoke action

### Data Vault & Offline Sync ✅
- **DataVaultIndicator** component with:
  - Animated particle-stream syncing visualization
  - Celebration animation on successful sync
  - Haptic feedback for mobile devices
  - Auto-sync when connection restored

### Onboarding Wizard ✅
- Multi-step new user setup wizard
- Steps: Welcome → Organization → Project → Form → Team → Complete
- Skippable with progress saved to localStorage

### Dashboard Header Enhancements ✅ (NEW - Feb 12, 2025)
- **Command Palette (⌘K Global Search)**
  - Keyboard shortcut `⌘K` or `Ctrl+K`
  - Search across forms, projects, submissions, team members
  - Fuzzy matching with relevance sorting
  - Recent searches history
  - Keyboard navigation (↑↓ Enter Esc)

- **Notifications Panel**
  - Real-time notification bell with unread count badge
  - Notification types: submission, team, system, form, sync
  - Mark as read / Mark all as read
  - Delete individual notifications
  - Auto-refresh every 30 seconds

- **Language Selector**
  - Globe icon dropdown
  - 12 supported languages (English, Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Swahili, Indonesian)
  - Preference saved to user profile and localStorage

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

### Data Collection
- `POST /api/collect/tokens` - Create collection token
- `GET /api/collect/tokens` - List tokens
- `DELETE /api/collect/tokens/{id}` - Revoke token
- `GET /api/collect/verify/{token}` - Verify token & get forms
- `GET /api/collect/forms/{token}/{form_id}` - Get form for collection
- `POST /api/collect/submit/{token}` - Submit via token
- `GET /api/collect/my-forms` - Get forms for logged-in enumerator

### Search (NEW)
- `GET /api/search/global?q={query}` - Global search across forms, projects, submissions, team
- `GET /api/search/recent` - Get recent search history
- `POST /api/search/history` - Save search to history

### Notifications (NEW)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification
- `DELETE /api/notifications` - Clear all notifications

### Settings (NEW)
- `GET /api/settings/languages` - Get supported languages list
- `GET /api/settings/preferences` - Get user preferences
- `PUT /api/settings/preferences` - Update user preferences
- `PUT /api/settings/language` - Quick language update

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
- `/frontend/src/pages/CollectionLinksPage.jsx` - Supervisor token management
- `/frontend/src/components/CommandPalette.jsx` - Global search dialog (NEW)
- `/frontend/src/components/NotificationsPanel.jsx` - Notifications popover (NEW)
- `/frontend/src/components/LanguageSelector.jsx` - Language dropdown (NEW)
- `/frontend/src/components/DataVaultIndicator.jsx` - Offline sync animation
- `/frontend/src/components/OnboardingWizard.jsx` - New user setup
- `/frontend/src/layouts/DashboardLayout.jsx` - Main layout with header
- `/frontend/public/manifest.json` - PWA manifest
- `/frontend/public/sw.js` - Service worker
- `/backend/routes/collect_routes.py` - Collection APIs
- `/backend/routes/search_routes.py` - Global search APIs (NEW)
- `/backend/routes/notification_routes.py` - Notification APIs (NEW)
- `/backend/routes/settings_routes.py` - User settings APIs (NEW)

---

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Custom message templates for sharing (WhatsApp, Email, SMS)
- Implement actual i18n/translations with the language selector
- Test offline data collection & sync end-to-end

### P2 (Medium Priority)
- Photo/audio capture in mobile form
- GPS auto-capture during collection
- Background sync improvements
- Email notifications integration (with real email service)
- Auto-open single-form surveys

### P3 (Low Priority/Future)
- Custom branding fonts
- Advanced analytics dashboard
- Full theming for LandingPage & InteractiveDemoPage

---

## Session Log - Feb 12, 2025

### Completed
1. ✅ Implemented fully functional Dashboard Header with:
   - Command Palette (⌘K global search)
   - Notifications Panel with real-time updates
   - Language Selector with 12 languages
2. ✅ Created backend APIs:
   - `/api/search/global` - Global search endpoint
   - `/api/notifications/*` - Full notifications CRUD
   - `/api/settings/*` - User preferences and language settings
3. ✅ Delivered complete reusable code for data collection flow

### Provided to User
- Complete code for Collection Links management page
- Token-based and login-based mobile collection pages
- Data Vault sync indicator with animations
- Haptic feedback utilities
- Backend collection routes
