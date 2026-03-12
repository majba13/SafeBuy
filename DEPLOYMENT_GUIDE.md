# SafeBuy Deployment Guide

## Quick Start — Local Testing Before Deploy

```bash
# Backend
cd Backend
npm install
cp .env.example .env
# Edit .env with local MongoDB/Redis
npm run start:dev

# Frontend (in another terminal)
cd Frontend
npm install
npm run dev  # http://localhost:3000

# Mobile (in another terminal)
cd Mobile
npm install
npm start    # press 'w' for web, 's' to start Expo
```

---

## Multi-Platform Deployment

### 1. GitHub Repository Setup

```bash
# Already done! Check status
cd "d:\VS code\SafeBuy"
git status
git log --oneline -5

# Push to GitHub
git push -u origin main
# 🔐 May need to authenticate via GitHub CLI or SSH key
```

**Authentication Options:**

**Option A: GitHub CLI (recommended)**
```bash
# Install: https://cli.github.com/
gh auth login
# Follow browser prompt to authorize
git push -u origin main
```

**Option B: SSH Key**
```bash
# Generate SSH key (if not already done)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add public key to GitHub → Settings → SSH and GPG keys
cat ~/.ssh/id_ed25519.pub

# Use SSH remote instead
git remote set-url origin git@github.com:majba13/SafeBuy.git
git push -u origin main
```

**Option C: Personal Access Token**
```bash
# Create token in GitHub → Settings → Developer settings → Personal access tokens (classic)
# Scope: repo, workflow, write:packages

git push -u origin main
# When prompted: Username = your-github-username, Password = <personal-access-token>
```

---

### 2. Frontend Deployment (Vercel) ⚡

#### Prerequisites
```bash
npm install -g vercel
```

#### Deploy (Interactive)

```bash
cd "d:\VS code\SafeBuy\Frontend"

# First time only
vercel login
vercel link  # Select "Create a new project"

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

#### Vercel Environment Variables

After deployment, set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `https://api.safebuy.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Backend WebSocket URL | `wss://api.safebuy.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth ID | (from Google Cloud Console) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | (from Cloudinary dashboard) |

**To get Google OAuth credentials:**
1. Go to https://console.cloud.google.com
2. Create a new project: "SafeBuy"
3. APIs & Services → OAuth consent screen → External
4. Add app name: "SafeBuy"
5. Create OAuth 2.0 credential (Web application)
6. Authorized redirect URIs: `https://safebuy.vercel.app/api/auth/callback/google`
7. Copy **Client ID** to Vercel

**Vercel Dashboard Custom Domain:**
- Go to **Project → Domains**
- Add `safebuy.com` and `www.safebuy.com`
- Update domain registrar with CNAME records shown in Vercel

---

### 3. Backend Deployment

#### Option A: Railway.app (Quickest 🚀)

1. Go to https://railway.app/
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repository
4. Select `majba13/SafeBuy` repo
5. Select `Backend` folder as root
6. Railway auto-detects Node.js + runs `npm run build` then `npm run start`

**Set Environment Variables in Railway Dashboard:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/safebuy
REDIS_URL=rediss://:<pass>@<host>.upstash.io:6379
JWT_ACCESS_SECRET=<64-char hex string>
JWT_REFRESH_SECRET=<64-char hex string>
# ... see .env.example for all required vars
```

**Get Railway deployment URL:**
- Copy from Railway Dashboard → Domain
- Update Frontend `NEXT_PUBLIC_API_URL` with this URL

#### Option B: Render.com

1. Go to https://dashboard.render.com/
2. **New → Web Service**
3. Connect GitHub → select SafeBuy repo
4. Configure:
   - **Name:** safebuy-backend
   - **Root Directory:** Backend
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Starter ($7/month includes free tier upgrade)
5. Set all environment variables in Render dashboard
6. Deploy

#### Option C: Self-Hosted VPS (DigitalOcean / AWS EC2)

See the VPS section in **DEPLOYMENT_GUIDE_ADVANCED.md** (coming soon).

---

### 4. Mobile App Deployment (Optional)

**Prerequisites:**
```bash
npm install -g eas-cli
cd Mobile
eas login  # Expo account required
```

**Build for Android:**
```bash
eas build --platform android --profile production
# EAS will build remotely; APK/AAB ready for Google Play
eas submit --platform android
```

**Build for iOS:**
```bash
# Requires Apple Developer account + provisioning profile
eas build --platform ios --profile production
eas submit --platform ios
```

See [Expo EAS documentation](https://docs.expo.dev/deploy/submit-to-app-stores/) for detailed steps.

---

## Environment Variable Reference

### Frontend (`.env.local`, committed as `.env.example`)

```env
NEXT_PUBLIC_API_URL=https://api.safebuy.com
NEXT_PUBLIC_SOCKET_URL=wss://api.safebuy.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-id>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
```

### Backend (`.env`, **NEVER commit**)

```env
# Core
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://safebuy.com

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/safebuy

# Cache & Queues
REDIS_URL=rediss://:<pass>@<host>.upstash.io:6379

# JWT (generate: openssl rand -hex 32)
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>

# Image CDN
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# OAuth
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notifications
FIREBASE_PROJECT_ID=<id>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<email>

# AI
GEMINI_API_KEY=<key>
HUGGINGFACE_API_KEY=<key>

# Courier APIs
PATHAO_CLIENT_ID=<id>
PATHAO_PASSWORD=<pass>
STEADFAST_API_KEY=<key>
# ... etc
```

---

## Monitoring & Health Checks

### Add Uptime Monitoring

1. **UptimeRobot** (free): https://uptimerobot.com/
   - Create monitor: `https://api.safebuy.com/health`
   - Alerts → Email when down

2. **Better Uptime** (free): https://betterstack.com/
   - Better integrations with Slack/Discord

### View Logs

**Vercel Frontend:**
- Dashboard → Deployments → select deployment → Logs

**Railway Backend:**
- Dashboard → project → go to service → Logs tab

**Render Backend:**
- Dashboard → select service → Logs

---

## Troubleshooting

### "Frontend can't reach Backend"

**Check:**
1. Backend API is running (visit `https://api.safebuy.com/api-docs`)
2. Frontend `NEXT_PUBLIC_API_URL` is set correctly in Vercel
3. Backend `FRONTEND_URL` env var includes the Vercel domain
4. CORS is enabled in backend (`main.ts`)

**Fix:**
```ts
// main.ts
app.enableCors({
  origin: ['https://safebuy.vercel.app', 'https://safebuy.com'],
  credentials: true,
});
```

### "MongoDB connection timeout"

**Check:**
1. MongoDB Atlas network access: Security → Network Access → `0.0.0.0/0` allowed
2. Connection string is correct (copy from Atlas → Connect → Drivers)
3. Database user exists with correct password (no special chars without encoding)

**Fix:**
```bash
# Test connection
mongosh "mongodb+srv://<user>:<pass>@cluster.mongodb.net/safebuy"
```

### "Redis connection refused"

**Check:**
1. Upstash Redis is active (no paused databases)
2. `REDIS_URL` is in correct format: `rediss://:<password>@<host>:6379`
3. VPN/firewall not blocking

**Fix:**
```bash
# Test connection
redis-cli -u rediss://:<pass>@<host>.upstash.io:6379 PING
```

---

## Performance Tips

### Frontend (Vercel)
- ✓ ISR enabled (10 min revalidation on product pages)
- ✓ Images auto-optimized to WebP/AVIF via Cloudinary
- ✓ Bundle size: ~200KB gzipped (check `vercel build` output)

### Backend (Railway/Render)
- ✓ Horizontal scaling: PM2 cluster mode (2+ instances)
- ✓ Database indexes for fast queries (run once)
- ✓ Redis for sessions/caching (Bull job queue)

### Database (MongoDB Atlas)
- ✓ M10+ cluster recommended for production
- ✓ Enable compression, backups, monitoring
- ✓ Create search indexes for AI recommendations

---

## Security Checklist

- [ ] JWT secrets are 64+ char random strings (use `openssl rand -hex 32`)
- [ ] `.env` file is in `.gitignore` (NEVER commit secrets)
- [ ] CORS origin whitelist is restrictive
- [ ] Rate limiting enabled (default: 200 req/15min)
- [ ] Helmet security headers enabled
- [ ] HTTPS enforced (Vercel/Railway auto-setup)
- [ ] MongoDB password is URL-encoded (spaces → `%20`)
- [ ] Google OAuth redirect URI matches exactly
- [ ] Stripe webhook secret is stored securely
- [ ] Firebase private key is properly escaped in env var

---

## Next Steps

1. ✓ Push to GitHub (complete)
2. ✓ Deploy Frontend to Vercel (follow steps above)
3. ⏳ Deploy Backend to Railway/Render
4. ⏳ Configure MongoDB Atlas & Upstash Redis
5. ⏳ Set up GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
6. ⏳ Add domain to Vercel
7. ⏳ Monitor with UptimeRobot/Better Uptime

---

## Still Need Help?

- Vercel Docs: https://vercel.com/docs
- NestJS Deployment: https://docs.nestjs.com/deployment
- Railway Docs: https://docs.railway.app/
- Next.js Deployment: https://nextjs.org/docs/deployment
