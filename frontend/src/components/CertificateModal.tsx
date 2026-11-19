"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle, XCircle, FileText, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { Subcontractor } from "../lib/types";

interface CertificateModalProps {
  subcontractor: Subcontractor | null;
  onClose: () => void;
}

export default function CertificateModal({ subcontractor, onClose }: CertificateModalProps) {
  if (!subcontractor) return null;

  const cert = subcontractor.latest_certificate;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-lg">
                {subcontractor.company_name}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-200 text-slate-700">
                {subcontractor.trade_category}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified Certificate of Liability Insurance (ACORD 25)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start space-x-3 ${
              subcontractor.status === "compliant"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : subcontractor.status === "expiring_soon"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {subcontractor.status === "compliant" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : subcontractor.status === "expiring_soon" ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm capitalize">
                Audit Status: {subcontractor.status.replace("_", " ")}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {cert?.compliance_notes || "No certificate uploaded on file yet."}
              </p>
            </div>
          </div>

          {cert ? (
            <div className="space-y-5">
              {/* Policy Expirations Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Coverage Expiration Dates</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500">General Liability</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {cert.gl_expiration_date || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500">Workers' Comp</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {cert.wc_expiration_date || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500">Automobile Liability</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {cert.auto_expiration_date || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Limits & Coverage */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Limits & Endorsements</span>
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">GL Each Occurrence Limit</span>
                    <span className="font-bold text-slate-900">
                      {cert.gl_occurrence_limit ? `$${cert.gl_occurrence_limit.toLocaleString()}` : "Not listed"}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">GL General Aggregate Limit</span>
                    <span className="font-bold text-slate-900">
                      {cert.gl_aggregate_limit ? `$${cert.gl_aggregate_limit.toLocaleString()}` : "Not listed"}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Additional Insured Endorsement</span>
                    <span className={`font-semibold flex items-center space-x-1 ${cert.additional_insured_verified ? "text-emerald-600" : "text-rose-600"}`}>
                      {cert.additional_insured_verified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified (Yes)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Missing / Unchecked</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Certificate Holder Named Correctly</span>
                    <span className={`font-semibold flex items-center space-x-1 ${cert.certificate_holder_verified ? "text-emerald-600" : "text-amber-600"}`}>
                      {cert.certificate_holder_verified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Match</span>
                        </>
                      ) : (
                        <span>Needs Review</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document metadata */}
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>File: {cert.file_name}</span>
                </span>
                <span>Processed: {new Date(cert.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p>No ACORD 25 certificate uploaded yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Subcontractor can upload via magic link:{" "}
                <span className="font-mono text-blue-600">{subcontractor.magic_upload_url}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
