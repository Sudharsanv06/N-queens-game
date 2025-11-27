# 🚀 COMPLETE DEPLOYMENT GUIDE

## N-Queens Game - Production Deployment

This guide covers deploying the N-Queens Game to various hosting platforms with complete configuration.

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 PREREQUISITES

### Required Tools
- Node.js v18+ and npm v8+
- Git
- MongoDB account (MongoDB Atlas recommended)
- Hosting platform accounts (Vercel, Render, etc.)

### Required Knowledge
- Basic command line operations
- Environment variables
- Git operations

---

## 🌍 ENVIRONMENT SETUP

### 1. Generate Secure Secrets

```bash
# Generate JWT Secret (Run in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Save this for your JWT_SECRET.

### 2. Backend Environment Variables

Create `server/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nqueens?retryWrites=true&w=majority

# Security
JWT_SECRET=<your-generated-secret-from-step-1>
JWT_EXPIRES_IN=7d

# Frontend URL (Update after frontend deployment)
CLIENT_ORIGIN=https://your-frontend-url.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Optional: Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_MAILTO=mailto:your-email@example.com
```

### 3. Frontend Environment Variables

Create `client/.env.production`:

```env
# API Configuration (Update after backend deployment)
VITE_API_URL=https://your-backend-url.onrender.com
VITE_WS_URL=wss://your-backend-url.onrender.com

# Environment
VITE_NODE_ENV=production

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Optional: Feature Flags
VITE_ENABLE_MULTIPLAYER=true
VITE_ENABLE_SOCIAL=true
```

---

## 🎨 FRONTEND DEPLOYMENT

### Option 1: Vercel (Recommended ⭐)

**Why Vercel?**
- Zero configuration for Vite/React
- Automatic HTTPS
- Global CDN
- Instant deployments
- Free tier available

#### Steps:

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Navigate to Client Folder:**
```bash
cd client
```

3. **Build the Project:**
```bash
npm run build
```

4. **Deploy:**
```bash
vercel --prod
```

5. **Configure:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Set Environment Variables in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `client/.env.production`

7. **Get Your URL:**
   - Copy the deployment URL (e.g., `https://nqueens.vercel.app`)
   - Update backend's `CLIENT_ORIGIN` with this URL

#### Vercel Configuration File

Create `client/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build:**
```bash
cd client
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Add Environment Variables in Netlify Dashboard**

---

### Option 3: AWS S3 + CloudFront

1. **Build:**
```bash
cd client
npm run build
```

2. **Create S3 Bucket:**
   - Enable static website hosting
   - Upload `dist/` contents

3. **Configure CloudFront:**
   - Create distribution
   - Point to S3 bucket
   - Enable HTTPS

4. **Update DNS:**
   - Point your domain to CloudFront

---

## 🖥️ BACKEND DEPLOYMENT

### Option 1: Render (Recommended ⭐)

**Why Render?**
- Free tier includes PostgreSQL/MongoDB
- Auto-deploy from Git
- Automatic HTTPS
- Environment variable management
- WebSocket support

#### Steps:

1. **Push Code to GitHub:**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select branch: `main`

4. **Configure:**
   - Name: `nqueens-backend`
   - Environment: `Node`
   - Region: Choose closest to users
   - Branch: `main`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

5. **Environment Variables:**
   - Add all variables from `server/.env.production`
   - ⚠️ **Important:** Set `NODE_ENV=production`

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

7. **Get Backend URL:**
   - Copy the URL (e.g., `https://nqueens-backend.onrender.com`)
   - Update frontend's `VITE_API_URL` with this URL

8. **Configure Health Checks:**
   - Render will automatically ping `/health` endpoint
   - Your backend already has this endpoint configured

---

### Option 2: Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
cd server
railway init
```

4. **Deploy:**
```bash
railway up
```

5. **Add Environment Variables:**
```bash
railway variables
```

---

### Option 3: Heroku

1. **Install Heroku CLI:**
```bash
# Windows (with Chocolatey)
choco install heroku-cli

# Or download from heroku.com
```

2. **Login:**
```bash
heroku login
```

3. **Create App:**
```bash
cd server
heroku create nqueens-backend
```

4. **Set Environment Variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>
heroku config:set CLIENT_ORIGIN=<your-frontend-url>
```

5. **Deploy:**
```bash
git subtree push --prefix server heroku main
```

---

### Option 4: AWS EC2

1. **Launch EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect via SSH:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install PM2:**
```bash
sudo npm install -g pm2
```

5. **Clone & Setup:**
```bash
git clone <your-repo-url>
cd n-queens-game/server
npm install
```

6. **Create .env file:**
```bash
nano .env
# Paste production environment variables
```

7. **Start with PM2:**
```bash
pm2 start server.js --name nqueens-backend
pm2 save
pm2 startup
```

8. **Configure Nginx (Reverse Proxy):**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/nqueens
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Enable & Restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/nqueens /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Setup HTTPS with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 💾 DATABASE SETUP

### MongoDB Atlas (Recommended)

1. **Create Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster:**
   - Choose free tier (M0)
   - Select region closest to backend
   - Name: `nqueens-production`

3. **Create Database User:**
   - Database Access → Add New User
   - Username: `nqueens-admin`
   - Generate strong password
   - Roles: Read and write to any database

4. **Whitelist IP Addresses:**
   - Network Access → Add IP Address
   - For testing: `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific IPs

5. **Get Connection String:**
   - Clusters → Connect → Connect Your Application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `nqueens`

6. **Update Backend .env:**
```env
MONGO_URI=mongodb+srv://nqueens-admin:<password>@nqueens-production.xxxxx.mongodb.net/nqueens?retryWrites=true&w=majority
```

7. **Create Indexes (Important for Performance):**

Connect to your database and run:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

// Games collection
db.games.createIndex({ userId: 1, createdAt: -1 })
db.games.createIndex({ boardSize: 1, difficulty: 1 })
db.games.createIndex({ completed: 1, createdAt: -1 })

// Leaderboard collection
db.leaderboards.createIndex({ score: -1 })
db.leaderboards.createIndex({ userId: 1 })
db.leaderboards.createIndex({ createdAt: -1 })

// Achievements collection
db.achievements.createIndex({ userId: 1 })
db.achievements.createIndex({ achievementId: 1, userId: 1 }, { unique: true })

// Multiplayer rooms collection
db.multiplayerrooms.createIndex({ roomId: 1 }, { unique: true })
db.multiplayerrooms.createIndex({ status: 1, createdAt: -1 })
db.multiplayerrooms.createIndex({ 'players.userId': 1 })
```

---

## ✅ POST-DEPLOYMENT

### 1. Update CORS Configuration

After deployment, update backend CORS:

```javascript
// server/server.js
const allowedOrigins = [
  'https://your-frontend-url.vercel.app',
  'https://your-custom-domain.com',
  'http://localhost:5173' // Keep for local development
];
```

### 2. Test All Endpoints

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# API test
curl https://your-backend-url.onrender.com/api/auth/test
```

### 3. Frontend Environment Update

Update `client/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_WS_URL=wss://your-backend-url.onrender.com
```

Redeploy frontend:
```bash
cd client
vercel --prod
```

### 4. DNS Configuration (Optional)

If using custom domain:

1. **For Frontend (Vercel):**
   - Vercel Dashboard → Domains → Add Domain
   - Add CNAME record in your DNS provider

2. **For Backend:**
   - Add A record pointing to backend IP
   - Or CNAME to backend URL

### 5. Setup Monitoring

#### Backend Health Monitoring

Use a service like:
- **UptimeRobot** (Free, recommended)
- **Pingdom**
- **StatusCake**

Monitor:
- `https://your-backend-url.onrender.com/health`
- Check every 5 minutes
- Alert on downtime

#### Error Tracking

**Sentry Setup (Optional):**

1. Create account at [sentry.io](https://sentry.io)

2. Install Sentry SDK:
```bash
cd client
npm install @sentry/react

cd ../server
npm install @sentry/node
```

3. Initialize in code:

**Frontend:**
```javascript
// client/src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

**Backend:**
```javascript
// server/server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### 6. Performance Monitoring

**Lighthouse Audit:**

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run audit
lhci autorun --upload.target=temporary-public-storage
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🔍 TROUBLESHOOTING

### Issue: Frontend can't connect to backend

**Solutions:**
1. Check CORS configuration in backend
2. Verify `VITE_API_URL` is correct
3. Ensure backend is running
4. Check network tab for CORS errors
5. Verify CLIENT_ORIGIN in backend .env

### Issue: Database connection failed

**Solutions:**
1. Check MongoDB Atlas whitelist IPs
2. Verify connection string format
3. Check database user permissions
4. Test connection string locally first
5. Check MongoDB Atlas cluster status

### Issue: WebSocket not connecting

**Solutions:**
1. Ensure hosting supports WebSocket
2. Use WSS (not WS) in production
3. Check firewall rules
4. Verify Socket.IO CORS configuration
5. Check for reverse proxy WebSocket support

### Issue: 502 Bad Gateway

**Solutions:**
1. Backend might be starting up (wait 1-2 minutes)
2. Check backend logs for errors
3. Verify environment variables
4. Check MongoDB connection
5. Increase server timeout if needed

### Issue: Slow initial load

**Solutions:**
1. Verify code splitting is working
2. Check bundle size analysis
3. Implement service worker caching
4. Use CDN for static assets
5. Enable Brotli compression

### Issue: Authentication not working

**Solutions:**
1. Verify JWT_SECRET is set
2. Check token expiration time
3. Clear browser cookies/localStorage
4. Verify CORS allows credentials
5. Check auth middleware

---

## 📊 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Production build successful
- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Security middleware active

### During Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database connection string obtained
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Health endpoint responding

### Post-Deployment
- [ ] All endpoints tested
- [ ] Frontend connects to backend
- [ ] WebSocket working
- [ ] Authentication working
- [ ] Game functionality working
- [ ] Multiplayer tested
- [ ] Error tracking setup
- [ ] Monitoring configured
- [ ] Performance audit completed
- [ ] Custom domain configured (optional)

---

## 🎯 RECOMMENDED STACK

**For Best Results:**

```
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
Monitoring: UptimeRobot (free)
Error Tracking: Sentry (free tier)
Analytics: Google Analytics (free)
```

**Estimated Costs:**
- Free tier available for all services
- Can handle 100,000+ requests/month for free
- Upgrade as needed based on traffic

---

## 📚 ADDITIONAL RESOURCES

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🆘 SUPPORT

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review platform-specific documentation
3. Check server/frontend logs
4. Verify all environment variables
5. Test locally with production environment variables

---

**🎉 Congratulations! Your N-Queens Game is now live!**

Share your deployed URL and enjoy your production-ready application!

---

Generated: Day 10 Deployment Guide
Status: ✅ Complete & Production Ready
