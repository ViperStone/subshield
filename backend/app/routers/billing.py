import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.organization import User, Organization
from app.models.subcontractor import Subcontractor
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/billing", tags=["Billing & Stripe Subscriptions"])

PLAN_LIMITS = {
    "starter": 15,
    "growth": 50,
    "pro": 150
}

from datetime import datetime, timedelta

def get_org_trial_details(org: Organization) -> Dict[str, Any]:
    """Calculate 7-day trial status and remaining days."""
    is_active = (org.subscription_status in ("active", "paid")) or bool(org.stripe_subscription_id)
    if is_active:
        return {
            "status": "active",
            "is_trial_expired": False,
            "trial_days_remaining": 0,
            "trial_ends_at": None
        }

    created_at = org.created_at or datetime.utcnow()
    trial_ends_at = created_at + timedelta(days=7)
    now = datetime.utcnow()

    if now >= trial_ends_at:
        return {
            "status": "trial_expired",
            "is_trial_expired": True,
            "trial_days_remaining": 0,
            "trial_ends_at": trial_ends_at.isoformat()
        }
    else:
        diff = trial_ends_at - now
        days_left = max(1, diff.days + (1 if diff.seconds > 0 else 0))
        return {
            "status": "trialing",
            "is_trial_expired": False,
            "trial_days_remaining": days_left,
            "trial_ends_at": trial_ends_at.isoformat()
        }

class CreateCheckoutRequest(BaseModel):
    plan: str # "starter", "growth", "pro"

class SubscriptionInfoResponse(BaseModel):
    plan: str
    status: str
    subcontractor_limit: int
    current_subcontractors_count: int
    usage_percentage: float
    stripe_customer_id: Optional[str]
    can_add_more: bool
    is_trial_expired: bool = False
    trial_days_remaining: int = 7
    trial_ends_at: Optional[str] = None

@router.get("/subscription", response_model=SubscriptionInfoResponse)
def get_subscription_info(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    org = user.organization
    current_count = db.query(Subcontractor).filter(Subcontractor.organization_id == org.id).count()
    limit = org.subcontractor_limit or 50
    pct = round((current_count / limit * 100.0), 1) if limit > 0 else 0.0

    trial_details = get_org_trial_details(org)
    effective_status = trial_details["status"]

    return SubscriptionInfoResponse(
        plan=org.subscription_plan or "growth",
        status=effective_status,
        subcontractor_limit=limit,
        current_subcontractors_count=current_count,
        usage_percentage=pct,
        stripe_customer_id=org.stripe_customer_id,
        can_add_more=current_count < limit and not trial_details["is_trial_expired"],
        is_trial_expired=trial_details["is_trial_expired"],
        trial_days_remaining=trial_details["trial_days_remaining"],
        trial_ends_at=trial_details["trial_ends_at"]
    )

@router.post("/create-checkout-session")
def create_checkout_session(
    payload: CreateCheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    plan = payload.plan.lower()
    if plan not in PLAN_LIMITS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Must be one of: {list(PLAN_LIMITS.keys())}"
        )

    # 1. Real Stripe Integration if API key is provided
    if settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.startswith("sk_test_mock"):
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            price_id = getattr(settings, f"STRIPE_PRICE_{plan.upper()}", None)
            if not price_id:
                raise HTTPException(status_code=400, detail=f"Price ID for plan '{plan}' is not configured.")

            # Automatically attach 7-day free trial on the card subscription if eligible
            trial_details = get_org_trial_details(user.organization)
            trial_days = None
            if not user.organization.stripe_subscription_id and not trial_details["is_trial_expired"]:
                trial_days = max(1, trial_details.get("trial_days_remaining", 7))

            checkout_kwargs = {
                "payment_method_types": ["card"],
                "line_items": [{"price": price_id, "quantity": 1}],
                "mode": "subscription",
                "customer_email": user.email,
                "client_reference_id": user.organization_id,
                "metadata": {"organization_id": user.organization_id, "plan": plan},
                "payment_method_collection": "always",
                "success_url": f"{settings.FRONTEND_URL}/dashboard/billing?session_id={{CHECKOUT_SESSION_ID}}&payment=success",
                "cancel_url": f"{settings.FRONTEND_URL}/dashboard/billing?payment=canceled",
            }

            if trial_days:
                checkout_kwargs["subscription_data"] = {
                    "trial_period_days": trial_days,
                    "metadata": {"organization_id": user.organization_id, "plan": plan}
                }

            session = stripe.checkout.Session.create(**checkout_kwargs)
            return {"url": session.url, "session_id": session.id, "mode": "stripe"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    # 2. Local Sandbox / Simulated Mode (No Live Stripe Key Needed for Dev Testing)
    # Automatically upgrades organization so the founder can test limits immediately!
    org = user.organization
    org.subscription_plan = plan
    org.subscription_status = "active"
    org.subcontractor_limit = PLAN_LIMITS[plan]
    db.commit()

    return {
        "url": f"{settings.FRONTEND_URL}/dashboard/billing?payment=success&plan={plan}",
        "message": f"Simulated checkout completed. Organization upgraded to {plan.capitalize()} tier ({PLAN_LIMITS[plan]} subcontractors).",
        "mode": "simulated"
    }

@router.post("/create-portal-session")
def create_portal_session(
    user: User = Depends(get_current_user)
):
    if settings.STRIPE_SECRET_KEY and not settings.STRIPE_SECRET_KEY.startswith("sk_test_mock") and user.organization.stripe_customer_id:
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            portal = stripe.billing_portal.Session.create(
                customer=user.organization.stripe_customer_id,
                return_url=f"{settings.FRONTEND_URL}/dashboard/billing"
            )
            return {"url": portal.url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {
        "url": f"{settings.FRONTEND_URL}/dashboard/billing?portal=simulated",
        "message": "Stripe Customer Portal is active in test mode."
    }

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db)
):
    """
    Stripe Webhook Listener:
    Handles checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
    """
    payload_bytes = await request.body()

    if not settings.STRIPE_WEBHOOK_SECRET:
        return {"status": "webhook_skipped", "reason": "No webhook secret configured"}

    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload_bytes, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature error: {str(e)}")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        org_id = data_object.get("metadata", {}).get("organization_id")
        plan = data_object.get("metadata", {}).get("plan", "growth")
        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")

        if org_id:
            org = db.query(Organization).filter(Organization.id == org_id).first()
            if org:
                org.subscription_plan = plan
                org.subscription_status = "active"
                org.subcontractor_limit = PLAN_LIMITS.get(plan, 50)
                org.stripe_customer_id = customer_id
                org.stripe_subscription_id = subscription_id
                db.commit()

    elif event_type in ("customer.subscription.updated", "invoice.paid"):
        sub_id = data_object.get("id") if event_type == "customer.subscription.updated" else data_object.get("subscription")
        status = data_object.get("status")
        # When trial concludes and first payment is charged, or on monthly recurring renewals
        if status in ("active", "trialing"):
            org = db.query(Organization).filter(Organization.stripe_subscription_id == sub_id).first()
            if org:
                org.subscription_status = "active"
                db.commit()

    elif event_type == "customer.subscription.deleted":
        sub_id = data_object.get("id")
        org = db.query(Organization).filter(Organization.stripe_subscription_id == sub_id).first()
        if org:
            org.subscription_status = "canceled"
            db.commit()

    elif event_type == "invoice.payment_failed":
        sub_id = data_object.get("subscription")
        org = db.query(Organization).filter(Organization.stripe_subscription_id == sub_id).first()
        if org:
            org.subscription_status = "past_due"
            db.commit()

    return {"status": "success", "event_type": event_type}
