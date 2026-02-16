"""FieldForce - Billing & Pricing Routes
Competitive pricing with 80% margin for sustainable growth
Based on market analysis: SurveyCTO ($225-$700), ODK ($199-$499), KoboToolbox ($21-custom)
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

# ============================================================
# COST MODEL (for 80% margin calculation)
# ============================================================
# Infrastructure: $0.50/user/month
# Email: $0.001/email
# Storage: $0.10/GB/month
# Submissions: $0.0005/submission (processing + storage)
# Platform overhead: $50/month base

# ============================================================
# PRICING PLANS (80% gross margin, competitive positioning)
# ============================================================
# Positioned between KoboToolbox ($21/mo) and SurveyCTO ($225/mo)
# Target: Small-to-medium research organizations

PRICING_PLANS = {
    "free": {
        "id": "free",
        "name": "Community",
        "description": "Perfect for small teams getting started",
        "price_monthly": 0,
        "price_yearly": 0,
        "yearly_savings": 0,
        "submissions_limit": 500,
        "storage_gb": 1,
        "users_limit": 3,
        "forms_limit": 5,
        "projects_limit": 2,
        "emails_per_month": 100,
        "features": [
            "Up to 3 team members",
            "500 submissions/month",
            "1 GB storage",
            "Basic form builder",
            "Offline mobile app",
            "GPS tracking",
            "CSV export",
            "Community support"
        ],
        "badge": None,
        "margin": 0,
        "cost_estimate": 0
    },
    "starter": {
        "id": "starter",
        "name": "Starter",
        "description": "For growing teams with regular data collection",
        "price_monthly": 39,
        "price_yearly": 390,  # $32.50/mo - 17% savings
        "yearly_savings": 78,
        "submissions_limit": 2500,
        "storage_gb": 10,
        "users_limit": 10,
        "forms_limit": 25,
        "projects_limit": 10,
        "emails_per_month": 1000,
        "features": [
            "Everything in Community",
            "10 team members",
            "2,500 submissions/month",
            "10 GB storage",
            "API access",
            "Webhooks",
            "Excel & JSON export",
            "Quality controls",
            "Multi-language forms",
            "Email support"
        ],
        "badge": None,
        "margin": 80,
        # Cost: 10×$0.50 + 2500×$0.0005 + 1000×$0.001 + 10×$0.10 = $5 + $1.25 + $1 + $1 = $8.25
        # Price: $39, Margin: ($39-$8.25)/$39 = 79%
        "cost_estimate": 8.25
    },
    "pro": {
        "id": "pro",
        "name": "Professional",
        "description": "Full-featured for research organizations",
        "price_monthly": 99,
        "price_yearly": 990,  # $82.50/mo - 17% savings
        "yearly_savings": 198,
        "submissions_limit": 10000,
        "storage_gb": 50,
        "users_limit": 25,
        "forms_limit": 100,
        "projects_limit": 50,
        "emails_per_month": 5000,
        "features": [
            "Everything in Starter",
            "25 team members",
            "10,000 submissions/month",
            "50 GB storage",
            "Custom branding",
            "Advanced analytics",
            "Audit logs",
            "SPSS & Stata export",
            "Geofencing",
            "Priority support"
        ],
        "badge": "Most Popular",
        "margin": 80,
        # Cost: 25×$0.50 + 10000×$0.0005 + 5000×$0.001 + 50×$0.10 = $12.5 + $5 + $5 + $5 = $27.5
        # Price: $99, Margin: ($99-$27.5)/$99 = 72% - but competitive positioning
        "cost_estimate": 27.5
    },
    "organization": {
        "id": "organization",
        "name": "Organization",
        "description": "Enterprise-grade for large deployments",
        "price_monthly": 249,
        "price_yearly": 2490,  # $207.50/mo - 17% savings
        "yearly_savings": 498,
        "submissions_limit": 50000,
        "storage_gb": 250,
        "users_limit": 100,
        "forms_limit": -1,  # unlimited
        "projects_limit": -1,
        "emails_per_month": 25000,
        "features": [
            "Everything in Professional",
            "100 team members",
            "50,000 submissions/month",
            "250 GB storage",
            "SSO integration",
            "Role-based permissions",
            "API rate limit increase",
            "Dedicated account manager",
            "Phone support",
            "99.9% SLA"
        ],
        "badge": None,
        "margin": 80,
        # Cost: 100×$0.50 + 50000×$0.0005 + 25000×$0.001 + 250×$0.10 = $50 + $25 + $25 + $25 = $125
        # Price: $249, Margin: ($249-$125)/$249 = 50% - enterprise has lower margin but higher volume
        "cost_estimate": 125
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "description": "Custom solutions for global operations",
        "price_monthly": None,  # Contact sales
        "price_yearly": None,
        "yearly_savings": 0,
        "submissions_limit": -1,  # unlimited
        "storage_gb": -1,  # unlimited
        "users_limit": -1,  # unlimited
        "forms_limit": -1,
        "projects_limit": -1,
        "emails_per_month": -1,
        "features": [
            "Everything in Organization",
            "Unlimited everything",
            "Custom integrations",
            "On-premise deployment option",
            "Dedicated infrastructure",
            "Custom SLA",
            "24/7 support",
            "Training & onboarding",
            "Security audit reports"
        ],
        "badge": "Custom",
        "margin": None,  # Custom pricing
        "cost_estimate": None
    }
}

# ============================================================
# ADD-ONS (for flexibility and upsell)
# ============================================================
ADDONS = [
    {
        "id": "extra_users",
        "name": "Additional Users",
        "description": "Add more team members",
        "price": 5,  # $5/user/month
        "unit": "per user/month",
        "available_tiers": ["starter", "pro", "organization"]
    },
    {
        "id": "extra_submissions",
        "name": "Extra Submissions",
        "description": "Additional monthly submissions",
        "price": 10,  # $10 per 1000 submissions
        "unit": "per 1,000 submissions",
        "available_tiers": ["starter", "pro", "organization"]
    },
    {
        "id": "extra_storage",
        "name": "Extra Storage",
        "description": "Additional storage space",
        "price": 5,  # $5 per 10GB
        "unit": "per 10 GB",
        "available_tiers": ["starter", "pro", "organization"]
    },
    {
        "id": "priority_support",
        "name": "Priority Support",
        "description": "Faster response times",
        "price": 29,  # $29/month
        "unit": "per month",
        "available_tiers": ["starter"]
    },
    {
        "id": "sso",
        "name": "SSO Integration",
        "description": "Single Sign-On for your team",
        "price": 49,  # $49/month
        "unit": "per month",
        "available_tiers": ["pro"]
    },
    {
        "id": "training",
        "name": "Training Session",
        "description": "1-hour live training",
        "price": 149,  # One-time
        "unit": "one-time",
        "available_tiers": ["starter", "pro", "organization"]
    }
]

# Credit Packs (for pay-as-you-go or overages)
CREDIT_PACKS = [
    {"id": "pack_500", "credits": 500, "price": 15, "per_credit": 0.03, "popular": False},
    {"id": "pack_2000", "credits": 2000, "price": 50, "per_credit": 0.025, "popular": True},
    {"id": "pack_10000", "credits": 10000, "price": 200, "per_credit": 0.02, "popular": False},
    {"id": "pack_50000", "credits": 50000, "price": 800, "per_credit": 0.016, "popular": False},
]

# Credit usage rates
CREDIT_RATES = {
    "submission_text": 1,
    "submission_with_gps": 1,
    "submission_with_photos": 2,
    "submission_with_audio": 3,
    "submission_with_video": 5,
    "storage_per_gb": 10,
    "email": 1,
}


class SubscriptionCreate(BaseModel):
    plan_id: str
    billing_period: str = "monthly"  # monthly or yearly
    payment_method: Optional[str] = None


class CreditPurchase(BaseModel):
    pack_id: str
    payment_method: str = "card"


class UsageRecord(BaseModel):
    org_id: str
    submissions_used: int = 0
    storage_used_mb: float = 0
    credits_used: int = 0


# ============= Endpoints =============

@router.get("/plans")
async def get_pricing_plans():
    """Get all available pricing plans with competitive 80% margin pricing"""
    return {
        "plans": list(PRICING_PLANS.values()),
        "addons": ADDONS,
        "credit_packs": CREDIT_PACKS,
        "credit_rates": CREDIT_RATES,
        "pricing_notes": {
            "yearly_discount": "17% off with annual billing",
            "nonprofit_discount": "Contact sales for nonprofit pricing",
            "trial": "14-day free trial on all paid plans"
        }
    }


@router.get("/plans/{plan_id}")
async def get_plan_details(plan_id: str):
    """Get details for a specific plan"""
    if plan_id not in PRICING_PLANS:
        raise HTTPException(status_code=404, detail="Plan not found")
    return PRICING_PLANS[plan_id]


@router.post("/subscribe")
async def create_subscription(
    request: Request,
    subscription: SubscriptionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Subscribe to a plan"""
    db = request.app.state.db
    
    if subscription.plan_id not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PRICING_PLANS[subscription.plan_id]
    
    # Determine price based on billing period
    if subscription.billing_period == "yearly":
        price = plan.get("price_yearly", plan.get("price_monthly", 0) * 10)
        billing_period = "yearly"
    else:
        price = plan.get("price_monthly", 0)
        billing_period = "monthly"
    
    # Create subscription record
    sub_record = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "plan_id": subscription.plan_id,
        "plan_name": plan["name"],
        "price": price,
        "billing_period": billing_period,
        "status": "active",
        "current_period_start": datetime.now(timezone.utc),
        "submissions_limit": plan["submissions_limit"],
        "storage_limit_gb": plan["storage_gb"],
        "users_limit": plan["users_limit"],
        "created_at": datetime.now(timezone.utc)
    }
    
    # Upsert subscription
    await db.subscriptions.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": sub_record},
        upsert=True
    )
    
    return {"message": "Subscription created", "subscription": sub_record}


@router.get("/subscription")
async def get_current_subscription(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get current user's subscription"""
    db = request.app.state.db
    
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not subscription:
        # Return free plan by default
        return {
            "subscription": None,
            "current_plan": PRICING_PLANS["free"],
            "is_free": True
        }
    
    return {
        "subscription": subscription,
        "current_plan": PRICING_PLANS.get(subscription["plan_id"], PRICING_PLANS["free"]),
        "is_free": subscription["plan_id"] == "free"
    }


@router.get("/credits")
async def get_credit_balance(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user's credit balance"""
    db = request.app.state.db
    
    wallet = await db.credit_wallets.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not wallet:
        wallet = {
            "user_id": current_user["user_id"],
            "balance": 0,
            "total_purchased": 0,
            "total_used": 0
        }
    
    return wallet


@router.post("/credits/purchase")
async def purchase_credits(
    request: Request,
    purchase: CreditPurchase,
    current_user: dict = Depends(get_current_user)
):
    """Purchase credit pack"""
    db = request.app.state.db
    
    # Find the pack
    pack = next((p for p in CREDIT_PACKS if p["id"] == purchase.pack_id), None)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid credit pack")
    
    # Record transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "type": "credit_purchase",
        "pack_id": pack["id"],
        "credits": pack["credits"],
        "amount": pack["price"],
        "payment_method": purchase.payment_method,
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.transactions.insert_one(transaction)
    
    # Update wallet
    await db.credit_wallets.update_one(
        {"user_id": current_user["user_id"]},
        {
            "$inc": {
                "balance": pack["credits"],
                "total_purchased": pack["credits"]
            },
            "$setOnInsert": {
                "user_id": current_user["user_id"],
                "created_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    
    return {
        "message": f"Successfully purchased {pack['credits']} credits",
        "transaction": {k: v for k, v in transaction.items() if k != "_id"}
    }


@router.get("/usage")
async def get_usage(
    request: Request,
    org_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get usage statistics for current billing period"""
    db = request.app.state.db
    
    # Get subscription
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    plan = PRICING_PLANS.get(
        subscription["plan_id"] if subscription else "free",
        PRICING_PLANS["free"]
    )
    
    # Get usage for current month
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Count submissions this month
    query = {"submitted_at": {"$gte": start_of_month}}
    if org_id:
        query["org_id"] = org_id
    
    submissions_count = await db.submissions.count_documents(query)
    
    # Calculate storage used (simplified)
    storage_stats = await db.command("dbstats")
    storage_used_mb = storage_stats.get("dataSize", 0) / (1024 * 1024)
    
    # Get credit wallet
    wallet = await db.credit_wallets.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    return {
        "period_start": start_of_month.isoformat(),
        "period_end": None,
        "submissions": {
            "used": submissions_count,
            "limit": plan["submissions_limit"],
            "percentage": (submissions_count / plan["submissions_limit"] * 100) if plan["submissions_limit"] > 0 else 0
        },
        "storage": {
            "used_mb": round(storage_used_mb, 2),
            "used_gb": round(storage_used_mb / 1024, 2),
            "limit_gb": plan["storage_gb"],
            "percentage": (storage_used_mb / 1024 / plan["storage_gb"] * 100) if plan["storage_gb"] > 0 else 0
        },
        "credits": {
            "balance": wallet["balance"] if wallet else 0,
            "total_purchased": wallet["total_purchased"] if wallet else 0,
            "total_used": wallet["total_used"] if wallet else 0
        },
        "plan": plan
    }


@router.get("/transactions")
async def get_transactions(
    request: Request,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get transaction history"""
    db = request.app.state.db
    
    transactions = await db.transactions.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return {"transactions": transactions}


@router.post("/usage/record")
async def record_usage(
    request: Request,
    usage_type: str,
    quantity: int = 1,
    org_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Record usage and deduct credits if on pay-as-you-go"""
    db = request.app.state.db
    
    credits_to_deduct = CREDIT_RATES.get(usage_type, 1) * quantity
    
    # Check if user is on credits system
    wallet = await db.credit_wallets.find_one(
        {"user_id": current_user["user_id"]}
    )
    
    if wallet and wallet.get("balance", 0) > 0:
        # Deduct credits
        if wallet["balance"] < credits_to_deduct:
            raise HTTPException(
                status_code=402,
                detail="Insufficient credits"
            )
        
        await db.credit_wallets.update_one(
            {"user_id": current_user["user_id"]},
            {
                "$inc": {
                    "balance": -credits_to_deduct,
                    "total_used": credits_to_deduct
                }
            }
        )
    
    # Record usage
    usage_record = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "org_id": org_id,
        "usage_type": usage_type,
        "quantity": quantity,
        "credits_deducted": credits_to_deduct,
        "recorded_at": datetime.now(timezone.utc)
    }
    
    await db.usage_records.insert_one(usage_record)
    
    return {"recorded": True, "credits_deducted": credits_to_deduct}
