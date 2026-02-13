# FieldForce - Mobile Data Collection Platform

## Product Overview
FieldForce is a full-stack PWA for offline-capable mobile data collection, designed for field research organizations like DataVision International.

## Core Features

### Authentication & User Management
- JWT-based authentication with persistent sessions
- Zustand state management with localStorage sync
- Organization-based access control

### Collection Links System
- **Standard Links**: Simple shareable URLs for public surveys
- **Device Locked Links**: Link locks to first device (prevents sharing)
- **PIN Protected Links**: Requires 4-digit PIN + device lock for maximum security

### Security Modes Implementation (COMPLETE)
1. **Backend** (`/app/backend/routes/collect_routes.py`):
   - Token creation with `security_mode` field
   - PIN hashing using SHA256
   - Device registration endpoint `/api/collect/register-device/{token}`
   - Token validation returns security mode

2. **Frontend - Supervisor UI** (`/app/frontend/src/pages/CollectionLinksPage.jsx`):
   - Three security mode options in Create Link modal
   - Scrollable modal for smaller screens (max-h-[90vh])
   - Security badges in token table
   - PIN generation helper

3. **Frontend - Enumerator UI** (`/app/frontend/src/pages/TokenCollectPage.jsx`):
   - PIN entry screen with 4-digit input
   - Device registration confirmation screen
   - Verified token caching in localStorage
   - Security mode badge in header

### Additional Features
- Bulk enumerator import (CSV/Excel)
- TinyURL link shortening integration
- QR code generation
- Multi-channel sharing (WhatsApp, Email, SMS)
- Offline data collection with auto-sync

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn/UI, Zustand, Framer Motion
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB with Motor async driver
- **PWA**: Service workers for offline support

## API Endpoints

### Collection Routes
- `POST /api/collect/tokens` - Create collection token
- `GET /api/collect/tokens` - List tokens (supervisor)
- `DELETE /api/collect/tokens/{id}` - Revoke token
- `GET /api/collect/verify/{token}` - Validate token (returns security_mode)
- `POST /api/collect/register-device/{token}` - Register device / verify PIN
- `POST /api/collect/tokens/bulk-import` - Bulk import enumerators
- `POST /api/collect/shorten-url` - Shorten URL via TinyURL

## Database Schema

### collection_tokens
```json
{
  "id": "ct_xxx",
  "token_hash": "sha256_hash",
  "enumerator_name": "string",
  "enumerator_email": "string|null",
  "form_ids": ["form_id_1", "form_id_2"],
  "security_mode": "standard|device_locked|pin_protected",
  "pin_hash": "sha256_hash|null",
  "locked_device_id": "string|null",
  "device_info": "object|null",
  "created_by": "user_id",
  "created_at": "ISO8601",
  "expires_at": "ISO8601",
  "is_active": true
}
```

## Completed (Feb 2026)
- [x] Session persistence fix (token sync)
- [x] Bulk enumerator import
- [x] TinyURL integration
- [x] Security modes (supervisor UI)
- [x] Security modes (enumerator enforcement)
- [x] Create Link modal - made compact with dropdown security selector (fits 85vh)
- [x] Bulk Import with Security Modes - supports Standard, Device Locked, PIN Protected
- [x] PIN options for bulk import - Auto-generate unique PINs or Shared PIN
- [x] Distribution options after bulk import - Export CSV, Email All, Copy for SMS
- [x] **Non-blocking Onboarding Wizard** - Redesigned as floating card in bottom-right corner (Feb 12)
- [x] **Button Rename** - "Create Link" → "Create Single Link", "Import" → "Bulk Links" (Feb 12)
- [x] **CSV/Excel Support Verified** - Bulk import accepts .csv, .xlsx, .xls files (Feb 12)
- [x] **Custom Message Templates (P2)** - Full CRUD for message templates (Feb 12)
  - Backend API at `/api/message-templates` with user/org/system scopes
  - 5 system templates: WhatsApp (Friendly, Professional), Email (Standard), SMS (Short, With Instructions)
  - Settings page > Message Templates section for managing templates
  - Template variables: `{name}`, `{link}`, `{pin_section}`, `{expiry}`
  - Template selector in Collection Links share dialog
- [x] **Resend Email Service Ready** - Scalable PIN distribution (Feb 12)
  - Backend API at `/api/email/*` (send-single, send-bulk, test, status)
  - Professional HTML email template with FieldForce branding
  - Non-blocking async email sending
  - Bulk import "Email All" button integrates with Resend when configured
- [x] **i18n Multi-Language Support** - Full internationalization (Feb 13)
  - 6 languages: English, Spanish, French, Portuguese, Swahili, Arabic (RTL support)
  - Translation files at `/app/frontend/src/locales/*.json`
  - Language selector in header (globe icon with dropdown)
  - Auto-detection of browser language
  - LocalStorage persistence for language preference
  - Key pages translated: Dashboard, Collection Links

## Backlog
- [ ] Auto-open single-form surveys
- [ ] Full light/dark theme consistency
- [ ] Component refactoring for InteractiveDemoPage
- [ ] Component refactoring for CollectionLinksPage.jsx (split into CreateLinkModal, BulkImportModal)

## Environment Ready (Pending API Key)
- **Resend Email**: Add `RESEND_API_KEY=re_your_key` to `/app/backend/.env` to enable bulk email

## Test Credentials
- Email: `demo@fieldforce.io`
- Password: `Test123!`

## Test Links (Feb 12, 2026)
- PIN Protected (PIN: 1234): `/collect/t/lMaG3e0C5nd0YIb5TMEzNVUFyAa_DjlwknRu0yFKiyQ`
- Device Locked: `/collect/t/2ZZczJHhPfvyw4s8NE4Q0BnGhl66zjk1DAPMFh_t8sA`
