"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { fetchSubscription, createCheckoutSession, createPortalSession } from "../../../lib/api";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertCircle
} from "lucide-react";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get("payment");

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchSubscription();
      setSubscription(data);
    } catch (e: any) {
      setError(e.message || "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (paymentStatus === "success") {
      setSuccessMsg("Payment successful! Your organization's plan and subcontractor limits have been updated.");
    }
  }, [paymentStatus]);

  const handleSelectPlan = async (planKey: string) => {
    setUpgradingPlan(planKey);
    setError(null);
    try {
      const result = await createCheckoutSession(planKey);
      if (result.url) {
        if (result.mode === "simulated") {
          setSuccessMsg(result.message);
          loadData();
        } else {
          window.location.href = result.url;
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to initiate plan change.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await createPortalSession();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (e: any) {
      alert(e.message || "Customer portal currently in test mode.");
    } finally {
      setPortalLoading(false);
    }
  };

  const plans = [
    {
      key: "starter",
      name: "Starter",
      price: "$49",
      period: "per month",
      limit: 15,
      description: "Ideal for small remodelers and residential contractors.",
      features: [
        "Up to 15 active subcontractors",
        "Automated AI ACORD 25 OCR",
        "Zero-login magic upload links",
        "30-day automated email reminders",
        "Standard email support"
      ]
    },
    {
      key: "growth",
      name: "Growth",
      price: "$99",
      period: "per month",
      limit: 50,
      popular: true,
      description: "Best for growing commercial & specialty trade GCs.",
      features: [
        "Up to 50 active subcontractors",
        "Automated Email & SMS expiration alerts",
        "Custom compliance rules & endorsement checks",
        "1-Click Annual Insurance Audit CSV Export",
        "3 User seats for office & project managers",
        "Priority support"
      ]
    },
    {
      key: "pro",
      name: "Commercial",
      price: "$199",
      period: "per month",
      limit: 150,
      description: "For multi-project commercial builders managing high volume.",
      features: [
        "Up to 150 active subcontractors",
        "Unlimited project manager seats",
        "Multi-project compliance partitioning",
        "Custom broker CC email routing",
        "Dedicated compliance audit review",
        "Phone & priority SLA support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Subscription & Billing
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage your SubShield subscription tier, billing cycle, and subcontractor limits.
            </p>
          </div>

          <button
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <span>{portalLoading ? "Opening..." : "Manage Invoices & Cards"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Visa Card Payment Assurance Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-lg shadow-blue-950/20">
          <div className="flex items-center space-x-3.5">
            <div className="px-3 py-1.5 bg-white text-blue-900 font-black rounded-lg text-xs tracking-wider uppercase shadow-inner flex items-center justify-center">
              VISA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">Visa Card Secured Subscriptions</span>
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded text-[10px] font-semibold">
                  Only Visa Accepted
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Start your 7-day trial for \$0.00 today. Your Visa card will be automatically debited at the end of day 7. Cancel anytime before without fee.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-blue-200 whitespace-nowrap pl-2 sm:pl-0 border-t sm:border-t-0 border-blue-800 pt-2 sm:pt-0">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>256-bit Encrypted PCI-DSS</span>
          </div>
        </div>

        {/* Current Plan Overview Card */}
        {subscription && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Subscription Tier
                </span>
                <div className="flex items-center space-x-3 mt-1">
                  <h3 className="text-xl font-extrabold text-slate-900 capitalize">
                    {subscription.plan} Plan
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                    {subscription.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Roster Capacity
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {subscription.current_subcontractors_count} of {subscription.subcontractor_limit} slots used
                </p>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="pt-6">
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span>Usage Progress</span>
                <span className="font-semibold">{subscription.usage_percentage}% capacity</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    subscription.usage_percentage > 90
                      ? "bg-rose-500"
                      : subscription.usage_percentage > 70
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(subscription.usage_percentage, 100)}%` }}
                />
              </div>
              {subscription.usage_percentage >= 80 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Approaching plan limit. Upgrade below to monitor more subcontractors.</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = subscription?.plan?.toLowerCase() === p.key;
            return (
              <div
                key={p.key}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                  p.popular
                    ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Recommended Tier
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{p.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500"> /{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSelectPlan(p.key)}
                        disabled={upgradingPlan === p.key}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-sm ${
                          p.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        <span>
                          {upgradingPlan === p.key
                            ? "Redirecting to Stripe..."
                            : subscription?.is_trial_expired
                            ? `Activate ${p.name}`
                            : `Start 7-Day Free Trial ($0 today)`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-[11px] text-slate-400 text-center mt-2">
                        {subscription?.is_trial_expired
                          ? `Billed ${p.price}/mo automatically. Cancel anytime.`
                          : `7 days free, then ${p.price}/mo automatically debited. Cancel anytime.`}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function BillingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading billing details...
      </div>
    }>
      <BillingContent />
    </React.Suspense>
  );
}
