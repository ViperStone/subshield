import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.organization import User
from app.models.subcontractor import Subcontractor
from app.models.certificate import Certificate, NotificationLog
from app.schemas.subcontractor import SubcontractorCreate, SubcontractorUpdate, SubcontractorResponse
from app.schemas.certificate import CertificateResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/subcontractors", tags=["Subcontractors Management"])

def _format_subcontractor(sub: Subcontractor) -> SubcontractorResponse:
    latest_cert = None
    if sub.certificates:
        # First one is the latest due to order_by="desc(Certificate.created_at)"
        c = sub.certificates[0]
        latest_cert = CertificateResponse(
            id=c.id,
            subcontractor_id=c.subcontractor_id,
            file_name=c.file_name,
            file_url=c.file_url,
            is_current=c.is_current,
            gl_expiration_date=c.gl_expiration_date,
            wc_expiration_date=c.wc_expiration_date,
            auto_expiration_date=c.auto_expiration_date,
            gl_occurrence_limit=float(c.gl_occurrence_limit) if c.gl_occurrence_limit else None,
            gl_aggregate_limit=float(c.gl_aggregate_limit) if c.gl_aggregate_limit else None,
            workers_comp_statutory=c.workers_comp_statutory,
            additional_insured_verified=c.additional_insured_verified,
            certificate_holder_verified=c.certificate_holder_verified,
            is_compliant=c.is_compliant,
            compliance_notes=c.compliance_notes,
            raw_ai_json=c.raw_ai_json,
            created_at=c.created_at
        )

    return SubcontractorResponse(
        id=sub.id,
        organization_id=sub.organization_id,
        company_name=sub.company_name,
        trade_category=sub.trade_category,
        contact_name=sub.contact_name,
        contact_email=sub.contact_email,
        contact_phone=sub.contact_phone,
        magic_upload_token=sub.magic_upload_token,
        magic_upload_url=f"{settings.FRONTEND_URL}/upload/{sub.magic_upload_token}",
        status=sub.status,
        notes=sub.notes,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        latest_certificate=latest_cert
    )

@router.get("", response_model=List[SubcontractorResponse])
def list_subcontractors(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Subcontractor).filter(Subcontractor.organization_id == user.organization_id)
    
    if status and status != "all":
        query = query.filter(Subcontractor.status == status)
    if search:
        query = query.filter(Subcontractor.company_name.ilike(f"%{search}%"))

    subs = query.order_by(Subcontractor.company_name.asc()).all()
    return [_format_subcontractor(s) for s in subs]

@router.post("", response_model=SubcontractorResponse, status_code=status.HTTP_201_CREATED)
def create_subcontractor(
    payload: SubcontractorCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Check 7-day free trial expiration
    from app.routers.billing import get_org_trial_details
    trial = get_org_trial_details(user.organization)
    if trial["is_trial_expired"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Your 7-day free trial has expired. Please activate your subscription plan in Billing to continue adding subcontractors."
        )

    # Check subscription limit
    count = db.query(Subcontractor).filter(Subcontractor.organization_id == user.organization_id).count()
    if count >= user.organization.subcontractor_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Subcontractor limit reached ({user.organization.subcontractor_limit}). Please upgrade your plan."
        )

    sub = Subcontractor(
        organization_id=user.organization_id,
        company_name=payload.company_name,
        trade_category=payload.trade_category or "General Trade",
        contact_name=payload.contact_name,
        contact_email=payload.contact_email.lower(),
        contact_phone=payload.contact_phone,
        notes=payload.notes,
        magic_upload_token=str(uuid.uuid4()),
        status="pending"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _format_subcontractor(sub)

@router.get("/{sub_id}", response_model=SubcontractorResponse)
def get_subcontractor(
    sub_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    sub = db.query(Subcontractor).filter(
        Subcontractor.id == sub_id,
        Subcontractor.organization_id == user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontractor not found")
    return _format_subcontractor(sub)

@router.put("/{sub_id}", response_model=SubcontractorResponse)
def update_subcontractor(
    sub_id: str,
    payload: SubcontractorUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    sub = db.query(Subcontractor).filter(
        Subcontractor.id == sub_id,
        Subcontractor.organization_id == user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    if payload.company_name is not None:
        sub.company_name = payload.company_name
    if payload.trade_category is not None:
        sub.trade_category = payload.trade_category
    if payload.contact_name is not None:
        sub.contact_name = payload.contact_name
    if payload.contact_email is not None:
        sub.contact_email = payload.contact_email.lower()
    if payload.contact_phone is not None:
        sub.contact_phone = payload.contact_phone
    if payload.notes is not None:
        sub.notes = payload.notes
    if payload.status is not None:
        sub.status = payload.status

    db.commit()
    db.refresh(sub)
    return _format_subcontractor(sub)

@router.delete("/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subcontractor(
    sub_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    sub = db.query(Subcontractor).filter(
        Subcontractor.id == sub_id,
        Subcontractor.organization_id == user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    db.delete(sub)
    db.commit()
    return None

@router.post("/{sub_id}/remind")
def trigger_reminder(
    sub_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    sub = db.query(Subcontractor).filter(
        Subcontractor.id == sub_id,
        Subcontractor.organization_id == user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    log = NotificationLog(
        subcontractor_id=sub.id,
        recipient_email=sub.contact_email,
        recipient_phone=sub.contact_phone,
        notification_type="manual_reminder",
        status="sent"
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": f"Renewal reminder sent to {sub.contact_email}",
        "upload_url": f"{settings.FRONTEND_URL}/upload/{sub.magic_upload_token}"
    }
