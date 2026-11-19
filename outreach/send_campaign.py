import os
import sys
import json
import time

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.config import settings

def send_campaign():
    campaign_file = os.path.join(os.path.dirname(__file__), "campaign_payload.json")
    if not os.path.exists(campaign_file):
        print("[Error] campaign_payload.json not found. Run campaign_dispatcher.py first.")
        return

    with open(campaign_file, mode="r", encoding="utf-8") as f:
        campaigns = json.load(f)

    print(f"============================================================")
    print(f"  SubShield Outbound Campaign Dispatcher (Day 1 Execution)  ")
    print(f"============================================================")
    print(f"Total Leads Ready to Contact: {len(campaigns)}")
    
    resend_key = os.getenv("RESEND_API_KEY") or settings.RESEND_API_KEY

    if not resend_key:
        print("\n[Notice] RESEND_API_KEY is not configured in .env or environment.")
        print("[Notice] Running in DRY-RUN / SIMULATION MODE.")
        print("To send live emails, add RESEND_API_KEY=re_... in backend/.env\n")

    sent_count = 0
    for idx, c in enumerate(campaigns, 1):
        lead = c["lead_info"]
        step1 = c["sequence"]["step_1_audit_hook"]

        print(f"[{idx}/{len(campaigns)}] Preparing email to: {lead['contact']} ({lead['email']}) at {lead['company']}...")
        print(f"       Subject: {step1['subject']}")
        print(f"       Target Tier: {lead['qualification_tier']}")

        if resend_key:
            try:
                import httpx
                response = httpx.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "Founder <founder@subshield.io>",
                        "to": [lead["email"]],
                        "subject": step1["subject"],
                        "text": step1["body"]
                    },
                    timeout=10.0
                )
                if response.status_code in (200, 201):
                    print("       Status: [SENT VIA RESEND]")
                    sent_count += 1
                else:
                    print(f"       Status: [RESEND ERROR: {response.text}]")
            except Exception as e:
                print(f"       Status: [FAILED: {e}]")
        else:
            print("       Status: [SIMULATED DISPATCH OK]")
            sent_count += 1

        # Small delay between messages to emulate realistic deliverability rate limiting
        time.sleep(0.2)

    print(f"\nDispatched {sent_count} outreach sequences successfully!")
    print("Next step: Monitor incoming replies for Free Compliance Audit requests.")

if __name__ == "__main__":
    send_campaign()
