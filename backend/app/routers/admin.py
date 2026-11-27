"""
SubShield Admin Dashboard API
Protected endpoints for the platform owner to manage users, passwords, and payments.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.config import settings
from app.models.organization import Organization, User
from app.models.subcontractor import Subcontractor
from app.services.auth_service import get_current_user, get_password_hash, create_access_token

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

# ─────────────────────────────────────────────────────
# Admin Guard: Only the platform owner can access
# ─────────────────────────────────────────────────────
ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", "amadouourydiallo596@gmail.com")


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency that blocks non-admin users."""
    if user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return user


# ─────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────
class AdminUserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    created_at: datetime
    organization_id: str
    organization_name: str
    subscription_status: str
    subscription_plan: str
    subcontractor_count: int
    stripe_customer_id: Optional[str]

    class Config:
        from_attributes = True


class AdminOrgOut(BaseModel):
    id: str
    name: str
    slug: str
    subscription_status: str
    subscription_plan: str
    subcontractor_limit: int
    subcontractor_count: int
    stripe_customer_id: Optional[str]
    stripe_subscription_id: Optional[str]
    created_at: datetime
    users: List[dict]


class AdminStatsOut(BaseModel):
    total_organizations: int
    total_users: int
    total_subcontractors: int
    active_subscriptions: int
    trialing_orgs: int
    expired_trials: int
    canceled_subscriptions: int
    revenue_monthly_estimate: float


class ResetPasswordRequest(BaseModel):
    user_id: str
    new_password: str


class CreateUserRequest(BaseModel):
    company_name: str
    email: str
    password: str
    full_name: Optional[str] = None
    plan: str = "growth"


class UpdateSubscriptionRequest(BaseModel):
    organization_id: str
    plan: str
    status: str


# ─────────────────────────────────────────────────────
# Dashboard Stats
# ─────────────────────────────────────────────────────
@router.get("/stats", response_model=AdminStatsOut)
def admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Global platform statistics for the admin dashboard."""
    total_orgs = db.query(func.count(Organization.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_subs = db.query(func.count(Subcontractor.id)).scalar() or 0

    active = db.query(func.count(Organization.id)).filter(
        Organization.subscription_status.in_(["active", "paid"])
    ).scalar() or 0

    trialing = db.query(func.count(Organization.id)).filter(
        Organization.subscription_status == "trialing"
    ).scalar() or 0

    canceled = db.query(func.count(Organization.id)).filter(
        Organization.subscription_status == "canceled"
    ).scalar() or 0

    # Revenue estimate based on active subscriptions
    plan_prices = {"starter": 49, "growth": 99, "pro": 199}
    active_orgs = db.query(Organization).filter(
        Organization.subscription_status.in_(["active", "paid"])
    ).all()
    revenue = sum(plan_prices.get(org.subscription_plan or "growth", 99) for org in active_orgs)

    expired = total_orgs - active - trialing - canceled

    return AdminStatsOut(
        total_organizations=total_orgs,
        total_users=total_users,
        total_subcontractors=total_subs,
        active_subscriptions=active,
        trialing_orgs=trialing,
        expired_trials=max(0, expired),
        canceled_subscriptions=canceled,
        revenue_monthly_estimate=float(revenue)
    )


# ─────────────────────────────────────────────────────
# User Management
# ─────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all users with their organization details."""
    query = db.query(User).options(joinedload(User.organization))

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(User.email).like(search_term)) |
            (func.lower(User.full_name).like(search_term))
        )

    users = query.order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        org = u.organization
        sub_count = db.query(func.count(Subcontractor.id)).filter(
            Subcontractor.organization_id == org.id
        ).scalar() or 0

        result.append(AdminUserOut(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            created_at=u.created_at,
            organization_id=org.id,
            organization_name=org.name,
            subscription_status=org.subscription_status or "trialing",
            subscription_plan=org.subscription_plan or "growth",
            subcontractor_count=sub_count,
            stripe_customer_id=org.stripe_customer_id
        ))

    return result


@router.get("/organizations")
def list_organizations(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all organizations with their users and subcontractor counts."""
    orgs = db.query(Organization).options(
        joinedload(Organization.users)
    ).order_by(Organization.created_at.desc()).all()

    result = []
    for org in orgs:
        sub_count = db.query(func.count(Subcontractor.id)).filter(
            Subcontractor.organization_id == org.id
        ).scalar() or 0

        result.append(AdminOrgOut(
            id=org.id,
            name=org.name,
            slug=org.slug,
            subscription_status=org.subscription_status or "trialing",
            subscription_plan=org.subscription_plan or "growth",
            subcontractor_limit=org.subcontractor_limit or 50,
            subcontractor_count=sub_count,
            stripe_customer_id=org.stripe_customer_id,
            stripe_subscription_id=org.stripe_subscription_id,
            created_at=org.created_at,
            users=[{
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "created_at": u.created_at.isoformat() if u.created_at else None
            } for u in org.users]
        ))

    return result


# ─────────────────────────────────────────────────────
# Create User (Admin)
# ─────────────────────────────────────────────────────
@router.post("/users")
def admin_create_user(
    payload: CreateUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin creates a new user + organization."""
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    plan_limits = {"starter": 15, "growth": 50, "pro": 150}
    slug = payload.company_name.lower().replace(" ", "-").replace(".", "")[:40] + "-" + str(uuid.uuid4())[:6]

    org = Organization(
        name=payload.company_name,
        slug=slug,
        subscription_status="trialing",
        subscription_plan=payload.plan,
        subcontractor_limit=plan_limits.get(payload.plan, 50)
    )
    db.add(org)
    db.flush()

    user = User(
        organization_id=org.id,
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name or payload.company_name,
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"User {user.email} created successfully.",
        "user_id": user.id,
        "organization_id": org.id
    }


# ─────────────────────────────────────────────────────
# Reset Password (Admin)
# ─────────────────────────────────────────────────────
@router.post("/reset-password")
def admin_reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin force-resets a user's password."""
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters."
        )

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {
        "message": f"Password for {user.email} has been reset successfully.",
        "user_id": user.id
    }


# ─────────────────────────────────────────────────────
# Delete User (Admin)
# ─────────────────────────────────────────────────────
@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin deletes a user. If they're the last user in an org, deletes the org too."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.email.lower() == ADMIN_EMAIL.lower():
        raise HTTPException(status_code=400, detail="Cannot delete the admin account.")

    org = user.organization
    email = user.email
    db.delete(user)

    # If no more users in the org, delete the org and its subcontractors
    remaining = db.query(User).filter(
        User.organization_id == org.id,
        User.id != user_id
    ).count()

    if remaining == 0:
        db.delete(org)

    db.commit()
    return {"message": f"User {email} deleted successfully."}


# ─────────────────────────────────────────────────────
# Update Subscription (Admin)
# ─────────────────────────────────────────────────────
@router.put("/subscription")
def admin_update_subscription(
    payload: UpdateSubscriptionRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin manually updates an organization's subscription status/plan."""
    org = db.query(Organization).filter(Organization.id == payload.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    plan_limits = {"starter": 15, "growth": 50, "pro": 150}
    org.subscription_plan = payload.plan
    org.subscription_status = payload.status
    org.subcontractor_limit = plan_limits.get(payload.plan, 50)
    db.commit()

    return {
        "message": f"Subscription for {org.name} updated to {payload.plan} ({payload.status}).",
        "organization_id": org.id
    }


# ─────────────────────────────────────────────────────
# Payment History (via Stripe API)
# ─────────────────────────────────────────────────────
@router.get("/payments")
def admin_list_payments(
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List recent Stripe payment intents / invoices across all customers."""
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY.startswith("sk_test_mock"):
        # Return organization-based summary when no Stripe key
        orgs = db.query(Organization).filter(
            Organization.stripe_customer_id.isnot(None)
        ).order_by(Organization.updated_at.desc()).limit(limit).all()

        return [{
            "organization": org.name,
            "plan": org.subscription_plan,
            "status": org.subscription_status,
            "stripe_customer_id": org.stripe_customer_id,
            "stripe_subscription_id": org.stripe_subscription_id,
            "created_at": org.created_at.isoformat() if org.created_at else None
        } for org in orgs]

    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Fetch recent invoices
        invoices = stripe.Invoice.list(limit=limit)
        result = []
        for inv in invoices.data:
            result.append({
                "id": inv.id,
                "customer": inv.customer,
                "customer_email": inv.customer_email,
                "amount_paid": inv.amount_paid / 100.0,
                "currency": inv.currency,
                "status": inv.status,
                "created": datetime.fromtimestamp(inv.created).isoformat(),
                "invoice_url": inv.hosted_invoice_url,
                "subscription": inv.subscription
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
