# FieldForce - Product Requirements Document

## Overview
FieldForce is a Mobile Data Collection Suite by DataVision International, derived from DataPulse with a focus on field data collection operations.

## Pricing Model (80% Margin)

### Subscription Plans
| Plan | Price | Submissions | Storage | Users | Margin |
|------|-------|-------------|---------|-------|--------|
| Free | $0 | 250/mo | 0.5 GB | 3 | Lead gen |
| Starter | $45/mo | 1,500/mo | 5 GB | 10 | 80% |
| Pro | $125/mo | 5,000/mo | 25 GB | 30 | 80% |
| Enterprise | $350/mo | 20,000/mo | 100 GB | Unlimited | 80% |

### Prepaid Credit Packs
| Credits | Price | Per Credit | Margin |
|---------|-------|------------|--------|
| 500 | $15 | $0.030 | 80% |
| 2,000 | $50 | $0.025 | 80% |
| 10,000 | $200 | $0.020 | 80% |
| 50,000 | $800 | $0.016 | 80% |

### Credit Usage Rates
- 1 submission (text/GPS) = 1 credit
- 1 submission + photos = 2 credits
- 1 submission + audio = 2 credits
- 1 submission + video = 5 credits
- 1 GB storage/month = 20 credits

## What's Been Implemented
- [x] Billing routes (backend/routes/billing_routes.py)
- [x] Pricing page (frontend/src/pages/PricingPage.jsx)
- [x] Credit purchase system
- [x] Usage tracking
- [x] Subscription management
- [x] DataVision SSO integration
- [x] Dashboard with proper spacing
- [x] FieldForce branding (MapPin logo)

## Tech Stack
- Frontend: React 19 + TailwindCSS + Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT + DataVision SSO

## Competitor Comparison
| Platform | Entry Price | FieldForce Savings |
|----------|-------------|-------------------|
| SurveyCTO | $225/mo | 80% cheaper ($45) |
| ODK Cloud | $199/mo | 77% cheaper ($45) |
| CommCare | $100/mo | 55% cheaper ($45) |

## Date: Feb 10, 2026
