import os
import sys
import csv
import json
import argparse
from typing import List, Dict, Any

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

TEMPLATES = {
    "step_1_audit_hook": {
        "subject": "quick question about {company_name}'s sub COIs",
        "body": """Hi {first_name},

Noticed {company_name} is running some significant commercial projects across {city}.

Quick question: who on your team is currently responsible for chasing updated ACORD 25 insurance certificates from your ~{estimated_subs} subcontractors when their policies expire?

Most general contractors I speak with track this in a spreadsheet—which usually works until an insurance auditor hits them with an unexpected ${estimated_penalty:,} retroactive penalty for an expired policy or missing Additional Insured endorsement.

I built a lightweight tool called SubShield that completely automates this:
1. Your subs receive a zero-login magic link to upload their renewal certificate from any phone or computer.
2. Our AI reads the limits and policy dates in 5 seconds to confirm they meet your exact coverage rules.
3. Automated reminders chase them 30 days before expiration so your office doesn't have to.

We're offering a free insurance compliance check for commercial GCs in {city}. If you send over 5-10 of your current subcontractor certificates, our system will run an audit report highlighting any expired policies, missing endorsements, or coverage deficits at no charge.

Open to seeing what a 2-minute audit looks like for {company_name}?

Best regards,

[Your Name]
Founder, SubShield
subshield.io | [Your Phone Number]"""
    },
    "step_2_video_bump": {
        "subject": "Re: quick question about {company_name}'s sub COIs",
        "body": """Hi {first_name},

Following up on my note from Tuesday. 

I recorded a 60-second walkthrough showing how our zero-login upload link works for subcontractors (they don't need a password or app):

[Link: 60-Second SubShield Demo Walkthrough]

Even if you're happy with your current spreadsheet process, would you be open to running 5 sample certificates through our engine just to see if any expired policies slip past your filters?

Best,

[Your Name]"""
    },
    "step_3_breakup": {
        "subject": "closing the loop regarding {company_name}",
        "body": """Hi {first_name},

Assuming managing subcontractor certificates isn't a top priority for {company_name} right now.

I put together a 1-page "GC Subcontractor Insurance Audit Checklist (2026 Edition)" that lists the top 5 endorsement mistakes auditors penalize contractors for. Happy to send it over if helpful.

If you ever want to automate your certificate renewals down the road, feel free to reach back out.

Best of luck with your projects across {city}.

Best,

[Your Name]"""
    }
}

def load_leads(csv_path: str) -> List[Dict[str, Any]]:
    leads = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            leads.append(row)
    return leads

def personalize_campaign(lead: Dict[str, Any]) -> Dict[str, Any]:
    full_name = lead.get("contact", "").strip()
    first_name = full_name.split()[0] if full_name else "there"
    company_name = lead.get("company", "").strip()
    city = lead.get("city", "your area").strip()
    trade = lead.get("trade", "Commercial Contracting")
    subs_count = int(lead.get("estimated_subs", 25))
    
    # Financial estimate of potential audit penalty exposure ($850 avg per sub deficiency)
    estimated_penalty = subs_count * 850

    # Lead qualification score (Higher subs = higher ARR potential)
    tier = "Tier 1: High Priority ($199/mo Pro Target)" if subs_count >= 35 else "Tier 2: Core Growth ($99/mo Target)"

    steps = {}
    for step_key, tpl in TEMPLATES.items():
        subject = tpl["subject"].format(
            first_name=first_name,
            company_name=company_name,
            city=city,
            estimated_subs=subs_count,
            estimated_penalty=estimated_penalty
        )
        body = tpl["body"].format(
            first_name=first_name,
            company_name=company_name,
            city=city,
            estimated_subs=subs_count,
            estimated_penalty=estimated_penalty
        )
        steps[step_key] = {"subject": subject, "body": body}

    return {
        "lead_info": {
            "company": company_name,
            "contact": full_name,
            "title": lead.get("title", "Operations"),
            "email": lead.get("email"),
            "phone": lead.get("phone"),
            "city": city,
            "trade": trade,
            "estimated_subs": subs_count,
            "qualification_tier": tier,
            "estimated_penalty_exposure": f"${estimated_penalty:,}"
        },
        "sequence": steps
    }

def generate_markdown_preview(campaigns: List[Dict[str, Any]], output_path: str):
    with open(output_path, mode="w", encoding="utf-8") as f:
        f.write("# SubShield Outbound Cold Email Campaign Book\n\n")
        f.write(f"**Total Leads Prepared:** {len(campaigns)}\n")
        f.write("**Campaign Objective:** Secure 5–10 Free Compliance Audit commitments from commercial General Contractors.\n\n")
        f.write("---\n\n")

        for idx, camp in enumerate(campaigns, 1):
            lead = camp["lead_info"]
            seq = camp["sequence"]
            f.write(f"## {idx}. {lead['company']} ({lead['city']})\n\n")
            f.write(f"- **Target Contact:** {lead['contact']} — *{lead['title']}*\n")
            f.write(f"- **Email:** `{lead['email']}` | **Phone:** {lead['phone']}\n")
            f.write(f"- **Estimated Subcontractor Volume:** {lead['estimated_subs']} subcontractors\n")
            f.write(f"- **Audit Penalty Risk Exposure:** **{lead['estimated_penalty_exposure']}**\n")
            f.write(f"- **Qualification Status:** `{lead['qualification_tier']}`\n\n")

            f.write("### Sequence Step 1: The Audit Hook (Day 1)\n")
            f.write(f"**Subject:** `{seq['step_1_audit_hook']['subject']}`\n\n")
            f.write("```text\n")
            f.write(seq["step_1_audit_hook"]["body"])
            f.write("\n```\n\n")

            f.write("### Sequence Step 2: The 60-Second Video Bump (Day 4)\n")
            f.write(f"**Subject:** `{seq['step_2_video_bump']['subject']}`\n\n")
            f.write("```text\n")
            f.write(seq["step_2_video_bump"]["body"])
            f.write("\n```\n\n")

            f.write("### Sequence Step 3: The Audit Checklist Breakup (Day 8)\n")
            f.write(f"**Subject:** `{seq['step_3_breakup']['subject']}`\n\n")
            f.write("```text\n")
            f.write(seq["step_3_breakup"]["body"])
            f.write("\n```\n\n")
            f.write("---\n\n")

def main():
    parser = argparse.ArgumentParser(description="SubShield Outbound Campaign Dispatcher")
    parser.add_argument("--csv", default="sample_data/gc_leads_50.csv", help="Path to input leads CSV")
    parser.add_argument("--mode", choices=["preview", "send"], default="preview", help="Preview or live send mode")
    args = parser.parse_args()

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    csv_path = os.path.join(project_root, args.csv) if not os.path.isabs(args.csv) else args.csv

    if not os.path.exists(csv_path):
        print(f"[Error] Leads file not found at: {csv_path}")
        sys.exit(1)

    raw_leads = load_leads(csv_path)
    print(f"[Outreach] Loaded {len(raw_leads)} targeted leads from {csv_path}")

    campaigns = [personalize_campaign(lead) for lead in raw_leads]

    # Save structured JSON
    json_path = os.path.join(os.path.dirname(__file__), "campaign_payload.json")
    with open(json_path, mode="w", encoding="utf-8") as f:
        json.dump(campaigns, f, indent=2)

    # Save readable Markdown book
    md_path = os.path.join(os.path.dirname(__file__), "OUTREACH_CAMPAIGN_PREVIEW.md")
    generate_markdown_preview(campaigns, md_path)

    print(f"[Outreach] Successfully generated personalized 3-step sequences for {len(campaigns)} leads!")
    print(f"[Outreach] Preview campaign book saved to: {md_path}")
    print(f"[Outreach] Machine-readable campaign payload saved to: {json_path}")

    # Summary of Tiers
    tier1_count = sum(1 for c in campaigns if "Tier 1" in c["lead_info"]["qualification_tier"])
    tier2_count = sum(1 for c in campaigns if "Tier 2" in c["lead_info"]["qualification_tier"])
    print(f"[Outreach] Breakdown: {tier1_count} Tier-1 High Priority Accounts ($199/mo targets), {tier2_count} Tier-2 Accounts ($99/mo targets).")

if __name__ == "__main__":
    main()
