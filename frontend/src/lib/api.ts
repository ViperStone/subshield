const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("subshield_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function demoLogin() {
  const res = await fetch(`${API_BASE}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to log in to demo account.");
  const data = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("subshield_token", data.access_token);
    localStorage.setItem("subshield_org_name", data.company_name);
    localStorage.setItem("subshield_user_email", data.email);
  }
  return data;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials.");
  }
  const data = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("subshield_token", data.access_token);
    localStorage.setItem("subshield_org_name", data.company_name);
    localStorage.setItem("subshield_user_email", data.email);
  }
  return data;
}

export async function fetchDashboardMetrics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  return res.json();
}

export async function fetchSubcontractors(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE}/subcontractors?${params.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch subcontractors");
  return res.json();
}

export async function createSubcontractor(data: {
  company_name: string;
  trade_category: string;
  contact_name?: string;
  contact_email: string;
  contact_phone?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/subcontractors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create subcontractor");
  }
  return res.json();
}

export async function deleteSubcontractor(id: string) {
  const res = await fetch(`${API_BASE}/subcontractors/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to delete subcontractor");
  return true;
}

export async function sendRenewalReminder(id: string) {
  const res = await fetch(`${API_BASE}/subcontractors/${id}/remind`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to send reminder");
  return res.json();
}

export async function fetchComplianceRules() {
  const res = await fetch(`${API_BASE}/analytics/rules`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch compliance rules");
  return res.json();
}

export async function updateComplianceRules(rules: any) {
  const res = await fetch(`${API_BASE}/analytics/rules`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(rules)
  });
  if (!res.ok) throw new Error("Failed to update compliance rules");
  return res.json();
}

export async function fetchAuditExport() {
  const res = await fetch(`${API_BASE}/analytics/audit-export`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to generate audit export");
  return res.json();
}

// Public Portal APIs
export async function fetchPublicPortal(token: string) {
  const res = await fetch(`${API_BASE}/public/verify/${token}`);
  if (!res.ok) throw new Error("Invalid or expired upload link.");
  return res.json();
}

export async function uploadPublicCertificate(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/public/upload/${token}`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to parse and verify certificate.");
  }
  return res.json();
}

// Billing & Subscription APIs
export async function fetchSubscription() {
  const res = await fetch(`${API_BASE}/billing/subscription`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch subscription info");
  return res.json();
}

export async function createCheckoutSession(plan: string) {
  const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ plan })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create checkout session");
  }
  return res.json();
}

export async function createPortalSession() {
  const res = await fetch(`${API_BASE}/billing/create-portal-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    }
  });
  if (!res.ok) throw new Error("Failed to open billing portal");
  return res.json();
}
