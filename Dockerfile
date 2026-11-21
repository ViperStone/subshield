# ---- SubShield Backend · Root Production Dockerfile ----
# Enables 1-click zero-config deployment on Render & Railway
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install OS dependencies for PostgreSQL driver
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir psycopg2-binary gunicorn

# Copy backend application source
COPY backend/app ./app

# Expose port (Render sets $PORT env var dynamically, defaults to 8000)
EXPOSE 8000
ENV PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Launch Gunicorn with Uvicorn worker
CMD gunicorn app.main:app \
     --worker-class uvicorn.workers.UvicornWorker \
     --bind 0.0.0.0:${PORT:-8000} \
     --workers 2 \
     --timeout 120 \
     --access-logfile -
