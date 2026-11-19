import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Numeric, Text, Date, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subcontractor_id = Column(String(36), ForeignKey("subcontractors.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    is_current = Column(Boolean, default=True)

    # Extracted Policy Expiration Dates
    gl_expiration_date = Column(Date, nullable=True)
    wc_expiration_date = Column(Date, nullable=True)
    auto_expiration_date = Column(Date, nullable=True)

    # Extracted Limits
    gl_occurrence_limit = Column(Numeric(12, 2), nullable=True)
    gl_aggregate_limit = Column(Numeric(12, 2), nullable=True)
    workers_comp_statutory = Column(Boolean, default=True)

    # Verification / Compliance Outcomes
    additional_insured_verified = Column(Boolean, default=False)
    certificate_holder_verified = Column(Boolean, default=False)
    is_compliant = Column(Boolean, default=False)
    compliance_notes = Column(Text, nullable=True)
    raw_ai_json = Column(JSON, nullable=True)

    processed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    subcontractor = relationship("Subcontractor", back_populates="certificates")

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subcontractor_id = Column(String(36), ForeignKey("subcontractors.id", ondelete="CASCADE"), nullable=False)
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(50), nullable=True)
    notification_type = Column(String(50), nullable=False) # 30_day, 14_day, expired_alert, custom
    status = Column(String(50), default="sent")
    sent_at = Column(DateTime, default=datetime.utcnow)

    subcontractor = relationship("Subcontractor", back_populates="notifications")
