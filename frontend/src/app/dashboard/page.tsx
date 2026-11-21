"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  Search,
  Copy,
  Check,
  Send,
  Eye,
  Trash2,
  FileText,
  ExternalLink,
  RefreshCw,
  Lock,
  Zap,
  ArrowRight
} from "lucide-react";
import Navbar from "../../components/Navbar";
import SubcontractorModal from "../../components/SubcontractorModal";
import CertificateModal from "../../components/CertificateModal";
import {
  fetchDashboardMetrics,
  fetchSubcontractors,
  fetchSubscription,
  deleteSubcontractor,
  sendRenewalReminder
} from "../../lib/api";
import { Subcontractor, DashboardMetrics, SubscriptionInfo } from "../../lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [remindedId, setRemindedId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubForCert, setSelectedSubForCert] = useState<Subcontractor | null>(null);

  const loadData = async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("subshield_token")) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const [m, s, subInfo] = await Promise.all([
        fetchDashboardMetrics(),
        fetchSubcontractors(statusFilter, searchQuery),
        fetchSubscription().catch(() => null)
      ]);
      setMetrics(m);
      setSubcontractors(s);
      if (subInfo) setSubscription(subInfo);
    } catch (err: any) {
      if (typeof window !== "undefined" && !localStorage.getItem("subshield_token")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCopyLink = (sub: Subcontractor) => {
    navigator.clipboard.writeText(sub.magic_upload_url);
    setCopiedId(sub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendReminder = async (sub: Subcontractor) => {
    try {
      await sendRenewalReminder(sub.id);
      setRemindedId(sub.id);
      setTimeout(() => setRemindedId(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch reminder.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subcontractor from your roster?")) {
      await deleteSubcontractor(id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {subscription?.is_trial_expired ? (
          <div className="max-w-4xl mx-auto py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Your 7-Day Free Trial Has Ended
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
              Your trial period has concluded. Activate a subscription plan below to unlock your subcontractor roster, automate ACORD 25 verification, and maintain continuous compliance protection.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Starter */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Starter</h3>
                  <p className="text-xs text-slate-500 mt-1">For specialty trade contractors</p>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-slate-900">$49</span>
                    <span className="text-xs text-slate-500"> / month</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-6">Up to 15 active subcontractors with automated AI certificate reading.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="block text-center py-2.5 rounded-lg border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Choose Starter ($49)
                </Link>
              </div>

              {/* Growth */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-600/10 relative flex flex-col justify-between">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Growth</h3>
                  <p className="text-xs text-blue-600 font-medium mt-1">For commercial & residential GCs</p>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-slate-900">$99</span>
                    <span className="text-xs text-slate-500"> / month</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-6">Up to 50 active subcontractors with custom rules, alerts & audit exports.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="block text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                >
                  Activate Growth Plan ($99)
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Commercial Pro</h3>
                  <p className="text-xs text-slate-500 mt-1">For multi-project builders</p>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-slate-900">$199</span>
                    <span className="text-xs text-slate-500"> / month</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-6">Up to 150 active subcontractors with unlimited seats & dedicated support.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="block text-center py-2.5 rounded-lg border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Choose Commercial Pro ($199)
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 7-Day Active Trial Countdown Banner */}
            {subscription?.status === "trialing" && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      7-Day Free Trial: {subscription.trial_days_remaining} day{subscription.trial_days_remaining > 1 ? "s" : ""} remaining
                    </p>
                    <p className="text-xs text-blue-100">
                      Full access to automated AI certificate reading and subcontractor magic links.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>Activate Full Subscription</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Subcontractor Compliance Roster
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time monitoring of insurance certificates, policy expiration radar, and jobsite clearance.
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => loadData()}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
                  title="Refresh Roster"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcontractor</span>
                </button>
              </div>
            </div>

        {/* KPI Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Subcontractors</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.total_subcontractors}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Compliant (Cleared)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {metrics.compliant_count}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Expiring (&lt;30 Days)</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {metrics.expiring_soon_count}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700">Expired / At Risk</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {metrics.expired_count}
              </p>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <span className="text-xs font-semibold text-blue-700">Audit Compliance Score</span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                {metrics.overall_compliance_rate}%
              </p>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { label: "All", value: "all" },
              { label: "Compliant", value: "compliant" },
              { label: "Expiring Soon", value: "expiring_soon" },
              { label: "Expired", value: "expired" },
              { label: "Pending Upload", value: "pending" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by subcontractor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>
        </div>

        {/* Subcontractors Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subcontractor & Trade</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Jobsite Status</th>
                  <th className="py-3 px-4">GL Expiration</th>
                  <th className="py-3 px-4">Addl Insured</th>
                  <th className="py-3 px-4">Magic Upload Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subcontractors.length > 0 ? (
                  subcontractors.map((sub) => {
                    const cert = sub.latest_certificate;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Company & Trade */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{sub.company_name}</div>
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                            {sub.trade_category}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{sub.contact_name || "—"}</div>
                          <div className="text-[11px] text-slate-400">{sub.contact_email}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              sub.status === "compliant"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : sub.status === "expiring_soon"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : sub.status === "expired"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {sub.status === "compliant" && <ShieldCheck className="w-3.5 h-3.5" />}
                            {sub.status === "expiring_soon" && <AlertTriangle className="w-3.5 h-3.5" />}
                            {sub.status === "expired" && <XCircle className="w-3.5 h-3.5" />}
                            {sub.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                            <span className="capitalize">{sub.status.replace("_", " ")}</span>
                          </span>
                        </td>

                        {/* GL Expiration */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {cert?.gl_expiration_date ? cert.gl_expiration_date : "No cert on file"}
                        </td>

                        {/* Additional Insured Checkbox */}
                        <td className="py-3.5 px-4">
                          {cert ? (
                            cert.additional_insured_verified ? (
                              <span className="text-emerald-600 font-bold">Yes (Verified)</span>
                            ) : (
                              <span className="text-rose-600 font-bold">No (Deficient)</span>
                            )
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Magic Upload Link */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleCopyLink(sub)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded text-[11px] font-medium transition-colors border border-slate-200"
                            title="Copy link to clipboard"
                          >
                            {copiedId === sub.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Inspect Certificate */}
                            <button
                              onClick={() => setSelectedSubForCert(sub)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded"
                              title="Inspect Extracted ACORD 25 Certificate"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Trigger Automated Reminder */}
                            <button
                              onClick={() => handleSendReminder(sub)}
                              className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded"
                              title="Send Renewal Reminder Email"
                            >
                              {remindedId === sub.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                              title="Delete Subcontractor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p>No subcontractors found matching your filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </main>

      {/* Modals */}
      <SubcontractorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />

      <CertificateModal
        subcontractor={selectedSubForCert}
        onClose={() => setSelectedSubForCert(null)}
      />
    </div>
  );
}
