const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 3000));
      return apiFetch(url, options, retries - 1);
    }
    throw new Error(
      "Le serveur est en cours de réveil (Render gratuit prend ~40s au premier démarrage). Veuillez réessayer dans quelques secondes."
    );
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("subshield_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(email: string, password: string) {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
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

export async function registerUser(companyName: string, email: string, password: string, fullName?: string) {
  const res = await apiFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: companyName,
      email,
      password,
      full_name: fullName || companyName
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create account.");
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

// ─────────────────────────────────────────────────────
// Admin Dashboard APIs
// ─────────────────────────────────────────────────────
export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("ACCESS_DENIED");
    throw new Error("Failed to fetch admin stats");
  }
  return res.json();
}

export async function fetchAdminUsers(search?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchAdminOrganizations() {
  const res = await fetch(`${API_BASE}/admin/organizations`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

export async function adminCreateUser(data: {
  company_name: string;
  email: string;
  password: string;
  full_name?: string;
  plan?: string;
}) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create user");
  }
  return res.json();
}

export async function adminResetPassword(userId: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/admin/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ user_id: userId, new_password: newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }
  return res.json();
}

export async function adminDeleteUser(userId: string) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete user");
  }
  return res.json();
}

export async function adminUpdateSubscription(data: {
  organization_id: string;
  plan: string;
  status: string;
}) {
  const res = await fetch(`${API_BASE}/admin/subscription`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update subscription");
  }
  return res.json();
}

export async function fetchAdminPayments(limit: number = 25) {
  const res = await fetch(`${API_BASE}/admin/payments?limit=${limit}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

