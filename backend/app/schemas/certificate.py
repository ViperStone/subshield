from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import date, datetime

class CertificateResponse(BaseModel):
    id: str
    subcontractor_id: str
    file_name: str
    file_url: str
    is_current: bool
    gl_expiration_date: Optional[date]
    wc_expiration_date: Optional[date]
    auto_expiration_date: Optional[date]
    gl_occurrence_limit: Optional[float]
    gl_aggregate_limit: Optional[float]
    workers_comp_statutory: bool
    additional_insured_verified: bool
    certificate_holder_verified: bool
    is_compliant: bool
    compliance_notes: Optional[str]
    raw_ai_json: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class UploadSuccessResponse(BaseModel):
    status: str
    company_name: str
    is_compliant: bool
    compliance_notes: Optional[str]
    gl_expiration: Optional[date]
    wc_expiration: Optional[date]
    additional_insured: bool
    message: str
