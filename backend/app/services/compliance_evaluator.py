from datetime import date, timedelta
from typing import Tuple, List
from app.schemas.extraction import ACORD25ExtractionSchema
from app.models.organization import ComplianceRule

def evaluate_certificate_compliance(
    extracted: ACORD25ExtractionSchema,
    rules: ComplianceRule,
    target_date: date = None
) -> Tuple[bool, str, str]:
    """
    Evaluates extracted ACORD 25 fields against company compliance rules.
    Returns:
        (is_compliant: bool, status: str ['compliant', 'expiring_soon', 'expired'], notes: str)
    """
    if target_date is None:
        target_date = date.today()

    violations: List[str] = []
    expiring_soon = False
    expired = False
    warning_threshold = target_date + timedelta(days=30)

    # 1. Commercial General Liability Limits
    if not extracted.has_general_liability:
        violations.append("Commercial General Liability coverage is missing.")
    else:
        req_occ = float(rules.min_general_liability_occurrence or 1000000.0)
        req_agg = float(rules.min_general_liability_aggregate or 2000000.0)
        
        occ_limit = extracted.gl_each_occurrence_limit or 0.0
        agg_limit = extracted.gl_general_aggregate_limit or 0.0

        if occ_limit < req_occ:
            violations.append(f"General Liability Occurrence Limit (${occ_limit:,.0f}) is below required (${req_occ:,.0f}).")
        if agg_limit < req_agg:
            violations.append(f"General Liability Aggregate Limit (${agg_limit:,.0f}) is below required (${req_agg:,.0f}).")

        # Expiration check
        if extracted.gl_expiration_date:
            if extracted.gl_expiration_date <= target_date:
                expired = True
                violations.append(f"General Liability expired on {extracted.gl_expiration_date}.")
            elif extracted.gl_expiration_date <= warning_threshold:
                expiring_soon = True

    # 2. Workers' Compensation
    if rules.require_workers_comp:
        if not extracted.has_workers_comp:
            violations.append("Workers' Compensation coverage is required but missing.")
        elif extracted.wc_expiration_date:
            if extracted.wc_expiration_date <= target_date:
                expired = True
                violations.append(f"Workers' Comp expired on {extracted.wc_expiration_date}.")
            elif extracted.wc_expiration_date <= warning_threshold:
                expiring_soon = True

    # 3. Automobile Liability
    if rules.require_auto_liability:
        if not extracted.has_auto_liability:
            violations.append("Automobile Liability coverage is required but missing.")
        elif extracted.auto_expiration_date:
            if extracted.auto_expiration_date <= target_date:
                expired = True
                violations.append(f"Automobile Liability expired on {extracted.auto_expiration_date}.")
            elif extracted.auto_expiration_date <= warning_threshold:
                expiring_soon = True

    # 4. Additional Insured Endorsement
    if rules.require_additional_insured and not extracted.additional_insured_checked:
        violations.append("Additional Insured endorsement (ADDL INSR) is not checked on the certificate.")

    # 5. Certificate Holder Verification
    if rules.required_certificate_holder_text:
        req_holder = rules.required_certificate_holder_text.strip().lower()
        actual_holder = (extracted.certificate_holder_text or "").strip().lower()
        if req_holder not in actual_holder:
            violations.append(f"Certificate Holder does not name '{rules.required_certificate_holder_text}'.")

    # Final status calculation
    is_compliant = len(violations) == 0

    if expired:
        status = "expired"
    elif not is_compliant:
        status = "non_compliant"
    elif expiring_soon:
        status = "expiring_soon"
    else:
        status = "compliant"

    notes = "All requirements satisfied." if is_compliant else " | ".join(violations)
    return is_compliant, status, notes
