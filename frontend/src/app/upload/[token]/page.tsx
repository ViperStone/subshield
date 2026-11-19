"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Loader2
} from "lucide-react";
import { fetchPublicPortal, uploadPublicCertificate } from "../../../lib/api";
import { PublicPortalInfo, UploadResult } from "../../../lib/types";

export default function MagicUploadPortal() {
  const params = useParams();
  const token = params?.token as string;

  const [portalInfo, setPortalInfo] = useState<PublicPortalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const info = await fetchPublicPortal(token);
        setPortalInfo(info);
      } catch (err: any) {
        setError(err.message || "Invalid or expired upload link.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload an official ACORD 25 PDF document.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress("Analyzing ACORD 25 PDF with AI vision parser...");

    try {
      setTimeout(() => setUploadProgress("Extracting limits, policy dates, and endorsements..."), 600);
      setTimeout(() => setUploadProgress("Matching against GC compliance requirements..."), 1200);

      const result = await uploadPublicCertificate(token, file);
      setUploadResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to process certificate. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading secure verification portal...</span>
        </div>
      </div>
    );
  }

  if (error && !portalInfo) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Invalid or Expired Link</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <p className="text-xs text-slate-500">
            Please contact your General Contractor project manager to receive a new compliance link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>SubShield Secure Compliance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Insurance Certificate Verification
          </h1>
          <p className="text-xs text-slate-400">
            Requested by <strong className="text-white">{portalInfo?.gc_company_name}</strong> for{" "}
            <span className="text-blue-400 font-semibold">{portalInfo?.subcontractor_company}</span>
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {uploadResult ? (
            /* Result Banner */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  uploadResult.is_compliant ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {uploadResult.is_compliant ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <AlertTriangle className="w-10 h-10" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {uploadResult.is_compliant ? "Certificate Approved!" : "Certificate Processed with Warnings"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {uploadResult.message}
                </p>
              </div>

              {/* Extraction summary */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left divide-y divide-slate-800 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Insured Company:</span>
                  <span className="font-semibold text-white">{uploadResult.company_name}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">General Liability Expiration:</span>
                  <span className="font-mono font-semibold text-white">
                    {uploadResult.gl_expiration || "N/A"}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Additional Insured Verified:</span>
                  <span className={`font-semibold ${uploadResult.additional_insured ? "text-emerald-400" : "text-amber-400"}`}>
                    {uploadResult.additional_insured ? "Verified (Yes)" : "Not Detected"}
                  </span>
                </div>
                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Compliance Notes:</span>
                  <span className="text-slate-300 italic">{uploadResult.compliance_notes}</span>
                </div>
              </div>

              <button
                onClick={() => setUploadResult(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Upload a Different PDF
              </button>
            </div>
          ) : (
            /* Upload Dropzone */
            <>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-center space-x-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 sm:p-12 text-center transition-all bg-slate-950/40 cursor-pointer group"
              >
                <input
                  type="file"
                  id="cert-file-input"
                  accept="application/pdf"
                  onChange={onFileSelect}
                  className="hidden"
                />
                <label htmlFor="cert-file-input" className="cursor-pointer space-y-4 block">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 group-hover:scale-110 flex items-center justify-center mx-auto transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Drop your ACORD 25 Certificate PDF here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      or <span className="text-blue-400 underline">browse files</span> on your device
                    </p>
                  </div>
                  <span className="inline-block text-[10px] text-slate-500 font-mono">
                    Official 1-page PDF format supported
                  </span>
                </label>
              </div>

              {uploading && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center space-x-3 text-xs text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-blue-400" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Required Checklist Display */}
              {portalInfo?.requirements && (
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Coverage Required by {portalInfo.gc_company_name}</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>
                        Commercial General Liability: min ${portalInfo.requirements.min_gl_occurrence.toLocaleString()} Each Occurrence
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Workers' Compensation & Employer's Liability active</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>
                        Additional Insured box marked naming "{portalInfo.requirements.certificate_holder}"
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Powered by SubShield Compliance Engine • 256-bit encrypted transmission
        </p>
      </div>
    </div>
  );
}
