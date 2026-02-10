"""FieldForce - Billing & Pricing Routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

# Pricing Plans Configuration (87% margin)
PRICING_PLANS = {
    "free": {
        "id": "free",
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "billing_period": "monthly",
        "submissions_limit": 250,
        "storage_gb": 0.5,
        "users_limit": 3,
        "forms_limit": 2,
        "features": [
            "Basic form builder",
            "CSV export",
            "Community support",
            "Mobile app access"
        ],
        "badge": None,
        "margin": 0
    },
    "starter": {
        "id": "starter",
        "name": "Starter",
        "price_monthly": 69,
        "price_yearly": 690,  # 2 months free (10 months)
        "billing_period": "monthly",
        "submissions_limit": 1500,
        "storage_gb": 5,
        "users_limit": 10,
        "forms_limit": -1,  # unlimited
        "features": [
            "Everything in Free",
            "1,500 submissions/month",
            "5 GB storage",
            "10 team members",
            "Excel export",
            "GPS tracking",
            "Email support"
        ],
        "badge": None,
        "margin": 87,
        "yearly_savings": 138  # $69 × 2 months
    },
    "pro": {
        "id": "pro",
        "name": "Pro",
        "price_monthly": 189,
        "price_yearly": 1890,  # 2 months free
        "billing_period": "monthly",
        "submissions_limit": 5000,
        "storage_gb": 25,
        "users_limit": 30,
        "forms_limit": -1,
        "features": [
            "Everything in Starter",
            "5,000 submissions/month",
            "25 GB storage",
            "30 team members",
            "SPSS & Stata export",
            "API access",
            "Geofencing",
            "Priority support"
        ],
        "badge": "Most Popular",
        "margin": 87,
        "yearly_savings": 378  # $189 × 2 months
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price_monthly": 499,
        "price_yearly": 4990,  # 2 months free
        "billing_period": "monthly",
        "submissions_limit": 20000,
        "storage_gb": 100,
        "users_limit": -1,  # unlimited
        "forms_limit": -1,
        "features": [
            "Everything in Pro",
            "20,000 submissions/month",
            "100 GB storage",
            "Unlimited users",
            "SSO integration",
            "Custom branding",
            "Dedicated support",
            "SLA guarantee"
        ],
        "badge": None,
        "margin": 86,
        "yearly_savings": 998  # $499 × 2 months
    }
}

# Credit Packs (87% margin - cost $0.006, price ~$0.04)
CREDIT_PACKS = [
    {"id": "pack_500", "credits": 500, "price": 20, "per_credit": 0.04, "popular": False, "margin": 87},
    {"id": "pack_2000", "credits": 2000, "price": 70, "per_credit": 0.035, "popular": True, "margin": 87},
    {"id": "pack_10000", "credits": 10000, "price": 280, "per_credit": 0.028, "popular": False, "margin": 87},
    {"id": "pack_50000", "credits": 50000, "price": 1100, "per_credit": 0.022, "popular": False, "margin": 87},
]

# Credit usage rates
CREDIT_RATES = {
    "submission_text": 1,
    "submission_with_gps": 1,
    "submission_with_photos": 2,
    "submission_with_audio": 2,
    "submission_with_video": 5,
    "storage_per_gb": 20,
}


class SubscriptionCreate(BaseModel):
    plan_id: str
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
    """Get all available pricing plans"""
    return {
        "plans": list(PRICING_PLANS.values()),
        "credit_packs": CREDIT_PACKS,
        "credit_rates": CREDIT_RATES
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
    
    # Create subscription record
    sub_record = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "plan_id": subscription.plan_id,
        "plan_name": plan["name"],
        "price": plan["price"],
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
