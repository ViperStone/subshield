"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Key,
  CreditCard,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Building2,
  Crown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  UserPlus,
  Clock
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminOrganizations,
  adminCreateUser,
  adminResetPassword,
  adminDeleteUser,
  adminUpdateSubscription,
  fetchAdminPayments
} from "../../../lib/api";

type TabKey = "users" | "passwords" | "payments";

interface AdminStats {
  total_organizations: number;
  total_users: number;
  total_subcontractors: number;
  active_subscriptions: number;
  trialing_orgs: number;
  expired_trials: number;
  canceled_subscriptions: number;
  revenue_monthly_estimate: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  organization_id: string;
  organization_name: string;
  subscription_status: string;
  subscription_plan: string;
  subcontractor_count: number;
  stripe_customer_id: string | null;
}

interface Payment {
  id?: string;
  organization?: string;
  customer_email?: string;
  amount_paid?: number;
  currency?: string;
  status: string;
  plan?: string;
  created?: string;
  created_at?: string;
  invoice_url?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Create user form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    company_name: "",
    email: "",
    password: "",
    full_name: "",
    plan: "growth"
  });

  // Reset password form
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const showNotif = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("subshield_token")) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const s = await fetchAdminStats();
      setStats(s);
      setAccessDenied(false);

      const [u, p] = await Promise.all([
        fetchAdminUsers(searchQuery || undefined),
        fetchAdminPayments()
      ]);
      setUsers(u);
      setPayments(p);
    } catch (err: any) {
      if (err.message === "ACCESS_DENIED") {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async () => {
    try {
      const u = await fetchAdminUsers(searchQuery || undefined);
      setUsers(u);
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateUser(createForm);
      showNotif("success", `User ${createForm.email} created successfully!`);
      setShowCreateForm(false);
      setCreateForm({ company_name: "", email: "", password: "", full_name: "", plan: "growth" });
      loadData();
    } catch (err: any) {
      showNotif("error", err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword) return;
    try {
      await adminResetPassword(resetUserId, newPassword);
      showNotif("success", `Password for ${resetEmail} reset successfully!`);
      setResetUserId(null);
      setResetEmail("");
      setNewPassword("");
    } catch (err: any) {
      showNotif("error", err.message);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) return;
    try {
      await adminDeleteUser(userId);
      showNotif("success", `User ${email} deleted.`);
      loadData();
    } catch (err: any) {
      showNotif("error", err.message);
    }
  };

  const handleUpdateSubscription = async (orgId: string, plan: string, status: string) => {
    try {
      await adminUpdateSubscription({ organization_id: orgId, plan, status });
      showNotif("success", `Subscription updated!`);
      loadData();
    } catch (err: any) {
      showNotif("error", err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      trialing: "bg-blue-50 text-blue-700 border-blue-200",
      trial_expired: "bg-amber-50 text-amber-700 border-amber-200",
      past_due: "bg-rose-50 text-rose-700 border-rose-200",
      canceled: "bg-slate-100 text-slate-600 border-slate-200"
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
            <p className="mt-2 text-sm text-slate-500">
              This dashboard is restricted to the platform administrator. Only the owner account can access admin controls.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "users", label: "Users & Accounts", icon: Users },
    { key: "passwords", label: "Password Reset", icon: Key },
    { key: "payments", label: "Payments & Revenue", icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center space-x-2 animate-in slide-in-from-right ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Admin Control Center
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage all users, password resets, and payment oversight
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => loadData()}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Organizations</span>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_organizations}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_users}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Active Subscriptions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.active_subscriptions}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700">Monthly Revenue</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">${stats.revenue_monthly_estimate}</p>
            </div>
          </div>
        )}

        {/* Sub-Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-100 flex items-center space-x-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500">Trialing</p>
                <p className="text-sm font-bold text-slate-900">{stats.trialing_orgs}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-100 flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Trial Expired</p>
                <p className="text-sm font-bold text-slate-900">{stats.expired_trials}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-100 flex items-center space-x-3">
              <XCircle className="w-4 h-4 text-rose-500" />
              <div>
                <p className="text-xs text-slate-500">Canceled</p>
                <p className="text-sm font-bold text-slate-900">{stats.canceled_subscriptions}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-slate-100 flex items-center space-x-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500">Subcontractors</p>
                <p className="text-sm font-bold text-slate-900">{stats.total_subcontractors}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-4">
            <nav className="flex space-x-1 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* ═══════════════════════════════════════ USERS TAB ═══════════════════════════════════════ */}
            {activeTab === "users" && (
              <div>
                {/* Search & Create */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                    className="relative w-full sm:w-72"
                  >
                    <input
                      type="text"
                      placeholder="Search by email or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </form>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                  <div className="mb-6 p-5 bg-blue-50/50 rounded-xl border border-blue-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span>Create New Account</span>
                    </h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          required
                          value={createForm.company_name}
                          onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Acme Construction LLC"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={createForm.full_name}
                          onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={createForm.email}
                          onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="user@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Plan</label>
                        <select
                          value={createForm.plan}
                          onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="starter">Starter ($49/mo)</option>
                          <option value="growth">Growth ($99/mo)</option>
                          <option value="pro">Commercial Pro ($199/mo)</option>
                        </select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                        >
                          Create Account
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Subs</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{u.full_name || "—"}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-700">{u.organization_name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {u.subscription_plan}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(u.subscription_status)}`}>
                                {u.subscription_status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {u.subcontractor_count}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    setResetUserId(u.id);
                                    setResetEmail(u.email);
                                    setActiveTab("passwords");
                                  }}
                                  className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded"
                                  title="Reset Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <select
                                  value={`${u.subscription_plan}|${u.subscription_status}`}
                                  onChange={(e) => {
                                    const [plan, status] = e.target.value.split("|");
                                    handleUpdateSubscription(u.organization_id, plan, status);
                                  }}
                                  className="text-[10px] px-1.5 py-1 border border-slate-200 rounded bg-white text-slate-600 cursor-pointer"
                                  title="Change Plan"
                                >
                                  <option value="starter|active">Starter (Active)</option>
                                  <option value="growth|active">Growth (Active)</option>
                                  <option value="pro|active">Pro (Active)</option>
                                  <option value={`${u.subscription_plan}|trialing`}>Trialing</option>
                                  <option value={`${u.subscription_plan}|canceled`}>Canceled</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p>{loading ? "Loading users..." : "No users found."}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════ PASSWORDS TAB ═══════════════════════════════════════ */}
            {activeTab === "passwords" && (
              <div className="max-w-xl mx-auto py-8">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Password Reset</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Force-reset a user&apos;s password from the admin panel.
                  </p>
                </div>

                {/* Select User */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Select User</label>
                    <select
                      value={resetUserId || ""}
                      onChange={(e) => {
                        const userId = e.target.value;
                        setResetUserId(userId);
                        const user = users.find((u) => u.id === userId);
                        setResetEmail(user?.email || "");
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Choose a user...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email} — {u.organization_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {resetUserId && (
                    <>
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          New Password for <span className="text-indigo-600">{resetEmail}</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min. 6 chars)"
                            minLength={6}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleResetPassword}
                        disabled={!newPassword || newPassword.length < 6}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Reset Password
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════ PAYMENTS TAB ═══════════════════════════════════════ */}
            {activeTab === "payments" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Recent Payments & Subscriptions</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Overview of all payment activity across the platform.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Stripe ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {payments.length > 0 ? (
                        payments.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">
                                {p.customer_email || p.organization || "—"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {p.plan || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {p.amount_paid !== undefined ? `$${p.amount_paid.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {p.created || p.created_at
                                ? new Date(p.created || p.created_at || "").toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-mono text-slate-400">
                                {p.stripe_customer_id || p.id || "—"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p>{loading ? "Loading payments..." : "No payment records yet."}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
