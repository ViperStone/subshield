"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { fetchComplianceRules, updateComplianceRules } from "../../../lib/api";
import { Sliders, Save, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { ComplianceRules } from "../../../lib/types";

export default function RulesPage() {
  const [rules, setRules] = useState<ComplianceRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetchComplianceRules();
        setRules(r);
      } catch (err: any) {
        setError(err.message || "Failed to load compliance rules.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rules) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateComplianceRules(rules);
      setRules(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update rules.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Insurance Compliance Rules
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure coverage limits and mandatory endorsements. Incoming ACORD 25 certificates
            are automatically evaluated against these rules.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Compliance rules saved successfully! All incoming certificates will use these thresholds.</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            Loading compliance parameters...
          </div>
        ) : rules ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Liability */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Commercial General Liability (CGL)</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Each Occurrence Limit ($ USD)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={rules.min_general_liability_occurrence}
                    onChange={(e) =>
                      setRules({ ...rules, min_general_liability_occurrence: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard commercial tier: $1,000,000</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum General Aggregate Limit ($ USD)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={rules.min_general_liability_aggregate}
                    onChange={(e) =>
                      setRules({ ...rules, min_general_liability_aggregate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard commercial tier: $2,000,000</span>
                </div>
              </div>
            </div>

            {/* Mandatory Coverage Toggles */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Mandatory Coverages & Endorsements
              </h2>

              <div className="space-y-3 divide-y divide-slate-100">
                <label className="pt-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Workers' Compensation & Employer's Liability</span>
                    <p className="text-xs text-slate-500">Require statutory worker injury coverage on all certificates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.require_workers_comp}
                    onChange={(e) => setRules({ ...rules, require_workers_comp: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="pt-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Automobile Liability (Combined Single Limit)</span>
                    <p className="text-xs text-slate-500">Require active commercial auto policy for work vehicles on site.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.require_auto_liability}
                    onChange={(e) => setRules({ ...rules, require_auto_liability: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="pt-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Additional Insured Endorsement (ADDL INSR)</span>
                    <p className="text-xs text-slate-500">Verify that the GC is named as Additional Insured on the policy.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.require_additional_insured}
                    onChange={(e) => setRules({ ...rules, require_additional_insured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Certificate Holder Name */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Required Certificate Holder Wording
              </h2>
              <p className="text-xs text-slate-500">
                SubShield checks that the Certificate Holder box exactly lists your entity name.
              </p>
              <input
                type="text"
                placeholder="e.g. Apex General Contractors LLC, 500 Market St, San Francisco, CA"
                value={rules.required_certificate_holder_text || ""}
                onChange={(e) => setRules({ ...rules, required_certificate_holder_text: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Compliance Rules"}</span>
              </button>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
