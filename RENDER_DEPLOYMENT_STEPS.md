# 🚀 Render Backend Deployment - Step by Step

## ✅ Local Sanity Checks - COMPLETED

- [x] Git status: Clean working tree
- [x] Current branch: main
- [x] Synced with origin/main
- [x] No node_modules committed
- [x] Latest commit: `436b412 - Day 10 complete`

---

## 📋 Render Configuration Steps

### Step 1: Access Render Dashboard

1. Go to https://dashboard.render.com
2. Find your service: `n-queens-game-backend`
3. Click on the service name

### Step 2: Configure Build & Deploy Settings

Navigate to: **Settings** → **Build & Deploy**

Set these **EXACTLY** as shown:

```
Root Directory: server
```
*(Just type `server` - no slashes, no paths)*

```
Build Command: npm install
```

```
Start Command: npm start
```

Click **"Save Changes"**

---

## 🔐 Step 3: Add Environment Variables

Navigate to: **Environment** → **Add Environment Variable**

Copy and paste these **10 REQUIRED variables** one by one:

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
```

### 2. PORT
```
Key: PORT
Value: 5000
```

### 3. MONGO_URI (⚠️ CRITICAL - READ CAREFULLY)
```
Key: MONGO_URI
Value: mongodb+srv://sudharsanv06_db_user:pNXHCQCcb6IJFTqLA@n-queens-prod.tcdbvrt.mongodb.net/n-queens-game?retryWrites=true&w=majority&appName=n-queens-prod
```

**⚠️ IMPORTANT NOTES:**
- **NO quotes** around the value - paste the raw connection string
- If password contains special characters (`@`, `:`, `/`, `#`, space), URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `#` → `%23`
  - space → `%20`
- **Verify in MongoDB Atlas → Network Access:**
  - Add IP: `0.0.0.0/0` (allow all IPs for testing)
  - Or add Render's specific outbound IPs

### 4. JWT_SECRET (PRODUCTION VALUE - GENERATED)
```
Key: JWT_SECRET
Value: 9195024aca57e94006546d82eee1ad62cb33986b8e425022d10da582f80f12f3cc2497671222986567561939b73ffb386762ff3a21043d5eb590b7de25611f72
```

### 5. VAPID_PUBLIC_KEY
```
Key: VAPID_PUBLIC_KEY
Value: BFpMijSlArtLSW3K_SxW_nDD38-KKiSotmA1Ce0lXZShHL70gsdYQLpg1QSyjR7LuM8xQMTJtnp0rUZrOglJV0U
```

### 6. VAPID_PRIVATE_KEY
```
Key: VAPID_PRIVATE_KEY
Value: 2g9WMvyW9Ll3HkUaLqfpFfQMk7J7rE_tMQglS5QKtxo
```

### 7. CLIENT_ORIGIN (Temporary - will update after frontend deploy)
```
Key: CLIENT_ORIGIN
Value: http://localhost:5173
```

### 8. SESSION_SECRET (PRODUCTION VALUE - GENERATED)
```
Key: SESSION_SECRET
Value: e8715805ac1c8105c85e1151830b2e5da3aaa452c875c45164dd4b39a4d59c9a784868c962b946c729861172c4776289
```

### 9. JWT_EXPIRES_IN (Optional but recommended)
```
Key: JWT_EXPIRES_IN
Value: 7d
```

### 10. RATE_LIMIT_MAX (Optional but recommended)
```
Key: RATE_LIMIT_MAX
Value: 100
```

After adding all variables, click **"Save Changes"**

---

## 🚀 Step 4: Deploy

1. Go to **Events** tab
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

---

## 📊 Step 5: Monitor Deployment Logs

Watch for these success indicators:

✅ **Build Phase:**
```
==> Running build command 'npm install'...
npm install completed successfully
```

✅ **Start Phase:**
```
==> Starting service with 'npm start'...
Server running on port 5000
MongoDB connected successfully
```

✅ **Health Check:**
```
Service is responding to health checks
Deploy succeeded
```

---

## 🔍 Step 6: Verify Backend is Live

Once deployed, Render will give you a URL like:
```
https://n-queens-game-backend.onrender.com
```

Test these endpoints:

### 1. Root Endpoint
```bash
curl https://n-queens-game-backend.onrender.com/
```
Expected: Welcome message with API info

### 2. Health Check
```bash
curl https://n-queens-game-backend.onrender.com/api/health
```
Expected:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "environment": "production",
  "database": "connected"
}
```

### 3. Version Check
```bash
curl https://n-queens-game-backend.onrender.com/api/version
```
Expected:
```json
{
  "version": "1.0.0",
  "name": "N-Queens Game API",
  "timestamp": "...",
  "environment": "production"
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "querySrv ENOTFOUND" or "MongoDB connection error"
**This is the most common deployment issue!**

**Symptoms:**
```
MongoDB connection error: querySrv ENOTFOUND _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net
```

**Solutions (try in order):**

1. **Verify MONGO_URI in Render Environment:**
   - Go to Render → Environment variables
   - Confirm `MONGO_URI` exists (exact name, case-sensitive)
   - Value has **NO quotes** around it
   - Password special characters are URL-encoded

2. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allows all IPs - easiest for testing)
   - Click "Confirm"
   - **Wait 2-3 minutes** for Atlas to apply changes

3. **Test from Render Shell:**
   ```bash
   # Open Render → Shell, run:
   node -e "console.log(process.env.MONGO_URI)"
   
   # Or check all env vars:
   printenv | grep MONGO
   ```

4. **Test DNS resolution from Render Shell:**
   ```bash
   nslookup -type=SRV _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net
   ```

5. **After fixing, redeploy:**
   - Events → Manual Deploy → Deploy latest commit
   - Watch logs for "✅ MongoDB connected successfully"

---

### Issue: "Service Root Directory is missing"
**Solution:** 
- Go to Settings → Build & Deploy
- Set Root Directory to exactly: `server`
- Save and redeploy

### Issue: "MongoDB connection failed"
**Solution:**
- Check MongoDB Atlas IP whitelist: Allow `0.0.0.0/0` (all IPs)
- Verify MONGO_URI is correct (no typos in password)
- Ensure MongoDB cluster is running

### Issue: "Cannot find module"
**Solution:**
- Verify Build Command is: `npm install`
- Check package.json exists in server/ directory
- Redeploy

### Issue: "Port binding error"
**Solution:**
- Ensure server code uses: `process.env.PORT || 5000`
- Verify PORT env var is set to `5000`

### Issue: "CORS errors"
**Solution:**
- After frontend deploys, update CLIENT_ORIGIN
- Should be: `https://your-frontend-url.vercel.app`
- Redeploy backend

---

## 📝 Next Steps After Backend is Live

1. **Copy your backend URL** (shown in Render dashboard)
   ```
   Example: https://n-queens-game-backend.onrender.com
   ```

2. **Deploy Frontend to Vercel** with these env vars:
   ```
   VITE_API_URL=https://n-queens-game-backend.onrender.com
   VITE_WS_URL=wss://n-queens-game-backend.onrender.com
   VITE_VAPID_PUBLIC_KEY=BFpMijSlArtLSW3K_SxW_nDD38-KKiSotmA1Ce0lXZShHL70gsdYQLpg1QSyjR7LuM8xQMTJtnp0rUZrOglJV0U
   ```

3. **Update CLIENT_ORIGIN** in Render:
   - Go back to Render → Environment
   - Edit CLIENT_ORIGIN variable
   - Change to: `https://your-frontend-url.vercel.app`
   - Save and redeploy

4. **Test Full Stack:**
   - Open frontend URL
   - Try signup/login
   - Play a game
   - Check multiplayer
   - Verify leaderboards

---

## 🎯 Success Checklist

- [ ] Render service configured with correct Root Directory
- [ ] All 10 environment variables added
- [ ] Deployment succeeded (no errors in logs)
- [ ] Health endpoint returns 200 OK
- [ ] MongoDB connection successful
- [ ] Backend URL accessible
- [ ] Ready to deploy frontend

---

## 📞 Support

If deployment fails, copy the **exact error message** from Render logs and we'll troubleshoot!

---

**Generated:** November 27, 2025
**Status:** Ready for Deployment ✅
**Backend URL:** Will be provided after deployment

