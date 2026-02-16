"""
FieldForce Pricing API Routes
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from config.pricing import ACTIVE_PRICING, ADDONS, get_tier, get_all_tiers, get_tier_for_usage
from auth import get_current_user

router = APIRouter(prefix="/pricing", tags=["Pricing"])


class UsageQuery(BaseModel):
    users: int
    submissions_per_month: int


class PricingTierResponse(BaseModel):
    id: str
    name: str
    tagline: str
    price_monthly: Optional[float]
    price_yearly: Optional[float]
    highlighted: bool
    features: dict
    limits: dict


@router.get("/tiers")
async def get_pricing_tiers():
    """
    Get all available pricing tiers.
    Public endpoint for pricing page.
    """
    tiers = []
    
    for tier_id, tier in ACTIVE_PRICING.items():
        tiers.append({
            "id": tier["id"],
            "name": tier["name"],
            "tagline": tier["tagline"],
            "price_monthly": tier["price_monthly"],
            "price_yearly": tier["price_yearly"],
            "price_yearly_monthly": round(tier["price_yearly"] / 12, 2) if tier["price_yearly"] else None,
            "savings_percent": round((1 - (tier["price_yearly"] / 12 / tier["price_monthly"])) * 100) if tier["price_monthly"] and tier["price_yearly"] else None,
            "highlighted": tier["highlighted"],
            "features": tier["features"],
            "limits": tier["limits"],
        })
    
    return {"tiers": tiers}


@router.get("/tiers/{tier_id}")
async def get_pricing_tier(tier_id: str):
    """Get details for a specific pricing tier."""
    tier = get_tier(tier_id)
    
    if not tier:
        raise HTTPException(status_code=404, detail="Tier not found")
    
    return tier


@router.get("/addons")
async def get_pricing_addons():
    """Get all available add-ons."""
    return {"addons": list(ADDONS.values())}


@router.post("/recommend")
async def recommend_tier(usage: UsageQuery):
    """
    Recommend a pricing tier based on expected usage.
    """
    recommended_tier_id = get_tier_for_usage(usage.users, usage.submissions_per_month)
    tier = get_tier(recommended_tier_id)
    
    # Calculate potential cost with add-ons if usage exceeds base tier
    addons_needed = []
    
    if tier["features"]["users"] != "unlimited":
        extra_users = max(0, usage.users - tier["features"]["users"])
        if extra_users > 0:
            addons_needed.append({
                "addon": "extra_users",
                "quantity": extra_users,
                "monthly_cost": extra_users * ADDONS["extra_users"]["price_per_unit"]
            })
    
    if tier["features"]["submissions_per_month"] != "unlimited":
        extra_subs = max(0, usage.submissions_per_month - tier["features"]["submissions_per_month"])
        if extra_subs > 0:
            units = (extra_subs + 999) // 1000  # Round up to nearest 1000
            addons_needed.append({
                "addon": "extra_submissions",
                "quantity": units,
                "monthly_cost": units * ADDONS["extra_submissions"]["price_per_unit"]
            })
    
    total_monthly = (tier["price_monthly"] or 0) + sum(a["monthly_cost"] for a in addons_needed)
    
    return {
        "recommended_tier": tier,
        "addons_needed": addons_needed,
        "total_monthly_cost": total_monthly,
        "total_yearly_cost": total_monthly * 12 * 0.83,  # 17% annual discount
    }


@router.get("/features")
async def get_feature_comparison():
    """
    Get feature comparison matrix for all tiers.
    Useful for pricing page comparison table.
    """
    # Define feature categories and their display info
    feature_categories = {
        "core": {
            "name": "Core Features",
            "features": [
                {"key": "users", "name": "Team Members", "type": "limit"},
                {"key": "submissions_per_month", "name": "Monthly Submissions", "type": "limit"},
                {"key": "projects", "name": "Projects", "type": "limit"},
                {"key": "forms", "name": "Forms", "type": "limit"},
                {"key": "storage_gb", "name": "Storage", "type": "storage"},
            ]
        },
        "data_collection": {
            "name": "Data Collection",
            "features": [
                {"key": "offline_mode", "name": "Offline Mode", "type": "boolean"},
                {"key": "gps_tracking", "name": "GPS Tracking", "type": "boolean"},
                {"key": "photo_capture", "name": "Photo Capture", "type": "boolean"},
                {"key": "skip_logic", "name": "Skip Logic", "type": "boolean"},
                {"key": "question_types", "name": "Question Types", "type": "text"},
            ]
        },
        "team": {
            "name": "Team & Collaboration",
            "features": [
                {"key": "team_management", "name": "Team Management", "type": "boolean"},
                {"key": "quality_controls", "name": "Quality Controls", "type": "boolean"},
                {"key": "audit_logs", "name": "Audit Logs", "type": "boolean"},
                {"key": "multi_language", "name": "Multi-Language", "type": "boolean"},
            ]
        },
        "integrations": {
            "name": "Integrations & API",
            "features": [
                {"key": "api_access", "name": "API Access", "type": "boolean"},
                {"key": "webhooks", "name": "Webhooks", "type": "boolean"},
                {"key": "sso", "name": "Single Sign-On", "type": "boolean"},
                {"key": "data_export", "name": "Export Formats", "type": "list"},
            ]
        },
        "support": {
            "name": "Support & Extras",
            "features": [
                {"key": "support", "name": "Support Level", "type": "text"},
                {"key": "custom_branding", "name": "Custom Branding", "type": "boolean"},
                {"key": "advanced_analytics", "name": "Advanced Analytics", "type": "boolean"},
                {"key": "emails_per_month", "name": "Email Notifications", "type": "limit"},
            ]
        },
    }
    
    # Build comparison matrix
    tiers_data = []
    for tier_id, tier in ACTIVE_PRICING.items():
        tier_features = {}
        for category_id, category in feature_categories.items():
            tier_features[category_id] = {}
            for feature in category["features"]:
                key = feature["key"]
                value = tier["features"].get(key)
                
                # Format value based on type
                if feature["type"] == "boolean":
                    formatted = value
                elif feature["type"] == "limit":
                    formatted = value if isinstance(value, str) else f"{value:,}"
                elif feature["type"] == "storage":
                    formatted = f"{value} GB" if isinstance(value, int) else value
                elif feature["type"] == "list":
                    formatted = value if isinstance(value, list) else [value]
                else:
                    formatted = value
                
                tier_features[category_id][key] = formatted
        
        tiers_data.append({
            "id": tier["id"],
            "name": tier["name"],
            "price_monthly": tier["price_monthly"],
            "features": tier_features,
        })
    
    return {
        "categories": feature_categories,
        "tiers": tiers_data,
    }


@router.get("/current")
async def get_current_subscription(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user's subscription status.
    """
    db = request.app.state.db
    
    # Get user's organization
    membership = await db.org_members.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not membership:
        return {
            "has_subscription": False,
            "current_tier": "free",
            "tier_details": get_tier("free"),
        }
    
    # Get organization subscription
    org = await db.organizations.find_one(
        {"id": membership["org_id"]},
        {"_id": 0}
    )
    
    if not org:
        return {
            "has_subscription": False,
            "current_tier": "free",
            "tier_details": get_tier("free"),
        }
    
    subscription = org.get("subscription", {})
    current_tier_id = subscription.get("tier", "free")
    
    # Get usage stats
    user_count = await db.org_members.count_documents({"org_id": org["id"]})
    
    # Get this month's submissions
    from datetime import datetime
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    submission_count = await db.submissions.count_documents({
        "org_id": org["id"],
        "submitted_at": {"$gte": month_start.isoformat()}
    })
    
    tier = get_tier(current_tier_id)
    
    return {
        "has_subscription": current_tier_id != "free",
        "current_tier": current_tier_id,
        "tier_details": tier,
        "billing_period": subscription.get("billing_period", "monthly"),
        "current_period_end": subscription.get("current_period_end"),
        "usage": {
            "users": user_count,
            "users_limit": tier["features"]["users"],
            "submissions": submission_count,
            "submissions_limit": tier["features"]["submissions_per_month"],
        },
        "addons": subscription.get("addons", []),
    }
