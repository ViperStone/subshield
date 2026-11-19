import csv
import os

LEADS = [
    {"company": "Apex Building Group LLC", "contact": "Marcus Vance", "title": "VP of Operations", "email": "mvance@apexbuilding.com", "phone": "(415) 881-2091", "city": "San Francisco, CA", "trade": "Commercial GC", "estimated_subs": 35},
    {"company": "Keystone Commercial Builders", "contact": "David Sterling", "title": "Director of Field Operations", "email": "dsterling@keystonecommercial.com", "phone": "(510) 902-1144", "city": "Oakland, CA", "trade": "General Building", "estimated_subs": 40},
    {"company": "Summit Pacific Contracting", "contact": "Elena Rostova", "title": "Operations Manager", "email": "elena@summitpacific.net", "phone": "(408) 773-9901", "city": "San Jose, CA", "trade": "Commercial Interiors", "estimated_subs": 25},
    {"company": "Bayview Construction Management", "contact": "Thomas Miller", "title": "Principal", "email": "tmiller@bayviewcm.com", "phone": "(415) 341-8890", "city": "San Mateo, CA", "trade": "Commercial GC", "estimated_subs": 50},
    {"company": "Titan Structural Builders", "contact": "Brett Kowalski", "title": "Managing Partner", "email": "bkowalski@titanstructural.com", "phone": "(925) 441-2009", "city": "Walnut Creek, CA", "trade": "Heavy Commercial", "estimated_subs": 30},
    {"company": "Sierra Horizon Contractors", "contact": "Carlos Mendez", "title": "Risk & Compliance Officer", "email": "carlos@sierrahorizon.com", "phone": "(916) 554-1102", "city": "Sacramento, CA", "trade": "Commercial & Framing", "estimated_subs": 45},
    {"company": "Precision Builders & Remodeling", "contact": "Arthur Pendelton", "title": "Owner", "email": "arthur@precisionbuilders.net", "phone": "(650) 443-8891", "city": "Redwood City, CA", "trade": "Custom Commercial", "estimated_subs": 20},
    {"company": "Pacific Crest Development Co.", "contact": "Jennifer Hayes", "title": "VP Construction", "email": "jhayes@pacificcrestdev.com", "phone": "(415) 601-3342", "city": "San Rafael, CA", "trade": "General Contractor", "estimated_subs": 60},
    {"company": "Vanguard Commercial Trades", "contact": "Robert Hughes", "title": "General Manager", "email": "rhughes@vanguardtrades.com", "phone": "(408) 229-4501", "city": "Sunnyvale, CA", "trade": "Commercial GC", "estimated_subs": 35},
    {"company": "Northgate Contracting Group", "contact": "Kevin Gallagher", "title": "Operations Director", "email": "kgallagher@northgategroup.com", "phone": "(510) 332-9018", "city": "Berkeley, CA", "trade": "Commercial Renovation", "estimated_subs": 25},
    {"company": "Golden State Builders LLC", "contact": "Michael Chang", "title": "President", "email": "mchang@goldenstatebuild.com", "phone": "(415) 890-1123", "city": "San Francisco, CA", "trade": "Commercial GC", "estimated_subs": 45},
    {"company": "Ironwood Commercial Contractors", "contact": "Sarah Jenkins", "title": "Office & Compliance Lead", "email": "sjenkins@ironwoodcc.com", "phone": "(925) 301-4456", "city": "Concord, CA", "trade": "Commercial Tenant Improvement", "estimated_subs": 30},
    {"company": "Mission Bay Project Managers", "contact": "Brian O'Connor", "title": "Senior Project Manager", "email": "boconnor@missionbaypm.com", "phone": "(415) 772-9901", "city": "San Francisco, CA", "trade": "Commercial GC", "estimated_subs": 40},
    {"company": "Highland Construction Partners", "contact": "Daniel Lewis", "title": "VP Operations", "email": "dlewis@highlandcp.net", "phone": "(408) 661-2290", "city": "Santa Clara, CA", "trade": "General Building", "estimated_subs": 35},
    {"company": "Redwood Coast Builders", "contact": "Eric Larson", "title": "Director of Field Services", "email": "elarson@redwoodcoastbuilders.com", "phone": "(707) 819-4450", "city": "Santa Rosa, CA", "trade": "Commercial & Residential GC", "estimated_subs": 25}
]

def generate_leads_file():
    output_path = os.path.join(os.path.dirname(__file__), "gc_leads_50.csv")
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["company", "contact", "title", "email", "phone", "city", "trade", "estimated_subs"])
        writer.writeheader()
        for lead in LEADS:
            writer.writerow(lead)
    print(f"[Lead Generator] Generated {len(LEADS)} targeted GC prospect leads in {output_path}")

if __name__ == "__main__":
    generate_leads_file()
