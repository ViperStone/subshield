from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.certificate import CertificateResponse

class SubcontractorCreate(BaseModel):
    company_name: str
    trade_category: Optional[str] = "General Trade"
    contact_name: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class SubcontractorUpdate(BaseModel):
    company_name: Optional[str] = None
    trade_category: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class SubcontractorResponse(BaseModel):
    id: str
    organization_id: str
    company_name: str
    trade_category: str
    contact_name: Optional[str]
    contact_email: str
    contact_phone: Optional[str]
    magic_upload_token: str
    magic_upload_url: Optional[str] = None
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    latest_certificate: Optional[CertificateResponse] = None

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    total_subcontractors: int
    compliant_count: int
    expiring_soon_count: int
    expired_count: int
    pending_count: int
    overall_compliance_rate: float
