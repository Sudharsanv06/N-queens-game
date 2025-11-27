# 🚀 DAY 8 — QUICK START GUIDE

## ⚡ Quick Installation (1 Minute)

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Generate VAPID Keys (Optional - for push notifications)
```bash
npx web-push generate-vapid-keys
```

Copy output and add to `server/.env`:
```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
```

### Step 3: Start Server
```bash
cd server
npm start
```

Server will automatically:
- ✅ Initialize cron jobs
- ✅ Setup daily challenge generation (00:00 UTC)
- ✅ Setup hourly streak checks

---

## 🧪 Quick Test (30 Seconds)

### Test 1: Generate Test Challenge
```bash
cd server
node scripts/testDailyChallenges.js
```

### Test 2: API Health Check
```bash
# Get current challenge (no auth required)
curl http://localhost:5000/api/daily-challenges/current
```

### Test 3: Frontend
1. Open browser: `http://localhost:5173/daily-challenge`
2. Should see current challenge with countdown timer
3. Sign in to start challenge

---

## 📋 What You Get

### Backend (Fully Functional)
- ✅ 5 MongoDB models
- ✅ 15+ API endpoints
- ✅ Automated cron jobs
- ✅ Push notifications
- ✅ Streak tracking

### Frontend (Core UI)
- ✅ Daily Challenge page
- ✅ Streak counter
- ✅ Challenge card
- ✅ Timer bar
- ✅ Redux integration

### Challenge Types (Auto-Rotating)
1. **Classic** - Standard 8×8, 5min, 100 XP
2. **Puzzle** - Random puzzle, 120 XP
3. **Speed Run** - 6×6 in 90s, 150 XP
4. **No-Hint** - No hints allowed, 200 XP
5. **Hardcore** - 50 move limit, 250 XP

---

## 🔑 Key Endpoints

```
GET  /api/daily-challenges/current          # Current challenge
POST /api/daily-challenges/start            # Start challenge
POST /api/daily-challenges/complete         # Complete challenge
GET  /api/daily-challenges/streak           # User streak
GET  /api/daily-challenges/history          # Challenge history
GET  /api/daily-challenges/stats            # User stats
```

---

## 🎯 Next Steps

1. **Test the system:**
   ```bash
   node server/scripts/testDailyChallenges.js
   ```

2. **Access frontend:**
   - Go to: `http://localhost:5173/daily-challenge`
   - Sign in
   - Start today's challenge

3. **Check notifications:**
   - Enable browser notifications
   - Complete a challenge
   - Receive completion notification

4. **Monitor cron jobs:**
   - Check server logs at 00:00 UTC
   - New challenge should auto-generate
   - Users receive notifications

---

## 🐛 Troubleshooting

**Cron not running?**
```bash
# Check logs
tail -f server.log | grep cron
```

**No challenge available?**
```bash
# Generate manually
node server/scripts/testDailyChallenges.js
```

**Push notifications not working?**
- Check VAPID keys in `.env`
- Ensure HTTPS in production
- Enable browser notifications

---

## 📚 Full Documentation

See `DAY8_COMPLETE.md` for:
- Complete API reference
- All testing scenarios
- Integration guides
- Troubleshooting
- File structure

---

**🎉 Day 8 Complete! Daily Challenges System is LIVE! 🎉**
