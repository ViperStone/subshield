from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ACORD25ExtractionSchema(BaseModel):
    insured_company_name: str = Field(..., description="Name of the insured subcontractor company on the certificate")
    producer_agency_name: Optional[str] = Field(None, description="Insurance broker/agency name")
    insurer_name: Optional[str] = Field(None, description="Insurance carrier / company name")

    # Commercial General Liability
    has_general_liability: bool = Field(True, description="Whether General Liability coverage is present")
    gl_policy_number: Optional[str] = Field(None, description="General Liability Policy Number")
    gl_each_occurrence_limit: Optional[float] = Field(None, description="General Liability Each Occurrence limit in USD")
    gl_general_aggregate_limit: Optional[float] = Field(None, description="General Liability General Aggregate limit in USD")
    gl_expiration_date: Optional[date] = Field(None, description="General Liability Policy Expiration Date (YYYY-MM-DD)")

    # Workers Compensation
    has_workers_comp: bool = Field(True, description="Whether Workers Compensation coverage is present")
    wc_policy_number: Optional[str] = Field(None, description="Workers Comp Policy Number")
    wc_expiration_date: Optional[date] = Field(None, description="Workers Comp Expiration Date (YYYY-MM-DD)")
    wc_statutory_limits: bool = Field(True, description="Whether statutory limits are indicated")

    # Automobile Liability
    has_auto_liability: bool = Field(False, description="Whether Automobile Liability is present")
    auto_combined_single_limit: Optional[float] = Field(None, description="Auto combined single limit in USD")
    auto_expiration_date: Optional[date] = Field(None, description="Auto Policy Expiration Date (YYYY-MM-DD)")

    # Endorsements & Certificate Holder
    additional_insured_checked: bool = Field(False, description="Whether Additional Insured checkbox (ADDL INSR) is marked Y or checked")
    waiver_of_subrogation_checked: bool = Field(False, description="Whether Waiver of Subrogation (SUBR WVD) is marked Y or checked")
    certificate_holder_text: Optional[str] = Field(None, description="Exact text written in the Certificate Holder box")
