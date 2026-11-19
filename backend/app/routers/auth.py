import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.organization import Organization, User, ComplianceRule
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # 1. Check if user email already exists
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # 2. Create Organization
    slug = payload.company_name.lower().replace(" ", "-").replace(".", "")[:40] + "-" + str(uuid.uuid4())[:6]
    org = Organization(
        name=payload.company_name,
        slug=slug,
        subscription_status="trialing",
        subscription_plan="growth",
        subcontractor_limit=50
    )
    db.add(org)
    db.flush()

    # 3. Create Default Compliance Rules for the Organization
    rules = ComplianceRule(
        organization_id=org.id,
        min_general_liability_occurrence=1000000.00,
        min_general_liability_aggregate=2000000.00,
        require_workers_comp=True,
        require_auto_liability=True,
        require_additional_insured=True,
        required_certificate_holder_text=payload.company_name
    )
    db.add(rules)

    # 4. Create Admin User
    hashed_pw = get_password_hash(payload.password)
    user = User(
        organization_id=org.id,
        email=payload.email.lower(),
        hashed_password=hashed_pw,
        full_name=payload.full_name or payload.company_name,
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 5. Generate JWT Token
    token = create_access_token(data={"sub": user.id, "org_id": org.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        organization_id=org.id,
        email=user.email,
        company_name=org.name
    )

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": user.id, "org_id": user.organization_id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        company_name=user.organization.name
    )

@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """
    Instant 1-click login for quick demo and testing without filling out registration.
    """
    demo_email = "demo@apexcontracting.com"
    user = db.query(User).filter(User.email == demo_email).first()

    if not user:
        # Auto-create demo org
        org = Organization(
            name="Apex General Contractors LLC",
            slug="apex-contractors-demo",
            subscription_status="active",
            subscription_plan="growth",
            subcontractor_limit=50
        )
        db.add(org)
        db.flush()

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

        user = User(
            organization_id=org.id,
            email=demo_email,
            hashed_password=get_password_hash("demo1234"),
            full_name="Marcus Vance (Operations VP)",
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.id, "org_id": user.organization_id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        company_name=user.organization.name
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return user
