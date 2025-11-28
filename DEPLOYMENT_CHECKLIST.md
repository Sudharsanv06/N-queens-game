# 🚀 Render Deployment Checklist - Live Progress

**Date:** November 27, 2025  
**Backend URL:** `https://n-queens-game-backend.onrender.com` (update after deploy)  
**Current Status:** Fixing MongoDB connection

---

## ✅ Step 1: MongoDB Atlas IP Whitelist (DO THIS FIRST!)

- [ ] Login to MongoDB Atlas: https://cloud.mongodb.com
- [ ] Navigate to cluster `n-queens-prod`
- [ ] Click **"Network Access"** (left sidebar)
- [ ] Click **"Add IP Address"** button
- [ ] Select **"Allow Access From Anywhere"**
- [ ] Confirm it added `0.0.0.0/0`
- [ ] Click **"Confirm"**
- [ ] ⏱️ **WAIT 2-3 MINUTES** for propagation

**⚠️ This is the #1 cause of "querySrv ENOTFOUND" errors!**

---

## ✅ Step 2: Verify MONGO_URI in Render

- [ ] Go to Render Dashboard: https://dashboard.render.com
- [ ] Click your service: `n-queens-game-backend`
- [ ] Click **"Environment"** (left sidebar)
- [ ] Verify `MONGO_URI` variable exists (exact name, case-sensitive)
- [ ] Check value format (partially hidden):
  ```
  mongodb+srv://sudharsanv06_db_user:***@n-queens-prod.tcdbvrt.mongodb.net/n-queens-game?retryWrites=true&w=majority&appName=n-queens-prod
  ```
- [ ] Confirm **NO quotes** around the value
- [ ] Confirm all 10 environment variables are present

---

## ✅ Step 3: Optional - Test from Render Shell

- [ ] In Render Dashboard → Click **"Shell"** tab
- [ ] Run: `node -e "console.log(Boolean(process.env.MONGO_URI))"`
  - Expected: `true`
- [ ] Run: `node -e "console.log(process.env.MONGO_URI.slice(0,80))"`
  - Expected: Shows first 80 chars of connection string
- [ ] Run: `nslookup -type=SRV _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net`
  - Expected: Returns SRV records (if this fails, DNS/whitelist issue)

---

## ✅ Step 4: Manual Deploy

- [ ] Go to **"Events"** tab in Render
- [ ] Click **"Manual Deploy"** button
- [ ] Select **"Deploy latest commit"**
- [ ] Watch live logs scroll

---

## ✅ Step 5: Watch Deployment Logs (Success Indicators)

**Build Phase:**
- [ ] `==> Running build command 'npm install'...`
- [ ] `added XXX packages, and audited XXX packages`
- [ ] `found 0 vulnerabilities`
- [ ] `==> Build successful 🎉`

**Start Phase:**
- [ ] `==> Running 'node server.js'`
- [ ] `✅ MongoDB connected successfully`
- [ ] `✅ Daily challenge cron jobs initialized`
- [ ] `✅ Streak check cron job initialized (hourly)`
- [ ] `✅ Multiplayer socket handler initialized`
- [ ] `🚀 Server running on port 5000`

**Service Status:**
- [ ] Render shows **"Live"** status (green dot)
- [ ] No crash loops or restart cycles

---

## ✅ Step 6: Test Backend Endpoints

**Copy your backend URL from Render** (looks like `https://n-queens-game-backend-XXXX.onrender.com`)

### Test 1: Root Endpoint
```bash
curl https://YOUR-BACKEND-URL.onrender.com/
```
**Expected Response:**
```json
{
  "message": "N-Queens Game API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

### Test 2: Health Check (MOST IMPORTANT)
```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T...",
  "uptime": 123.456,
  "environment": "production",
  "database": "connected"
}
```

### Test 3: Version Endpoint
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/version
```
**Expected Response:**
```json
{
  "version": "1.0.0",
  "name": "N-Queens Game API",
  "timestamp": "...",
  "environment": "production"
}
```

- [ ] All 3 endpoints return 200 OK
- [ ] Health check shows `"database": "connected"`

---

## 🔴 If Still Failing - Troubleshooting

### Error: "querySrv ENOTFOUND"
**Cause:** Atlas IP whitelist not allowing Render's IP

**Fix:**
1. Double-check Atlas Network Access shows `0.0.0.0/0`
2. Wait full 3 minutes after adding
3. Try non-SRV connection string (get from Atlas "Connect" button)
4. Run `nslookup` from Render Shell to verify DNS

### Error: "Authentication failed"
**Cause:** Wrong username/password or user doesn't have database access

**Fix:**
1. Verify username: `sudharsanv06_db_user`
2. Verify password: `pNXHCQCcb6IJFTqLA`
3. Atlas → Database Access → Check user has "Read and write to any database"

### Error: "Cannot find module"
**Cause:** Missing route file or typo in import

**Fix:**
1. Check latest commit pushed: `edf0ea4`
2. Verify `server/routes/gameSaves.js` exists in GitHub repo
3. Force redeploy: Clear build cache → Manual Deploy

---

## ✅ Step 7: Update CLIENT_ORIGIN (After Frontend Deployed)

**Do this AFTER frontend is deployed to Vercel:**

- [ ] Get Vercel frontend URL (e.g., `https://n-queens-game.vercel.app`)
- [ ] Render → Environment → Edit `CLIENT_ORIGIN`
- [ ] Change from `http://localhost:5173` to production URL
- [ ] Save and redeploy backend

---

## 🎯 Success Criteria

✅ Backend deployment succeeded  
✅ Logs show "MongoDB connected successfully"  
✅ Logs show "Server running on port 5000"  
✅ Health endpoint returns 200 OK  
✅ Health endpoint shows `"database": "connected"`  
✅ Service shows "Live" status  
✅ No error logs or crash loops  

---

## 📝 Backend URL (Fill in after deploy)

```
Backend URL: https://_____________________________.onrender.com
```

**Test Commands:**
```bash
# Health check
curl https://YOUR-URL/health

# Version check  
curl https://YOUR-URL/api/version

# Root endpoint
curl https://YOUR-URL/
```

---

## 🔐 Security Hardening (Do After Success)

- [ ] Atlas → Network Access → Remove `0.0.0.0/0`
- [ ] Add specific Render IPs or more restrictive CIDR
- [ ] Rotate MongoDB password if widely shared
- [ ] Verify all production secrets set in Render
- [ ] Enable Render auto-deploy on push (optional)

---

## 🚀 Next Steps (After Backend is Live)

1. ✅ Backend deployed and healthy
2. ⬜ Deploy frontend to Vercel
3. ⬜ Update CLIENT_ORIGIN in Render
4. ⬜ Test full stack (signup, login, game play)
5. ⬜ Configure custom domain (optional)

---

**Status Update Template:**

> I've added `0.0.0.0/0` to MongoDB Atlas Network Access and verified MONGO_URI in Render environment. Redeploying now and monitoring logs for "MongoDB connected successfully". Will update once backend is live and health endpoint confirms database connection. ✅

