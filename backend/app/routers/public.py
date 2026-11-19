import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.subcontractor import Subcontractor
from app.models.certificate import Certificate
from app.models.organization import ComplianceRule
from app.schemas.certificate import UploadSuccessResponse
from app.services.ai_extractor import extract_certificate_from_pdf
from app.services.compliance_evaluator import evaluate_certificate_compliance

router = APIRouter(prefix="/api/public", tags=["Public Subcontractor Magic Portal"])

@router.get("/verify/{magic_token}")
def get_magic_portal_info(magic_token: str, db: Session = Depends(get_db)):
    """
    Called by public Next.js upload page to show GC company name and required coverage limits.
    """
    sub = db.query(Subcontractor).filter(Subcontractor.magic_upload_token == magic_token).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired upload link. Please request a new link from your General Contractor."
        )

    rules = db.query(ComplianceRule).filter(
        ComplianceRule.organization_id == sub.organization_id
    ).first()

    return {
        "subcontractor_company": sub.company_name,
        "contact_name": sub.contact_name,
        "gc_company_name": sub.organization.name,
        "status": sub.status,
        "requirements": {
            "min_gl_occurrence": float(rules.min_general_liability_occurrence) if rules else 1000000.0,
            "min_gl_aggregate": float(rules.min_general_liability_aggregate) if rules else 2000000.0,
            "require_workers_comp": rules.require_workers_comp if rules else True,
            "require_auto": rules.require_auto_liability if rules else True,
            "require_additional_insured": rules.require_additional_insured if rules else True,
            "certificate_holder": rules.required_certificate_holder_text if rules else sub.organization.name
        }
    }

@router.post("/upload/{magic_token}", response_model=UploadSuccessResponse)
async def upload_certificate_public(
    magic_token: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Zero-login document upload for subcontractors.
    Extracts policy fields via AI and evaluates compliance in real time.
    """
    sub = db.query(Subcontractor).filter(Subcontractor.magic_upload_token == magic_token).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Invalid or expired upload link.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF format is accepted for ACORD 25 certificates."
        )

    # Read PDF bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 1. AI Extraction
    extracted = extract_certificate_from_pdf(file_bytes, fallback_company_name=sub.company_name)

    # 2. Get Organization Compliance Rules
    rules = db.query(ComplianceRule).filter(
        ComplianceRule.organization_id == sub.organization_id
    ).first()
    if not rules:
        # Fallback default rules
        rules = ComplianceRule(
            organization_id=sub.organization_id,
            min_general_liability_occurrence=1000000.0,
            min_general_liability_aggregate=2000000.0,
            require_workers_comp=True,
            require_auto_liability=True,
            require_additional_insured=True,
            required_certificate_holder_text=sub.organization.name
        )
        db.add(rules)
        db.flush()

    # 3. Evaluate Compliance
    is_compliant, eval_status, notes = evaluate_certificate_compliance(extracted, rules)

    # 4. Save file reference (In local dev, we record the file path)
    storage_filename = f"cert_{sub.id}_{int(datetime.utcnow().timestamp())}.pdf"
    
    # 5. Mark older certificates as not current
    db.query(Certificate).filter(Certificate.subcontractor_id == sub.id).update({"is_current": False})

    # 6. Create Certificate record
    new_cert = Certificate(
        subcontractor_id=sub.id,
        file_name=file.filename,
        file_url=f"/storage/{storage_filename}",
        is_current=True,
        gl_expiration_date=extracted.gl_expiration_date,
        wc_expiration_date=extracted.wc_expiration_date,
        auto_expiration_date=extracted.auto_expiration_date,
        gl_occurrence_limit=extracted.gl_each_occurrence_limit,
        gl_aggregate_limit=extracted.gl_general_aggregate_limit,
        workers_comp_statutory=extracted.wc_statutory_limits,
        additional_insured_verified=extracted.additional_insured_checked,
        certificate_holder_verified=bool(
            rules.required_certificate_holder_text and
            rules.required_certificate_holder_text.lower() in (extracted.certificate_holder_text or "").lower()
        ),
        is_compliant=is_compliant,
        compliance_notes=notes,
        raw_ai_json=extracted.model_dump(mode="json")
    )
    db.add(new_cert)

    # 7. Update Subcontractor's status
    sub.status = eval_status
    sub.updated_at = datetime.utcnow()
    db.commit()

    return UploadSuccessResponse(
        status="success",
        company_name=sub.company_name,
        is_compliant=is_compliant,
        compliance_notes=notes,
        gl_expiration=extracted.gl_expiration_date,
        wc_expiration=extracted.wc_expiration_date,
        additional_insured=extracted.additional_insured_checked,
        message="Certificate uploaded and verified successfully!" if is_compliant else "Certificate processed with compliance warnings."
    )
