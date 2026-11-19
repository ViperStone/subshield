import sys
import os
import uuid
from datetime import date, timedelta, datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
import backend.app.models
from backend.app.models.organization import Organization, User, ComplianceRule
from backend.app.models.subcontractor import Subcontractor
from backend.app.models.certificate import Certificate
from backend.app.services.auth_service import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[Seed] Checking existing demo organization...")
    org = db.query(Organization).filter(Organization.slug == "apex-contractors-demo").first()
    if org:
        print("[Seed] Demo data already exists. Cleaning up old demo data...")
        db.delete(org)
        db.commit()

    # 1. Create Organization
    org = Organization(
        id=str(uuid.uuid4()),
        name="Apex General Contractors LLC",
        slug="apex-contractors-demo",
        subscription_status="active",
        subscription_plan="growth",
        subcontractor_limit=50
    )
    db.add(org)
    db.flush()

    # 2. Compliance Rules
    rules = ComplianceRule(
        organization_id=org.id,
        min_general_liability_occurrence=1000000.00,
        min_general_liability_aggregate=2000000.00,
        require_workers_comp=True,
        require_auto_liability=True,
        require_additional_insured=True,
        required_certificate_holder_text="Apex General Contractors LLC"
    )
    db.add(rules)

    # 3. Admin User
    user = User(
        organization_id=org.id,
        email="demo@apexcontracting.com",
        hashed_password=get_password_hash("demo1234"),
        full_name="Marcus Vance (Operations VP)",
        role="admin"
    )
    db.add(user)
    db.flush()

    today = date.today()

    # 4. Realistic Subcontractors
    subs_data = [
        {
            "name": "Vanguard Electrical Systems Inc.",
            "trade": "Electrical",
            "contact": "David Miller",
            "email": "dmiller@vanguardelectric.com",
            "phone": "(415) 882-9011",
            "status": "compliant",
            "gl_exp": today + timedelta(days=210),
            "wc_exp": today + timedelta(days=210),
            "gl_occ": 2000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": "All requirements satisfied."
        },
        {
            "name": "Keystone Mechanical & HVAC",
            "trade": "HVAC",
            "contact": "Elena Rostova",
            "email": "elena@keystonehvac.net",
            "phone": "(415) 349-1120",
            "status": "compliant",
            "gl_exp": today + timedelta(days=140),
            "wc_exp": today + timedelta(days=140),
            "gl_occ": 1000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": "All requirements satisfied."
        },
        {
            "name": "Precision Commercial Plumbing",
            "trade": "Plumbing",
            "contact": "Tom Henderson",
            "email": "thenderson@precisionplumb.com",
            "phone": "(510) 902-4412",
            "status": "expiring_soon",
            "gl_exp": today + timedelta(days=16), # Expiring in 16 days!
            "wc_exp": today + timedelta(days=16),
            "gl_occ": 1000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": f"Policy expires in 16 days ({today + timedelta(days=16)}). Renewal notification dispatched."
        },
        {
            "name": "Summit Structural Steel Erectors",
            "trade": "Structural Steel",
            "contact": "Frank Castillo",
            "email": "fcastillo@summitsteel.com",
            "phone": "(408) 771-3390",
            "status": "compliant",
            "gl_exp": today + timedelta(days=320),
            "wc_exp": today + timedelta(days=320),
            "gl_occ": 5000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": "All requirements satisfied. High limits."
        },
        {
            "name": "Titan Commercial Roofing LLC",
            "trade": "Roofing",
            "contact": "Brett Kowalski",
            "email": "bkowalski@titanroofing.com",
            "phone": "(925) 441-8890",
            "status": "expired",
            "gl_exp": today - timedelta(days=8), # Expired 8 days ago!
            "wc_exp": today - timedelta(days=8),
            "gl_occ": 1000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": f"POLICY EXPIRED on {today - timedelta(days=8)}. Jobsite work clearance REVOKED."
        },
        {
            "name": "Blue Ridge Masonry & Concrete",
            "trade": "Masonry",
            "contact": "Carlos Mendez",
            "email": "carlos@blueridgemasonry.com",
            "phone": "(415) 552-0941",
            "status": "compliant",
            "gl_exp": today + timedelta(days=95),
            "wc_exp": today + timedelta(days=95),
            "gl_occ": 1000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": "All requirements satisfied."
        },
        {
            "name": "Horizon Site Excavation & Grading",
            "trade": "Excavation",
            "contact": "Hank Sterling",
            "email": "hank@horizonexcavation.com",
            "phone": "(707) 819-3320",
            "status": "expired",
            "gl_exp": today - timedelta(days=3), # Expired 3 days ago!
            "wc_exp": today - timedelta(days=3),
            "gl_occ": 1000000.0,
            "addl_insr": False, # Also missing Additional Insured!
            "holder_match": False,
            "notes": f"EXPIRED on {today - timedelta(days=3)}. Missing Additional Insured endorsement."
        },
        {
            "name": "Coastal Drywall, Framing & Acoustic",
            "trade": "Drywall & Framing",
            "contact": "Sara Lin",
            "email": "slin@coastaldrywall.com",
            "phone": "(415) 762-1100",
            "status": "compliant",
            "gl_exp": today + timedelta(days=180),
            "wc_exp": today + timedelta(days=180),
            "gl_occ": 1000000.0,
            "addl_insr": True,
            "holder_match": True,
            "notes": "All requirements satisfied."
        },
        {
            "name": "Elite Fire Protection Systems",
            "trade": "Fire Sprinklers",
            "contact": "Arthur Pendelton",
            "email": "arthur@elitefireprotect.com",
            "phone": "(650) 443-1992",
            "status": "pending",
            "gl_exp": None,
            "wc_exp": None,
            "gl_occ": None,
            "addl_insr": False,
            "holder_match": False,
            "notes": "Magic link sent. Waiting for initial certificate upload."
        }
    ]

    for item in subs_data:
        sub = Subcontractor(
            organization_id=org.id,
            company_name=item["name"],
            trade_category=item["trade"],
            contact_name=item["contact"],
            contact_email=item["email"],
            contact_phone=item["phone"],
            magic_upload_token=str(uuid.uuid4()),
            status=item["status"]
        )
        db.add(sub)
        db.flush()

        if item["gl_exp"] is not None:
            cert = Certificate(
                subcontractor_id=sub.id,
                file_name=f"ACORD_25_{item['trade'].replace(' ', '_')}.pdf",
                file_url=f"/storage/mock_{sub.id}.pdf",
                is_current=True,
                gl_expiration_date=item["gl_exp"],
                wc_expiration_date=item["wc_exp"],
                auto_expiration_date=item["gl_exp"],
                gl_occurrence_limit=item["gl_occ"],
                gl_aggregate_limit=item["gl_occ"] * 2.0,
                workers_comp_statutory=True,
                additional_insured_verified=item["addl_insr"],
                certificate_holder_verified=item["holder_match"],
                is_compliant=item["status"] == "compliant",
                compliance_notes=item["notes"],
                raw_ai_json={
                    "insured_company_name": item["name"],
                    "gl_policy_number": f"POL-GL-{item['trade'][:3].upper()}-9912",
                    "insurer_name": "Travelers Casualty and Surety Company",
                    "gl_each_occurrence_limit": item["gl_occ"],
                    "gl_expiration_date": str(item["gl_exp"]),
                    "wc_expiration_date": str(item["wc_exp"]),
                    "additional_insured_checked": item["addl_insr"]
                }
            )
            db.add(cert)

    db.commit()
    db.close()
    print("[Seed] Successfully seeded Apex General Contractors with 9 realistic subcontractors!")
    print("[Seed] Demo Login: demo@apexcontracting.com / demo1234")

if __name__ == "__main__":
    seed()
