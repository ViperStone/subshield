"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  Clock,
  FileCheck,
  Lock,
  Zap,
  Building2,
  Users,
  Sparkles
} from "lucide-react";
import { demoLogin } from "../lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      router.push("/dashboard");
    } catch (e) {
      router.push("/login");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Sub<span className="text-blue-500">Shield</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDemoAccess}
              disabled={demoLoading}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {demoLoading ? "Opening Demo..." : "Demo Sandbox"}
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Built for Commercial General Contractors & Specialty Trades</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
          Automated Subcontractor <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Insurance Compliance
          </span>{" "}
          on Autopilot.
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop chasing ACORD 25 certificates in Excel. SubShield automatically collects,
          reads, verifies coverage limits, and chases renewals before policies expire—with zero data entry.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?mode=register"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-base shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDemoAccess}
            disabled={demoLoading}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-base transition-all border border-slate-700 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{demoLoading ? "Loading Sandbox..." : "Explore Demo Mode"}</span>
          </button>
        </div>

        {/* Audit Risk Warning Pill */}
        <div className="mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-2xl mx-auto text-left flex items-start space-x-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-200/90 leading-snug">
            <strong className="text-amber-300">The \$30,000 Audit Trap:</strong> When an annual workers’ comp
            auditor finds just one uninsured or expired subcontractor on your payroll, you pay retroactive
            penalties out of pocket. SubShield completely eliminates this risk.
          </p>
        </div>
      </section>

      {/* Interactive Feature Grid */}
      <section className="py-20 bg-slate-950 border-t border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything Your Office Manager Needs in One Place
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Engineered specifically for general contractors, remodelers, and specialty trades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-5">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI ACORD 25 OCR</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our vision engine extracts General Liability limits, Workers' Comp statutory status,
                expiration dates, and Additional Insured checkboxes in 5 seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-5">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Zero-Login Magic Links</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Subcontractors don't want another password. Send a secure magic upload URL; they drag & drop
                their PDF from any phone or desktop without friction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">30-Day Autopilot Chaser</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatic email and SMS alerts fire at 30, 14, and 3 days before expiration. Your office staff
                never spends Friday afternoons chasing insurance again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Transparent, High-ROI Pricing</h2>
          <p className="text-slate-400 text-sm mt-2">
            Costs less than 1 hour of your office manager's weekly time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg">Starter</h3>
              <p className="text-xs text-slate-400 mt-1">For small remodelers & custom builders</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">\$49</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Up to 15 active subcontractors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Automated AI ACORD 25 parsing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Email renewal reminders</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=register"
              className="mt-8 block text-center py-2.5 rounded-lg border border-slate-700 font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Growth - Highlighted */}
          <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border-2 border-blue-500 p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-blue-500/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Growth</h3>
              <p className="text-xs text-blue-200 mt-1">For active commercial & residential GCs</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">\$99</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Up to 50 active subcontractors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Custom coverage rules & endorsement checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Email & SMS automated expiration alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>1-Click Insurance Audit CSV Export</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=register"
              className="mt-8 block text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/30"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg">Commercial</h3>
              <p className="text-xs text-slate-400 mt-1">For multi-project commercial builders</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold">\$199</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Up to 150 active subcontractors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Unlimited team seats</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>Dedicated compliance audit review</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=register"
              className="mt-8 block text-center py-2.5 rounded-lg border border-slate-700 font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              Start Pro Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-500">
        <p>© 2026 SubShield Technologies Inc. All rights reserved. Built for General Contractors.</p>
      </footer>
    </div>
  );
}
