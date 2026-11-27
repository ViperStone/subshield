import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SubShield API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database: SQLite fallback for instant zero-dependency local dev, PostgreSQL for production
    DATABASE_URL: str = "sqlite:///./subshield.db"
    
    # Security & Auth
    JWT_SECRET: str = "subshield_super_secure_secret_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # AI Integration
    OPENAI_API_KEY: Optional[str] = None
    
    # External Services & Payments
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://subshield-virid.vercel.app")
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_STARTER: str = "price_starter_49"
    STRIPE_PRICE_GROWTH: str = "price_growth_99"
    STRIPE_PRICE_PRO: str = "price_pro_199"
    STRIPE_RESTRICT_VISA_ONLY: bool = True
    
    # Admin Dashboard
    ADMIN_EMAIL: str = "amadouourydiallo596@gmail.com"
    
    RESEND_API_KEY: Optional[str] = None
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
