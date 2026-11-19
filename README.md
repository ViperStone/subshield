# SubShield (2026) — Subcontractor Insurance Compliance Autopilot

> **Target Objective:** \$1,000–\$3,000 Initial MRR (10–30 General Contractors @ \$99/mo) scaling to \$10,000+ MRR.  
> **Tech Stack:** Python (FastAPI) + React (Next.js 14, TypeScript, Tailwind CSS) + PostgreSQL / SQLite + OpenAI ACORD 25 OCR.

---

## 1. Product Overview

General Contractors (GCs) and specialty trade contractors face severe financial liability if subcontractors work with expired or deficient insurance policies. A single uncovered jobsite accident can bankrupt a contractor, and annual workers' comp audits routinely hit GCs with **\$15,000–\$30,000 in retroactive penalty premiums**.

**SubShield** solves this through a zero-friction loop:
1. **Zero-Login Magic Links:** The GC enters a subcontractor's name/email; SubShield generates a unique link (`app.subshield.io/upload/{token}`).
2. **AI ACORD 25 Parsing:** The subcontractor or their insurance broker drops their 1-page ACORD 25 PDF. The AI vision engine extracts General Liability limits, Workers' Comp statutory status, expiration dates, and Additional Insured checkboxes in 5 seconds.
3. **Automated Verification:** The system matches extracted limits against the GC's requirements.
4. **30-Day Autopilot Chaser:** Automated email and SMS alerts fire at 30, 14, and 3 days before policies expire.
5. **1-Click Audit Export:** When insurance auditors arrive, the GC clicks "Download Audit CSV Export" for a clean, passed compliance packet.

---

## 2. Directory Structure

```
subshield/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & CORS configuration
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   ├── database.py          # SQLAlchemy SessionLocal & engine
│   │   ├── models/              # Organization, User, Subcontractor, Certificate
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # /auth, /subcontractors, /public, /analytics
│   │   └── services/            # ai_extractor.py, compliance_evaluator.py, auth_service.py
│   ├── requirements.txt
│   └── subshield.db             # Local SQLite database (seeded)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # High-converting Landing Page
│   │   │   ├── login/page.tsx   # Sign in & 1-click Demo Sign In
│   │   │   ├── dashboard/       # Main GC Dashboard with roster table & metrics
│   │   │   │   ├── rules/       # Compliance rules configuration
│   │   │   │   └── audit/       # Insurance audit export & CSV generation
│   │   │   └── upload/[token]/  # Public Subcontractor Magic Upload Portal
│   │   ├── components/          # Navbar, SubcontractorModal, CertificateModal
│   │   └── lib/                 # api.ts client & types.ts
│   └── package.json
├── sample_data/
│   ├── seed_demo.py             # Realistic seeder (Apex General Contractors + 9 subs)
│   └── generate_leads.py        # 50 targeted GC leads generator for cold outreach
├── run_dev.ps1                  # 1-Click developer runner script
└── README.md
```

---

## 3. Quick Start (Local Development)

### 1. Run the All-in-One Runner:
In PowerShell:
```powershell
.\run_dev.ps1
```

### Or Run Manually:

**Backend:**
```powershell
cd backend
C:\Users\HP\AppData\Local\Python\envs\subshield\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)*

**Frontend:**
```powershell
cd frontend
npm run dev
```
*Frontend will be live at: [http://localhost:3000](http://localhost:3000)*

---

## 4. Demo Sandbox Credentials

- **Email:** `demo@apexcontracting.com`
- **Password:** `demo1234`
- **1-Click Login:** Click the **"1-Click Live Demo Sign In"** button on the `/login` page or the landing page.

---

## 5. First 100 Customers Acquisition Strategy

1. **Run Lead Generator:**
   ```powershell
   C:\Users\HP\AppData\Local\Python\envs\subshield\Scripts\python.exe sample_data\generate_leads.py
   ```
   *Generates `sample_data/gc_leads_50.csv` containing targeted commercial General Contractors.*

2. **Send Cold Email Sequence (Phase 8 template):**
   - 30 emails sent per day.
   - Offer the **Free Insurance Compliance Audit**: *"Send us 10 of your subcontractor certificates; we will run them through SubShield and send you a deficiency report in 5 minutes."*
   - Convert 20% of audited GCs to the **\$99/mo Growth Plan**.
