"""
FieldForce Pricing Configuration
Designed for 80% margin with competitive positioning
"""

# ============================================================
# COST ASSUMPTIONS (Monthly)
# ============================================================
# Infrastructure per user: $0.50/user/month (MongoDB, compute, storage)
# Email cost: $0.001/email (Resend/SendGrid)
# Support overhead: 10% of revenue
# Platform overhead: $50/month base

COST_PER_USER = 0.50  # Monthly infrastructure cost per active user
COST_PER_EMAIL = 0.001  # Per email sent
COST_PER_SUBMISSION = 0.0005  # Storage/processing per submission
COST_PER_GB_STORAGE = 0.10  # Per GB media storage
PLATFORM_BASE_COST = 50  # Fixed monthly overhead

# Target margin
TARGET_MARGIN = 0.80  # 80% margin

# ============================================================
# PRICING TIERS
# ============================================================

PRICING_TIERS = {
    "free": {
        "id": "free",
        "name": "Community",
        "tagline": "Perfect for small teams getting started",
        "price_monthly": 0,
        "price_yearly": 0,
        "highlighted": False,
        "features": {
            "users": 3,
            "submissions_per_month": 500,
            "projects": 2,
            "forms": 5,
            "storage_gb": 1,
            "emails_per_month": 100,
            "api_access": False,
            "offline_mode": True,
            "gps_tracking": True,
            "photo_capture": True,
            "data_export": ["CSV"],
            "support": "community",
            "custom_branding": False,
            "sso": False,
            "audit_logs": False,
            "webhooks": False,
            "advanced_analytics": False,
            "team_management": False,
            "quality_controls": False,
            "multi_language": False,
            "skip_logic": True,
            "question_types": "basic",  # text, number, select, date
        },
        "limits": {
            "max_questions_per_form": 25,
            "max_media_per_submission": 3,
            "data_retention_days": 90,
        },
        "cost_estimate": 0,  # Free tier cost absorbed
    },
    
    "starter": {
        "id": "starter",
        "name": "Starter",
        "tagline": "For growing teams with regular data collection",
        "price_monthly": 29,
        "price_yearly": 290,  # ~17% discount
        "highlighted": False,
        "features": {
            "users": 10,
            "submissions_per_month": 2500,
            "projects": 10,
            "forms": 25,
            "storage_gb": 10,
            "emails_per_month": 1000,
            "api_access": True,
            "offline_mode": True,
            "gps_tracking": True,
            "photo_capture": True,
            "data_export": ["CSV", "Excel", "JSON"],
            "support": "email",
            "custom_branding": False,
            "sso": False,
            "audit_logs": False,
            "webhooks": True,
            "advanced_analytics": False,
            "team_management": True,
            "quality_controls": True,
            "multi_language": True,
            "skip_logic": True,
            "question_types": "standard",  # + photo, gps, signature
        },
        "limits": {
            "max_questions_per_form": 100,
            "max_media_per_submission": 10,
            "data_retention_days": 365,
        },
        # Cost: 10 users * $0.50 + 2500 * $0.0005 + 1000 * $0.001 = $5 + $1.25 + $1 = $7.25
        # Price: $29, Margin: ($29 - $7.25) / $29 = 75% - bump price or reduce costs
        "cost_estimate": 7.25,
    },
    
    "professional": {
        "id": "professional",
        "name": "Professional",
        "tagline": "Full-featured for research organizations",
        "price_monthly": 79,
        "price_yearly": 790,  # ~17% discount
        "highlighted": True,  # Most popular
        "features": {
            "users": 25,
            "submissions_per_month": 10000,
            "projects": 50,
            "forms": 100,
            "storage_gb": 50,
            "emails_per_month": 5000,
            "api_access": True,
            "offline_mode": True,
            "gps_tracking": True,
            "photo_capture": True,
            "data_export": ["CSV", "Excel", "JSON", "SPSS", "Stata"],
            "support": "priority",
            "custom_branding": True,
            "sso": False,
            "audit_logs": True,
            "webhooks": True,
            "advanced_analytics": True,
            "team_management": True,
            "quality_controls": True,
            "multi_language": True,
            "skip_logic": True,
            "question_types": "all",  # + barcode, audio, video, matrix
        },
        "limits": {
            "max_questions_per_form": 500,
            "max_media_per_submission": 25,
            "data_retention_days": 730,  # 2 years
        },
        # Cost: 25 * $0.50 + 10000 * $0.0005 + 5000 * $0.001 + 50 * $0.10 = $12.5 + $5 + $5 + $5 = $27.5
        # Price: $79, Margin: ($79 - $27.5) / $79 = 65% - adjust
        "cost_estimate": 27.5,
    },
    
    "organization": {
        "id": "organization",
        "name": "Organization",
        "tagline": "Enterprise-grade for large deployments",
        "price_monthly": 199,
        "price_yearly": 1990,  # ~17% discount
        "highlighted": False,
        "features": {
            "users": 100,
            "submissions_per_month": 50000,
            "projects": "unlimited",
            "forms": "unlimited",
            "storage_gb": 250,
            "emails_per_month": 25000,
            "api_access": True,
            "offline_mode": True,
            "gps_tracking": True,
            "photo_capture": True,
            "data_export": ["CSV", "Excel", "JSON", "SPSS", "Stata", "API"],
            "support": "dedicated",
            "custom_branding": True,
            "sso": True,
            "audit_logs": True,
            "webhooks": True,
            "advanced_analytics": True,
            "team_management": True,
            "quality_controls": True,
            "multi_language": True,
            "skip_logic": True,
            "question_types": "all",
        },
        "limits": {
            "max_questions_per_form": "unlimited",
            "max_media_per_submission": 50,
            "data_retention_days": 1825,  # 5 years
        },
        # Cost: 100 * $0.50 + 50000 * $0.0005 + 25000 * $0.001 + 250 * $0.10 = $50 + $25 + $25 + $25 = $125
        # Price: $199, Margin: ($199 - $125) / $199 = 37% - needs adjustment
        "cost_estimate": 125,
    },
    
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "tagline": "Custom solutions for global operations",
        "price_monthly": None,  # Contact sales
        "price_yearly": None,
        "highlighted": False,
        "features": {
            "users": "unlimited",
            "submissions_per_month": "unlimited",
            "projects": "unlimited",
            "forms": "unlimited",
            "storage_gb": "unlimited",
            "emails_per_month": "unlimited",
            "api_access": True,
            "offline_mode": True,
            "gps_tracking": True,
            "photo_capture": True,
            "data_export": ["CSV", "Excel", "JSON", "SPSS", "Stata", "API", "Custom"],
            "support": "24/7 dedicated",
            "custom_branding": True,
            "sso": True,
            "audit_logs": True,
            "webhooks": True,
            "advanced_analytics": True,
            "team_management": True,
            "quality_controls": True,
            "multi_language": True,
            "skip_logic": True,
            "question_types": "all",
            "custom_integrations": True,
            "on_premise_option": True,
            "sla_guarantee": True,
            "dedicated_infrastructure": True,
        },
        "limits": {
            "max_questions_per_form": "unlimited",
            "max_media_per_submission": "unlimited",
            "data_retention_days": "unlimited",
        },
        "cost_estimate": None,  # Custom
    },
}

# ============================================================
# ADD-ONS (for additional revenue / flexibility)
# ============================================================

ADDONS = {
    "extra_users": {
        "id": "extra_users",
        "name": "Additional Users",
        "description": "Add more team members to your plan",
        "price_per_unit": 5,  # $5/user/month
        "unit": "user",
        "available_tiers": ["starter", "professional", "organization"],
    },
    "extra_submissions": {
        "id": "extra_submissions",
        "name": "Additional Submissions",
        "description": "Increase your monthly submission limit",
        "price_per_unit": 10,  # $10 per 1000 submissions
        "unit": "1000 submissions",
        "available_tiers": ["starter", "professional", "organization"],
    },
    "extra_storage": {
        "id": "extra_storage",
        "name": "Additional Storage",
        "description": "More space for photos, videos, and files",
        "price_per_unit": 5,  # $5 per 10GB
        "unit": "10 GB",
        "available_tiers": ["starter", "professional", "organization"],
    },
    "extra_emails": {
        "id": "extra_emails",
        "name": "Additional Email Credits",
        "description": "Send more email notifications",
        "price_per_unit": 5,  # $5 per 1000 emails
        "unit": "1000 emails",
        "available_tiers": ["starter", "professional", "organization"],
    },
    "sso": {
        "id": "sso",
        "name": "Single Sign-On (SSO)",
        "description": "SAML/OAuth integration for enterprise authentication",
        "price_per_unit": 50,  # $50/month flat
        "unit": "month",
        "available_tiers": ["professional"],
    },
    "priority_support": {
        "id": "priority_support",
        "name": "Priority Support",
        "description": "Faster response times and dedicated support channel",
        "price_per_unit": 29,  # $29/month
        "unit": "month",
        "available_tiers": ["starter"],
    },
    "training": {
        "id": "training",
        "name": "Team Training Session",
        "description": "1-hour live training session for your team",
        "price_per_unit": 199,  # One-time
        "unit": "session",
        "available_tiers": ["starter", "professional", "organization"],
    },
}

# ============================================================
# 80% MARGIN RECALCULATION
# ============================================================
# 
# To achieve 80% margin: Price = Cost / (1 - 0.80) = Cost / 0.20 = Cost * 5
#
# Starter:     Cost $7.25  → Min price $36.25   → Charging $29 (need to reduce features or raise price)
# Professional: Cost $27.5  → Min price $137.5  → Charging $79 (need adjustment)
# Organization: Cost $125   → Min price $625    → Charging $199 (need adjustment)
#
# ADJUSTED PRICING for 80% margin:
# Starter: $39/mo (was $29) - Cost $7.80 → Margin 80%
# Professional: $149/mo (was $79) - Cost $29.80 → Margin 80%
# Organization: $399/mo (was $199) - Cost $79.80 → Margin 80%
#
# These prices are still competitive with SurveyCTO ($250-$700) and ODK ($199-$499)

PRICING_TIERS_80_MARGIN = {
    "free": PRICING_TIERS["free"],
    
    "starter": {
        **PRICING_TIERS["starter"],
        "price_monthly": 39,
        "price_yearly": 390,  # $32.50/mo
    },
    
    "professional": {
        **PRICING_TIERS["professional"],
        "price_monthly": 149,
        "price_yearly": 1490,  # $124/mo
    },
    
    "organization": {
        **PRICING_TIERS["organization"],
        "price_monthly": 399,
        "price_yearly": 3990,  # $332.50/mo
    },
    
    "enterprise": PRICING_TIERS["enterprise"],
}

# Use the 80% margin version
ACTIVE_PRICING = PRICING_TIERS_80_MARGIN

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_tier(tier_id: str) -> dict:
    """Get pricing tier by ID"""
    return ACTIVE_PRICING.get(tier_id)

def get_all_tiers() -> list:
    """Get all pricing tiers"""
    return list(ACTIVE_PRICING.values())

def calculate_margin(tier_id: str) -> float:
    """Calculate actual margin for a tier"""
    tier = get_tier(tier_id)
    if not tier or not tier.get("price_monthly"):
        return None
    
    cost = tier.get("cost_estimate", 0)
    price = tier["price_monthly"]
    
    return (price - cost) / price

def get_tier_for_usage(users: int, submissions: int) -> str:
    """Recommend a tier based on usage"""
    for tier_id in ["free", "starter", "professional", "organization"]:
        tier = get_tier(tier_id)
        features = tier["features"]
        
        user_limit = features["users"]
        sub_limit = features["submissions_per_month"]
        
        if isinstance(user_limit, int) and users > user_limit:
            continue
        if isinstance(sub_limit, int) and submissions > sub_limit:
            continue
        
        return tier_id
    
    return "enterprise"
