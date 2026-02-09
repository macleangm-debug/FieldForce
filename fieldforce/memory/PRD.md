# FieldForce - Product Requirements Document

## Overview
FieldForce is a streamlined Mobile Data Collection Suite, derived from DataPulse, focused specifically on field data collection operations for DataVision International.

## Original Problem Statement
Create a simplified version of DataPulse called FieldForce, retaining core mobile data collection features while removing advanced analytics, CATI, and statistical analysis modules. The solution will be integrated under DataVision SSO.

## Target Users
- Field teams and enumerators
- Research supervisors
- Data collection managers
- NGOs and research institutions in Africa

## Tech Stack
- **Frontend**: React 19 + TailwindCSS + Shadcn UI + Zustand
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT + DataVision SSO

## Features Included (Core FieldForce)

### Data Collection
- [x] Form Builder with skip logic & calculations
- [x] Mobile/Offline data collection (CAPI)
- [x] Encrypted IndexedDB for offline storage
- [x] GPS tracking & geofencing
- [x] Photo, audio, video capture
- [x] Signature capture
- [x] Barcode scanning
- [x] Multi-language support (EN/SW)

### Field Operations
- [x] Device management & remote wipe
- [x] Quality alerts (speeding detection)
- [x] Supervisor dashboard
- [x] Team management

### Data Management
- [x] Submissions management
- [x] Case management
- [x] Dataset lookup tables
- [x] Basic exports (CSV, Excel)

### Settings
- [x] RBAC (Role-based access control)
- [x] Translation management
- [x] Organization settings

## Features Removed (from DataPulse)

### Advanced Analytics (Removed)
- ❌ Statistical analysis (T-tests, ANOVA, Regression, etc.)
- ❌ AI Copilot for analysis
- ❌ Chart Studio
- ❌ Dashboard Builder
- ❌ Report Builder (PDF/Word/PPTX)
- ❌ Reproducibility Packs

### Call Center (Removed)
- ❌ CATI module
- ❌ Call queue management

### Advanced Operations (Removed)
- ❌ Token/Panel surveys
- ❌ Back-check module
- ❌ Advanced preload/write-back
- ❌ AI Field Simulation
- ❌ Super Admin/Billing

## Architecture

### Backend Routes (22 modules)
```
/app/fieldforce/backend/routes/
├── auth_routes.py         # Authentication (DataVision SSO)
├── org_routes.py          # Organization management
├── project_routes.py      # Project management
├── form_routes.py         # Form builder
├── submission_routes.py   # Data submissions
├── case_routes.py         # Case management
├── case_import_routes.py  # Case imports
├── export_routes.py       # Data exports
├── media_routes.py        # Media handling
├── gps_routes.py          # GPS tracking
├── template_routes.py     # Form templates
├── logic_routes.py        # Skip logic
├── widget_routes.py       # Custom widgets
├── device_routes.py       # Device management
├── rbac_routes.py         # Role management
├── analytics_routes.py    # Basic analytics
├── translation_routes.py  # Translations
├── paradata_routes.py     # Paradata capture
├── revision_routes.py     # Submission revisions
├── dataset_routes.py      # Lookup datasets
├── cawi_routes.py         # Web surveys
└── quality_ai_routes.py   # Quality monitoring
```

### Frontend Pages (18 pages)
```
/app/fieldforce/frontend/src/pages/
├── AuthPages.jsx          # Login/Register/SSO
├── DashboardPage.jsx      # Main dashboard
├── ProjectsPage.jsx       # Projects list
├── FormsPage.jsx          # Forms list
├── FormBuilderPage.jsx    # Form builder
├── FormPreviewPage.jsx    # Form preview
├── FormTemplatesPage.jsx  # Templates
├── SubmissionsPage.jsx    # Submissions
├── CasesPage.jsx          # Cases
├── CaseImportPage.jsx     # Import cases
├── QualityPage.jsx        # Quality dashboard
├── GPSMapPage.jsx         # GPS map view
├── DatasetsPage.jsx       # Datasets
├── DeviceManagementPage.jsx # Devices
├── AnalyticsPage.jsx      # Basic analytics
├── RBACPage.jsx           # Roles
├── TranslationsPage.jsx   # Languages
├── TeamPage.jsx           # Team management
├── SettingsPage.jsx       # Settings
└── CAWISurveyPage.jsx     # Public surveys
```

## Branding
- **Primary Color**: Emerald/Teal gradient
- **Logo**: MapPin icon
- **SSO Provider**: DataVision International

## What's Been Implemented
- [x] Copied DataPulse codebase
- [x] Removed 22 advanced route modules
- [x] Removed 11 frontend pages
- [x] Updated navigation to 5 main groups
- [x] Rebranded to FieldForce
- [x] Updated SSO to DataVision
- [x] Simplified server.py

## Next Steps
1. Test the stripped-down application
2. Configure DataVision SSO credentials
3. Deploy to separate Git repository
4. Verify all core features work

## Date: Feb 9, 2026
