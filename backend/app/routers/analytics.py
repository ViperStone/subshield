from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.organization import User, ComplianceRule, Organization
from app.models.subcontractor import Subcontractor
from app.models.certificate import Certificate
from app.schemas.subcontractor import DashboardMetricsResponse
from app.schemas.organization import ComplianceRuleUpdate, ComplianceRuleResponse, OrganizationResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Compliance Rules"])

@router.get("/dashboard", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    subs = db.query(Subcontractor).filter(Subcontractor.organization_id == user.organization_id).all()
    total = len(subs)
    compliant = sum(1 for s in subs if s.status == "compliant")
    expiring = sum(1 for s in subs if s.status == "expiring_soon")
    expired = sum(1 for s in subs if s.status == "expired")
    pending = sum(1 for s in subs if s.status in ("pending", "non_compliant"))

    rate = (compliant / total * 100.0) if total > 0 else 100.0

    return DashboardMetricsResponse(
        total_subcontractors=total,
        compliant_count=compliant,
        expiring_soon_count=expiring,
        expired_count=expired,
        pending_count=pending,
        overall_compliance_rate=round(rate, 1)
    )

@router.get("/rules", response_model=ComplianceRuleResponse)
def get_rules(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rules = db.query(ComplianceRule).filter(ComplianceRule.organization_id == user.organization_id).first()
    if not rules:
        rules = ComplianceRule(organization_id=user.organization_id)
        db.add(rules)
        db.commit()
        db.refresh(rules)
    return rules

@router.put("/rules", response_model=ComplianceRuleResponse)
def update_rules(
    payload: ComplianceRuleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    rules = db.query(ComplianceRule).filter(ComplianceRule.organization_id == user.organization_id).first()
    if not rules:
        rules = ComplianceRule(organization_id=user.organization_id)
        db.add(rules)

    rules.min_general_liability_occurrence = payload.min_general_liability_occurrence
    rules.min_general_liability_aggregate = payload.min_general_liability_aggregate
    rules.require_workers_comp = payload.require_workers_comp
    rules.require_auto_liability = payload.require_auto_liability
    rules.require_additional_insured = payload.require_additional_insured
    rules.required_certificate_holder_text = payload.required_certificate_holder_text

    db.commit()
    db.refresh(rules)
    return rules

@router.get("/audit-export")
def generate_audit_export(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Returns audit-ready summary data for annual insurance carrier audits.
    """
    subs = db.query(Subcontractor).filter(Subcontractor.organization_id == user.organization_id).all()
    rows = []
    for s in subs:
        cert = s.certificates[0] if s.certificates else None
        rows.append({
            "subcontractor_company": s.company_name,
            "trade": s.trade_category,
            "status": s.status,
            "has_certificate": cert is not None,
            "gl_expiration": str(cert.gl_expiration_date) if cert and cert.gl_expiration_date else "N/A",
            "gl_occurrence_limit": float(cert.gl_occurrence_limit) if cert and cert.gl_occurrence_limit else 0.0,
            "wc_expiration": str(cert.wc_expiration_date) if cert and cert.wc_expiration_date else "N/A",
            "additional_insured_verified": cert.additional_insured_verified if cert else False,
            "certificate_holder_verified": cert.certificate_holder_verified if cert else False,
            "compliance_notes": cert.compliance_notes if cert else "No certificate uploaded",
            "audit_verdict": "PASSED" if s.status == "compliant" else "DEFICIENT"
        })
    return {
        "organization": user.organization.name,
        "export_date": str(user.created_at.date()),
        "total_records": len(rows),
        "records": rows
    }
