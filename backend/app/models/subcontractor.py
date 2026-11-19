import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Subcontractor(Base):
    __tablename__ = "subcontractors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    trade_category = Column(String(100), default="General Trade") # Electrical, Plumbing, HVAC, Roofing, Framing, etc.
    contact_name = Column(String(150), nullable=True)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    magic_upload_token = Column(String(64), unique=True, default=lambda: str(uuid.uuid4()), index=True)
    status = Column(String(50), default="pending") # compliant, expiring_soon, expired, pending
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="subcontractors")
    certificates = relationship("Certificate", back_populates="subcontractor", cascade="all, delete-orphan", order_by="desc(Certificate.created_at)")
    notifications = relationship("NotificationLog", back_populates="subcontractor", cascade="all, delete-orphan")
