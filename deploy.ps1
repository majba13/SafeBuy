#!/usr/bin/env powershell
<#
SafeBuy Deployment Script — Push to GitHub & Deploy to Vercel
Requires: Git CLI, GitHub CLI (gh), Vercel CLI

Prerequisites:
1. GitHub CLI: https://cli.github.com/ (authenticates via browser)
2. Vercel CLI: npm install -g vercel
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeBuy Multi-Platform Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ProjectRoot = "d:\VS code\SafeBuy"
$FrontendRoot = "$ProjectRoot\Frontend"
$BackendRoot = "$ProjectRoot\Backend"

# ─── Step 1: Verify Git Status ─────────────────────────────────────────────────
Write-Host "`n[1/5] Checking Git Status..." -ForegroundColor Yellow
Set-Location $ProjectRoot
$GitStatus = git status --short
if ($GitStatus) {
    Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    Write-Host $GitStatus
    Write-Host "`nRunning: git add . && git commit -m 'Deploy prep'" -ForegroundColor Cyan
    git add .
    git commit -m "Deploy prep: $(Get-Date -Format 'yyyy-MM-dd HHmm')"
} else {
    Write-Host "✓ Working directory clean" -ForegroundColor Green
}

# ─── Step 2: Push to GitHub ─────────────────────────────────────────────────────
Write-Host "`n[2/5] Pushing to GitHub (main branch)..." -ForegroundColor Yellow

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  GitHub CLI (gh) not found. Install from https://cli.github.com/" -ForegroundColor Red
    Write-Host "Using git push instead..." -ForegroundColor Yellow
    git push -u origin main
} else {
    gh auth status
    git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Pushed to GitHub: https://github.com/majba13/SafeBuy" -ForegroundColor Green
} else {
    Write-Host "✗ GitHub push failed" -ForegroundColor Red
    exit 1
}

# ─── Step 3: Deploy Frontend to Vercel ──────────────────────────────────────────
Write-Host "`n[3/5] Deploying Frontend to Vercel..." -ForegroundColor Yellow

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Vercel CLI not installed. Run: npm install -g vercel" -ForegroundColor Red
    Write-Host "Then run: vercel --prod from Frontend/" -ForegroundColor Yellow
    exit 1
}

Set-Location $FrontendRoot
Write-Host "Frontend root: $FrontendRoot" -ForegroundColor Cyan

# First-time setup: link to Vercel project
if (-not (Test-Path ".vercel")) {
    Write-Host "Linking to Vercel project..." -ForegroundColor Cyan
    vercel link
}

# Production deploy
Write-Host "Deploying to production..." -ForegroundColor Cyan
$VercelOutput = vercel --prod 2>&1
Write-Host $VercelOutput

if ($VercelOutput -match "https://safebuy") {
    $DeployUrl = ($VercelOutput | Select-String "https://safebuy[^']+" | Select-Object -First 1).Matches[0].Value
    Write-Host "✓ Frontend deployed: $DeployUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  Check Vercel dashboard for deployment status" -ForegroundColor Yellow
}

# ─── Step 4: Backend Deployment Instructions ────────────────────────────────────
Write-Host "`n[4/5] Backend Deployment Instructions" -ForegroundColor Yellow
Write-Host @"
Backend can be deployed to:
  • Railway (quickest): https://railway.app/
  • Render: https://render.com/
  • VPS (DigitalOcean/AWS): use process manager like PM2

For Railway (recommended):
  1. Connect your GitHub repo in Railway dashboard
  2. Create a Node.js service → select SafeBuy repo
  3. Set environment variables (see DEPLOYMENT_GUIDE.md)
  4. Railway auto-deploys on git push to main

For Render:
  1. https://dashboard.render.com/ → New → Web Service
  2. Connect GitHub repo
  3. Build command: npm install && npm run build (in Backend/)
  4. Start command: npm run start:prod
  5. Set environment variables
"@

# ─── Step 5: Post-Deployment Checklist ──────────────────────────────────────────
Write-Host "`n[5/5] Post-Deployment Checklist" -ForegroundColor Yellow
Write-Host @"
✓ GitHub Repository
  → https://github.com/majba13/SafeBuy

✓ Frontend (Vercel)
  → Visit your deployment URL
  → Verify API connection in browser console

✓ Environment Variables
  → Set NEXT_PUBLIC_API_URL in Vercel dashboard
  → Set NEXT_PUBLIC_SOCKET_URL for real-time features

✓ Backend
  → Deploy Backend to Railway/Render
  → MongoDB: Atlas cluster with connection string
  → Redis: Upstash serverless Redis

✓ Mobile (optional)
  → Run: cd Mobile && eas build --platform all
  → Deploy to Play Store / App Store

✓ Monitoring
  → Add GitHub Actions CI/CD (.github/workflows/deploy.yml)
  → Set up UptimeRobot for health checks
  → Monitor Vercel & backend logs

See DEPLOYMENT_GUIDE.md for full instructions.
"@

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
