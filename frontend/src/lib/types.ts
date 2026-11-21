export interface Certificate {
  id: string;
  subcontractor_id: string;
  file_name: string;
  file_url: string;
  is_current: boolean;
  gl_expiration_date: string | null;
  wc_expiration_date: string | null;
  auto_expiration_date: string | null;
  gl_occurrence_limit: number | null;
  gl_aggregate_limit: number | null;
  workers_comp_statutory: boolean;
  additional_insured_verified: boolean;
  certificate_holder_verified: boolean;
  is_compliant: boolean;
  compliance_notes: string | null;
  raw_ai_json: any;
  created_at: string;
}

export interface Subcontractor {
  id: string;
  organization_id: string;
  company_name: string;
  trade_category: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  magic_upload_token: string;
  magic_upload_url: string;
  status: 'compliant' | 'expiring_soon' | 'expired' | 'pending' | 'non_compliant';
  notes: string | null;
  created_at: string;
  updated_at: string;
  latest_certificate?: Certificate | null;
}

export interface DashboardMetrics {
  total_subcontractors: number;
  compliant_count: number;
  expiring_soon_count: number;
  expired_count: number;
  pending_count: number;
  overall_compliance_rate: number;
}

export interface ComplianceRules {
  id: string;
  organization_id: string;
  min_general_liability_occurrence: number;
  min_general_liability_aggregate: number;
  require_workers_comp: boolean;
  require_auto_liability: boolean;
  require_additional_insured: boolean;
  required_certificate_holder_text: string | null;
  created_at: string;
}

export interface PublicPortalInfo {
  subcontractor_company: string;
  contact_name: string | null;
  gc_company_name: string;
  status: string;
  requirements: {
    min_gl_occurrence: number;
    min_gl_aggregate: number;
    require_workers_comp: boolean;
    require_auto: boolean;
    require_additional_insured: boolean;
    certificate_holder: string;
  };
}

export interface UploadResult {
  status: string;
  company_name: string;
  is_compliant: boolean;
  compliance_notes: string;
  gl_expiration: string | null;
  wc_expiration: string | null;
  additional_insured: boolean;
  message: string;
}

export interface SubscriptionInfo {
  plan: string;
  status: string;
  subcontractor_limit: number;
  current_subcontractors_count: number;
  usage_percentage: number;
  stripe_customer_id: string | null;
  can_add_more: boolean;
  is_trial_expired: boolean;
  trial_days_remaining: number;
  trial_ends_at: string | null;
}
