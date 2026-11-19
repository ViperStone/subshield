"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { fetchAuditExport } from "../../../lib/api";
import { FileSpreadsheet, Download, ShieldCheck, XCircle, FileText, CheckCircle2 } from "lucide-react";

export default function AuditPage() {
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuditExport();
        setAuditData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownloadCSV = () => {
    if (!auditData || !auditData.records) return;

    const headers = [
      "Subcontractor Company",
      "Trade",
      "Jobsite Status",
      "GL Expiration",
      "GL Occ Limit",
      "WC Expiration",
      "Addl Insured Verified",
      "Audit Verdict",
      "Compliance Notes"
    ];

    const rows = auditData.records.map((r: any) => [
      `"${r.subcontractor_company}"`,
      `"${r.trade}"`,
      r.status,
      r.gl_expiration,
      r.gl_occurrence_limit,
      r.wc_expiration,
      r.additional_insured_verified ? "YES" : "NO",
      r.audit_verdict,
      `"${r.compliance_notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Subcontractor_Insurance_Audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Annual Insurance Audit Report
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              One-click compliance packet generated for workers' comp and general liability insurance auditors.
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            disabled={!auditData}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit CSV Export</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            Compiling audit records...
          </div>
        ) : auditData ? (
          <div className="space-y-6">
            {/* Audit Summary Box */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Entity</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{auditData.organization}</h3>
                <p className="text-xs text-slate-500">
                  {auditData.total_records} Active Subcontractors Analyzed
                </p>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Passed Audit</span>
                  <span className="font-extrabold text-emerald-600 text-xl">
                    {auditData.records.filter((r: any) => r.audit_verdict === "PASSED").length}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-xs text-slate-400 block">Deficient / Action Needed</span>
                  <span className="font-extrabold text-rose-600 text-xl">
                    {auditData.records.filter((r: any) => r.audit_verdict !== "PASSED").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Subcontractor</th>
                      <th className="py-3 px-4">Trade</th>
                      <th className="py-3 px-4">Audit Verdict</th>
                      <th className="py-3 px-4">GL Expiration</th>
                      <th className="py-3 px-4">Occurrence Limit</th>
                      <th className="py-3 px-4">Addl Insured</th>
                      <th className="py-3 px-4">Auditor Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {auditData.records.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {r.subcontractor_company}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{r.trade}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              r.audit_verdict === "PASSED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {r.audit_verdict === "PASSED" ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span>{r.audit_verdict}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{r.gl_expiration}</td>
                        <td className="py-3.5 px-4 font-mono">
                          {r.gl_occurrence_limit ? `$${r.gl_occurrence_limit.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {r.additional_insured_verified ? (
                            <span className="text-emerald-600 font-bold">YES</span>
                          ) : (
                            <span className="text-rose-600 font-bold">NO</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={r.compliance_notes}>
                          {r.compliance_notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
