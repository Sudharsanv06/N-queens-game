# 🔐 PRODUCTION ENVIRONMENT VARIABLES

## Complete Environment Configuration Guide

This document contains ALL environment variables needed for production deployment of the N-Queens Game.

---

## 📋 BACKEND ENVIRONMENT VARIABLES

### File: `server/.env.production`

```env
# ============================================
# SERVER CONFIGURATION
# ============================================

# Environment
NODE_ENV=production

# Server Port
PORT=5000

# Application Version
APP_VERSION=1.0.0

# ============================================
# DATABASE CONFIGURATION
# ============================================

# MongoDB Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?options
MONGO_URI=mongodb+srv://nqueens-admin:YOUR_PASSWORD_HERE@nqueens-production.xxxxx.mongodb.net/nqueens?retryWrites=true&w=majority

# Database Options (Optional - defaults are good)
# MONGO_MAX_POOL_SIZE=10
# MONGO_SERVER_SELECTION_TIMEOUT=5000
# MONGO_SOCKET_TIMEOUT=45000

# ============================================
# JWT AUTHENTICATION
# ============================================

# JWT Secret (MUST BE 64+ random characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=YOUR_64_CHAR_RANDOM_STRING_HERE_GENERATE_WITH_CRYPTO

# JWT Expiration Time
JWT_EXPIRES_IN=7d

# Refresh Token Expiration (Optional)
# JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# CORS & FRONTEND
# ============================================

# Frontend URL(s) - Comma separated for multiple origins
# Update after frontend deployment
CLIENT_ORIGIN=https://your-frontend-url.vercel.app,https://your-custom-domain.com

# Development Origin (Optional - for testing)
# CLIENT_ORIGIN_DEV=http://localhost:5173

# ============================================
# RATE LIMITING
# ============================================

# Rate limit window in minutes
RATE_LIMIT_WINDOW=15

# Max requests per window per IP
RATE_LIMIT_MAX=100

# Strict rate limiting for auth endpoints (Optional)
# AUTH_RATE_LIMIT_WINDOW=15
# AUTH_RATE_LIMIT_MAX=5

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================

# Email Service Provider
EMAIL_SERVICE=gmail

# Email Account
EMAIL_USER=your-noreply-email@gmail.com

# Email Password / App Password
EMAIL_PASSWORD=your-app-specific-password

# Email From Name
EMAIL_FROM_NAME=N-Queens Game

# Email From Address
EMAIL_FROM=noreply@nqueensgame.com

# ============================================
# PUSH NOTIFICATIONS (Optional)
# ============================================

# VAPID Keys for Web Push
# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY
VAPID_MAILTO=mailto:admin@nqueensgame.com

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================

# Socket.IO Ping Timeout (milliseconds)
SOCKET_PING_TIMEOUT=60000

# Socket.IO Ping Interval (milliseconds)
SOCKET_PING_INTERVAL=25000

# ============================================
# LOGGING & MONITORING (Optional)
# ============================================

# Log Level (error, warn, info, debug)
LOG_LEVEL=info

# Sentry DSN for error tracking
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ============================================
# SECURITY (Optional - Recommended)
# ============================================

# Enable HTTPS enforcement
HTTPS_ONLY=true

# Trust proxy for correct IP detection
TRUST_PROXY=true

# Session Secret (if using sessions)
# SESSION_SECRET=another-64-char-random-string

# ============================================
# PERFORMANCE (Optional)
# ============================================

# Enable compression
ENABLE_COMPRESSION=true

# Cache leaderboard for N seconds
LEADERBOARD_CACHE_TTL=300

# Max upload size (in MB)
MAX_UPLOAD_SIZE=10

# ============================================
# FEATURE FLAGS (Optional)
# ============================================

# Enable multiplayer features
ENABLE_MULTIPLAYER=true

# Enable daily challenges
ENABLE_DAILY_CHALLENGES=true

# Enable achievements
ENABLE_ACHIEVEMENTS=true

# Enable tournaments
ENABLE_TOURNAMENTS=true

# Enable social features
ENABLE_SOCIAL=true

# ============================================
# THIRD-PARTY SERVICES (Optional)
# ============================================

# Google Analytics Measurement ID
# GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Configuration (if using)
# FIREBASE_API_KEY=your-firebase-api-key
# FIREBASE_PROJECT_ID=your-project-id

# Redis URL (if using caching)
# REDIS_URL=redis://localhost:6379

```

---

## 🎨 FRONTEND ENVIRONMENT VARIABLES

### File: `client/.env.production`

```env
# ============================================
# API CONFIGURATION
# ============================================

# Backend API URL
# Update after backend deployment
VITE_API_URL=https://your-backend-url.onrender.com

# WebSocket URL
# Update after backend deployment (use wss:// for production)
VITE_WS_URL=wss://your-backend-url.onrender.com

# API Timeout (milliseconds)
VITE_API_TIMEOUT=30000

# ============================================
# ENVIRONMENT
# ============================================

# Environment Name
VITE_NODE_ENV=production

# Application Version
VITE_APP_VERSION=1.0.0

# Application Name
VITE_APP_NAME=N-Queens Game

# ============================================
# ANALYTICS (Optional)
# ============================================

# Google Analytics Tracking ID
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Google Tag Manager ID
# VITE_GTM_ID=GTM-XXXXXXX

# Mixpanel Token
# VITE_MIXPANEL_TOKEN=your-mixpanel-token

# ============================================
# FEATURE FLAGS
# ============================================

# Enable multiplayer features
VITE_ENABLE_MULTIPLAYER=true

# Enable social features
VITE_ENABLE_SOCIAL=true

# Enable tournaments
VITE_ENABLE_TOURNAMENTS=true

# Enable achievements
VITE_ENABLE_ACHIEVEMENTS=true

# Enable daily challenges
VITE_ENABLE_DAILY_CHALLENGES=true

# Enable puzzles
VITE_ENABLE_PUZZLES=true

# Enable offline mode
VITE_ENABLE_OFFLINE=true

# ============================================
# PUSH NOTIFICATIONS (Optional)
# ============================================

# VAPID Public Key (from backend)
VITE_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY

# ============================================
# ERROR TRACKING (Optional)
# ============================================

# Sentry DSN
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Sentry Environment
VITE_SENTRY_ENVIRONMENT=production

# ============================================
# SOCIAL AUTH (Optional - if implemented)
# ============================================

# Google OAuth Client ID
# VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Facebook App ID
# VITE_FACEBOOK_APP_ID=your-facebook-app-id

# ============================================
# BRANDING & META
# ============================================

# Application URL
VITE_APP_URL=https://your-frontend-url.vercel.app

# Support Email
VITE_SUPPORT_EMAIL=support@nqueensgame.com

# Social Media Links
VITE_TWITTER_URL=https://twitter.com/nqueensgame
VITE_GITHUB_URL=https://github.com/yourusername/n-queens-game

# ============================================
# CAPACITOR / MOBILE (Optional)
# ============================================

# Capacitor App ID
VITE_CAPACITOR_APP_ID=com.nqueensgame.app

# Capacitor App Name
VITE_CAPACITOR_APP_NAME=N-Queens Game

# ============================================
# PERFORMANCE (Optional)
# ============================================

# Enable service worker
VITE_ENABLE_SW=true

# Enable PWA features
VITE_ENABLE_PWA=true

# Lazy loading delay (ms)
VITE_LAZY_LOAD_DELAY=200

```

---

## 🔑 HOW TO GENERATE SECRETS

### 1. JWT Secret (64+ characters)

```bash
# Using Node.js crypto (Recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
```

### 2. VAPID Keys (for push notifications)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys

# Example output:
# Public Key: BFxN...
# Private Key: kLm...
```

### 3. Session Secret (if using sessions)

```bash
# Same as JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📝 SETUP INSTRUCTIONS

### Backend (.env)

1. **Copy example file:**
   ```bash
   cd server
   cp .env.example .env.production
   ```

2. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Get MongoDB URI:**
   - Login to MongoDB Atlas
   - Create cluster
   - Get connection string
   - Replace `<password>` and `<dbname>`

4. **Update CLIENT_ORIGIN:**
   - Deploy frontend first
   - Get frontend URL
   - Update CLIENT_ORIGIN

5. **Set environment variables in hosting platform:**
   - Render: Environment → Add Environment Variable
   - Heroku: `heroku config:set KEY=VALUE`
   - Railway: Settings → Variables

### Frontend (.env)

1. **Copy example file:**
   ```bash
   cd client
   cp .env.example .env.production
   ```

2. **Update API URLs:**
   - Deploy backend first
   - Get backend URL
   - Update VITE_API_URL and VITE_WS_URL

3. **Set environment variables in hosting platform:**
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Build & deploy → Environment

---

## ⚠️ SECURITY WARNINGS

### 🚫 NEVER DO THESE:

1. ❌ Commit .env files to Git
2. ❌ Share secrets in Slack/Email
3. ❌ Use weak secrets (< 32 characters)
4. ❌ Reuse secrets across environments
5. ❌ Hardcode secrets in source code
6. ❌ Use default/example secrets in production

### ✅ ALWAYS DO THESE:

1. ✅ Use .gitignore for .env files
2. ✅ Generate new secrets for production
3. ✅ Use environment variables
4. ✅ Rotate secrets periodically
5. ✅ Use different secrets per environment
6. ✅ Store secrets in secure vault (hosting platform)

---

## 🧪 TESTING ENVIRONMENT VARIABLES

### Test Backend .env:

```bash
cd server
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET ? '✅ JWT_SECRET is set' : '❌ JWT_SECRET missing')"
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI ? '✅ MONGO_URI is set' : '❌ MONGO_URI missing')"
```

### Test Frontend .env:

```bash
cd client
npm run dev
# Check browser console for VITE_API_URL
# Should not be undefined
```

---

## 📋 ENVIRONMENT VARIABLE CHECKLIST

### Backend (Required)
- [ ] NODE_ENV=production
- [ ] PORT (default 5000)
- [ ] MONGO_URI
- [ ] JWT_SECRET (64+ characters)
- [ ] CLIENT_ORIGIN (frontend URL)

### Backend (Optional but Recommended)
- [ ] JWT_EXPIRES_IN
- [ ] RATE_LIMIT_WINDOW
- [ ] RATE_LIMIT_MAX
- [ ] EMAIL_SERVICE (if email enabled)
- [ ] EMAIL_USER (if email enabled)
- [ ] EMAIL_PASSWORD (if email enabled)

### Frontend (Required)
- [ ] VITE_API_URL (backend URL)
- [ ] VITE_WS_URL (backend WebSocket URL)
- [ ] VITE_NODE_ENV=production

### Frontend (Optional)
- [ ] VITE_GA_TRACKING_ID (analytics)
- [ ] VITE_SENTRY_DSN (error tracking)
- [ ] VITE_ENABLE_* (feature flags)

---

## 🔗 DEPLOYMENT PLATFORM SPECIFIC

### Vercel (Frontend)

```bash
# Set variables via CLI
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production

# Or via Dashboard:
# Settings → Environment Variables → Add
```

### Render (Backend)

```bash
# Via Dashboard:
# Environment → Add Environment Variable
# Key: JWT_SECRET
# Value: your-generated-secret
```

### Heroku (Backend)

```bash
# Set variables via CLI
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGO_URI=your-mongo-uri
heroku config:set CLIENT_ORIGIN=your-frontend-url

# View all variables
heroku config
```

### Railway (Backend)

```bash
# Via Dashboard:
# Variables → New Variable
# Or via CLI:
railway variables set JWT_SECRET=your-secret
```

---

## 🎯 QUICK START CHECKLIST

1. [ ] Generate JWT_SECRET
2. [ ] Setup MongoDB Atlas cluster
3. [ ] Get MongoDB connection string
4. [ ] Deploy backend with environment variables
5. [ ] Get backend URL
6. [ ] Update frontend VITE_API_URL
7. [ ] Deploy frontend with environment variables
8. [ ] Get frontend URL
9. [ ] Update backend CLIENT_ORIGIN
10. [ ] Test API connection
11. [ ] Verify authentication works
12. [ ] Check WebSocket connection

---

## 📞 SUPPORT

If environment variables are not working:

1. Check spelling and typos
2. Verify no extra spaces in values
3. Restart application after changes
4. Check hosting platform logs
5. Verify .env file is not committed (should be in .gitignore)
6. Test locally with production .env first

---

**Generated:** Day 10 Environment Configuration
**Status:** ✅ Production Ready
**Last Updated:** Day 10

---
