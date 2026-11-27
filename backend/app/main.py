"""
SubShield Backend – Production-Ready Application Entry Point

Supports two import modes:
  - Docker/production: `gunicorn app.main:app` (from /app working dir)
  - Local dev: `uvicorn backend.app.main:app` (from project root)
"""
import os
import sys

# Auto-detect import context: if running from Docker (/app), add /app to path
# so both `from app.xxx` and `from backend.app.xxx` work.
_this_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_this_dir)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # ensures all models are imported
from app.routers import auth, subcontractors, public, analytics, billing, admin

# Automatically create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automated Subcontractor Insurance (ACORD 25) Compliance Autopilot API"
)

# CORS Middleware — production-safe
allowed_origins = ["http://localhost:3000"]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)
if settings.ENVIRONMENT == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(subcontractors.router)
app.include_router(public.router)
app.include_router(analytics.router)
app.include_router(billing.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
