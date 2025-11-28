# 🚨 MongoDB Connection Error - IMMEDIATE FIX GUIDE

**Error:** `querySrv ENOTFOUND _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net`

**What this means:** Render cannot connect to MongoDB Atlas because:
1. MongoDB Atlas is blocking Render's IP address
2. Or MONGO_URI environment variable is not set correctly

---

## 🔥 IMMEDIATE ACTION REQUIRED (5 minutes)

### Step 1: Add Render's IP to MongoDB Atlas Whitelist

**This is 99% likely the issue!**

1. **Open MongoDB Atlas:** https://cloud.mongodb.com
2. **Login** with your account
3. **Click your cluster:** `n-queens-prod`
4. **Left sidebar → Click "Network Access"**
5. **Click green "Add IP Address" button**
6. **Select "Allow Access From Anywhere"**
   - This will add `0.0.0.0/0` to the whitelist
7. **Click "Confirm"**
8. **⏱️ CRITICAL: Wait 2-3 minutes** for Atlas to propagate the change
   - Don't skip this wait time!
   - Grab a coffee ☕
9. **After 3 minutes, go back to Render and redeploy**

---

### Step 2: Verify MONGO_URI in Render Dashboard

1. **Open Render Dashboard:** https://dashboard.render.com
2. **Click your service:** `n-queens-game-backend`
3. **Left sidebar → Click "Environment"**
4. **Find the variable named:** `MONGO_URI` (exact spelling, case-sensitive)
5. **Verify the value shows (partially hidden):**
   ```
   mongodb+srv://sudharsanv06_db_user:***@n-queens-prod.tcdbvrt.mongodb.net/...
   ```

**⚠️ Common mistakes to check:**
- [ ] Variable name is EXACTLY `MONGO_URI` (not `MONGODB_URI` or `MONGO_URL`)
- [ ] Value has **NO quotes** around it (don't put `"mongodb+srv://..."`)
- [ ] Password is correct: `pNXHCQCcb6IJFTqLA`
- [ ] Hostname is: `n-queens-prod.tcdbvrt.mongodb.net`
- [ ] Database name is: `n-queens-game`

**Full connection string should be:**
```
mongodb+srv://sudharsanv06_db_user:pNXHCQCcb6IJFTqLA@n-queens-prod.tcdbvrt.mongodb.net/n-queens-game?retryWrites=true&w=majority&appName=n-queens-prod
```

---

### Step 3: Diagnostic Check (Optional but Recommended)

**In Render Dashboard → Shell tab, run these commands:**

#### Check if MONGO_URI exists:
```bash
echo $MONGO_URI | head -c 50
```
Should show: `mongodb+srv://sudharsanv06_db_user:pNXHCQCcb6IJFTq...`

#### Test DNS resolution:
```bash
nslookup -type=SRV _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net
```
**If this fails:** DNS cannot reach Atlas = IP whitelist issue

**If this succeeds:** Shows MongoDB server addresses = DNS is working

#### Run diagnostic script:
```bash
node diagnose-mongodb.js
```
This will give you detailed error info.

---

### Step 4: Redeploy After Fixing

1. **In Render Dashboard → Events tab**
2. **Click "Manual Deploy"**
3. **Select "Deploy latest commit"**
4. **Watch the logs**

**You should see:**
```
✅ MongoDB connected successfully
   Database: n-queens-game
✅ Daily challenge cron jobs initialized
🚀 Server running on port 10000
```

**You should NOT see:**
```
❌ MongoDB connection error: querySrv ENOTFOUND
```

---

## 📋 Quick Checklist (Do in Order)

- [ ] Step 1: Added `0.0.0.0/0` to MongoDB Atlas Network Access
- [ ] Step 2: Waited full 3 minutes after adding IP whitelist
- [ ] Step 3: Verified `MONGO_URI` exists in Render Environment (no typos)
- [ ] Step 4: Confirmed value has no quotes around it
- [ ] Step 5: Triggered Manual Deploy in Render
- [ ] Step 6: Watched logs - saw "MongoDB connected successfully"
- [ ] Step 7: Service shows "Live" status in Render

---

## 🎯 Test After Success

Once logs show MongoDB connected, test these endpoints:

```bash
# Replace YOUR-URL with your actual Render URL
curl https://YOUR-URL.onrender.com/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

---

## 🔍 Still Not Working? Advanced Troubleshooting

### Issue: DNS SRV lookup fails even after whitelist

**Try using standard connection string instead of SRV:**

1. In MongoDB Atlas → Click "Connect" on your cluster
2. Select "Connect your application"
3. Choose "Standard connection string" instead of SRV
4. Copy the standard format:
   ```
   mongodb://sudharsanv06_db_user:pNXHCQCcb6IJFTqLA@ac-XXXXX-shard-00-00.tcdbvrt.mongodb.net:27017,ac-XXXXX-shard-00-01.tcdbvrt.mongodb.net:27017,ac-XXXXX-shard-00-02.tcdbvrt.mongodb.net:27017/n-queens-game?ssl=true&replicaSet=atlas-XXXXX-shard-0&authSource=admin&retryWrites=true&w=majority
   ```
5. Replace `MONGO_URI` in Render with this standard format
6. Redeploy

---

### Issue: Authentication failed

**Error:** `Authentication failed` or `bad auth`

**Solutions:**
1. Go to MongoDB Atlas → Database Access
2. Find user: `sudharsanv06_db_user`
3. Verify password is: `pNXHCQCcb6IJFTqLA`
4. Check "Built-in Role" is: **"Atlas admin"** or **"Read and write to any database"**
5. If password is different, update it and update `MONGO_URI` in Render

---

### Issue: Database not found

**Error:** `Database not found` or `ns not found`

**Solutions:**
1. Database name should be: `n-queens-game`
2. Verify it's in the connection string: `...mongodb.net/n-queens-game?...`
3. The database will be created automatically on first connection if it doesn't exist

---

## 📞 Get Help

If still failing after all steps:

1. **Copy the EXACT error from Render logs**
2. **Screenshot your MongoDB Atlas Network Access page**
3. **Screenshot your Render Environment variables (hide passwords)**
4. **Run diagnostic:** `node diagnose-mongodb.js` and copy output

Share these 4 things for debugging help.

---

## ⚡ Quick Copy-Paste Commands

**For Render Shell:**
```bash
# Check MONGO_URI
echo $MONGO_URI | head -c 80

# Test DNS
nslookup -type=SRV _mongodb._tcp.n-queens-prod.tcdbvrt.mongodb.net

# Run diagnostic
node diagnose-mongodb.js

# Test connection with node
node -e "const m=require('mongoose'); m.connect(process.env.MONGO_URI).then(()=>{console.log('✅ Connected!');process.exit(0)}).catch(e=>{console.error('❌',e.message);process.exit(1)})"
```

**For Local Testing:**
```bash
# Test from your computer
cd server
node diagnose-mongodb.js
```

---

**Last Updated:** November 28, 2025  
**Status:** Waiting for Atlas whitelist propagation (3 minutes)

