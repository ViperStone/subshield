# SubShield MVP 1-Click Development Runner
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SubShield MVP - Automated Insurance Compliance Autopilot  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$PythonExe = "C:\Users\HP\AppData\Local\Python\envs\subshield\Scripts\python.exe"
$ProjectRoot = "C:\Users\HP\.gemini\antigravity\scratch\subshield"

# 1. Run database seeder if DB does not exist
if (-not (Test-Path "backend\subshield.db")) {
    Write-Host "[1/3] Initializing SQLite database with realistic seed data..." -ForegroundColor Yellow
    & $PythonExe sample_data\seed_demo.py
} else {
    Write-Host "[1/3] Database found." -ForegroundColor Green
}

# 2. Start FastAPI Backend in background job
# PYTHONPATH points to backend/ so `from app.xxx` resolves correctly
Write-Host "[2/3] Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Yellow
$BackendJob = Start-Job -ScriptBlock {
    param($py, $root)
    $env:PYTHONPATH = "$root\backend"
    Set-Location -Path $root
    & $py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir "$root\backend"
} -ArgumentList $PythonExe, $ProjectRoot

Start-Sleep -Seconds 3

# 3. Start Next.js Frontend
Write-Host "[3/3] Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  Landing Page:   http://localhost:3000" -ForegroundColor Green
Write-Host "  GC Dashboard:   http://localhost:3000/dashboard" -ForegroundColor Green
Write-Host "  FastAPI Docs:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Demo Sign In:   demo@apexcontracting.com / demo1234" -ForegroundColor Green
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Gray

try {
    Set-Location -Path "$ProjectRoot\frontend"
    npm run dev
} finally {
    Write-Host "Shutting down backend process..." -ForegroundColor Yellow
    Stop-Job $BackendJob -ErrorAction SilentlyContinue
    Remove-Job $BackendJob -ErrorAction SilentlyContinue
}
