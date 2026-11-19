from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplianceRuleUpdate(BaseModel):
    min_general_liability_occurrence: float = 1000000.00
    min_general_liability_aggregate: float = 2000000.00
    require_workers_comp: bool = True
    require_auto_liability: bool = True
    require_additional_insured: bool = True
    required_certificate_holder_text: Optional[str] = None

class ComplianceRuleResponse(ComplianceRuleUpdate):
    id: str
    organization_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    subscription_plan: str
    subscription_status: str
    subcontractor_limit: int
    created_at: datetime

    class Config:
        from_attributes = True
