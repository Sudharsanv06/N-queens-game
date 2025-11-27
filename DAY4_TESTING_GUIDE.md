# Day 4 Testing & Verification Guide

## ✅ Current Status

### Servers Running:
- **Frontend**: http://localhost:5174/ ✅
- **Backend**: http://localhost:5000/ ✅
- **MongoDB**: Connected ✅
- **No ERR_ERL_KEY_GEN_IPV6 errors** ✅

---

## 🧪 Step-by-Step Testing

### 1️⃣ **Frontend UI Testing**

#### Open the Game in Browser:
```
http://localhost:5174/play-game
```

**What to check:**
- ✅ Game board loads
- ✅ Console shows "App initialization complete"
- ✅ No errors in browser console

#### Test Auto-Save Feature:
1. Start a new game (choose 8×8 board)
2. Place 2-3 queens on the board
3. **Wait ~10 seconds**
4. ✅ Look for save toast notification
5. ✅ Check browser console for save success message
6. ✅ Check Network tab for `POST /api/game/save` request

#### Test Hint System:
1. Click **"Request Hint"** button
2. ✅ Should get a hint (row/col highlighted)
3. ✅ `hintsUsed` counter increments
4. Click hint **3 more times** (total 3 hints)
5. ✅ 4th hint request should be **blocked** with error message
6. Check browser console for rate-limit message

#### Test Undo/Reset:
1. Place several queens
2. Click **"Undo"** button
3. ✅ Last move removed
4. Click **"Reset"** button
5. ✅ Board clears completely
6. ✅ Session continues tracking moves

#### Test Conflict Resolution:
1. Play a game and auto-save
2. **Log out** (if auth available)
3. Modify `localStorage` to have older timestamp
4. **Log back in**
5. ✅ `ConflictModal` should appear
6. ✅ Options: "Use Local", "Use Server", "Smart Merge"

---

### 2️⃣ **Backend API Testing (PowerShell)**

Open PowerShell and run these commands:

#### Test 1: Get Latest Save
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/game/latest?sessionId=seed-session-001" -Method Get
$response | ConvertTo-Json -Depth 5
```

**Expected Result:**
```json
{
  "success": true,
  "save": {
    "sessionId": "seed-session-001",
    "n": 8,
    "boardState": [...],
    "lastUpdated": "2024-11-26T..."
  }
}
```

#### Test 2: Request Hint
```powershell
$body = @{
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMddHHmmss')"
    n = 8
    boardState = @(@($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null),
                   @($null,$null,$null,$null,$null,$null,$null,$null))
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/game/hint" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```

**Expected Result:**
```json
{
  "success": true,
  "hint": {
    "row": 0,
    "col": 2
  },
  "hintsUsed": 1
}
```

#### Test 3: Save Game
```powershell
$saveBody = @{
    sessionId = "manual-test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    n = 8
    boardState = @(@($null,$null,$null,$null,$null,$null,$null,$null))
    moves = @()
    timer = 0
    hintsUsed = 0
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/game/save" -Method Post -Body $saveBody -ContentType "application/json"
$response | ConvertTo-Json
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Game saved successfully",
  "save": { ... }
}
```

#### Test 4: Rate Limiting (Hints)
Run the hint request **4 times in a row** with the same `sessionId`:
```powershell
# Run this 4 times
$sessionId = "rate-limit-test-001"
# ... (use same hint request body with this sessionId)
```

**Expected Result:**
- First 3 requests: ✅ Success with hint
- 4th request: ❌ `429 Too Many Requests` or hint limit error

---

### 3️⃣ **Database Verification (MongoDB)**

#### Option A: MongoDB Compass
1. Connect to: `mongodb://localhost:27017`
2. Select database: `n-queens-game`
3. Check collections:
   - ✅ `gamesaves` - should have documents
   - ✅ `sessions` - should have session records

#### Option B: Mongo Shell
```bash
mongosh mongodb://localhost:27017/n-queens-game

# View game saves
db.gameSaves.find().pretty()

# View sessions
db.sessions.find().pretty()

# Count documents
db.gameSaves.countDocuments()
db.sessions.countDocuments()
```

**Expected Data:**
- `gameSaves`: Documents with `sessionId`, `boardState`, `lastUpdated`
- `sessions`: Documents with `sessionId`, `startAt`, `movesCount`, `hintsUsed`

---

### 4️⃣ **Run Automated Tests**

```powershell
cd server
npm test
```

**Expected Result:**
```
✓ 15 passing tests
✓ GameSave model tests
✓ Session model tests
✓ Hint endpoint tests
✓ Save endpoint tests
✓ Rate limiting tests
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem:** Auto-save not working
- ✅ Check: `useAutoSave` hook is imported in PlayGame component
- ✅ Check: Browser console for errors
- ✅ Check: Network tab for failed requests

**Problem:** ConflictModal never appears
- ✅ Ensure server save has newer `lastUpdated` than localStorage
- ✅ Check: `useResumeOnLogin` hook is active
- ✅ Inspect: localStorage `gameSave_<sessionId>` timestamp

**Problem:** Hints fail immediately
- ✅ Check: Same `sessionId` being used
- ✅ Check: Server logs for hint rate-limiter messages
- ✅ Verify: MongoDB `sessions` collection has correct `hintsUsed`

### Backend Issues

**Problem:** Rate-limit errors
- ✅ Run: `grep -r "rateLimit" server/` to find all usages
- ✅ Verify: All use `keyGenerator: (req) => ipKeyGenerator(req)`
- ✅ Check: `server/middleware/rateLimiter.js` imports `ipKeyGenerator`

**Problem:** MongoDB connection errors
- ✅ Ensure MongoDB is running: `mongosh --version`
- ✅ Check `.env` has correct `MONGO_URI`
- ✅ Verify: Server logs show "MongoDB connected successfully"

**Problem:** CORS errors
- ✅ Check: Frontend URL matches CORS origins in server.js
- ✅ Current origins: `5173, 5174, 3000, capacitor://localhost`
- ✅ Add your port if different

---

## ✅ Final Verification Checklist

### Core Functionality:
- [ ] Frontend loads at http://localhost:5174/play-game
- [ ] Backend responds at http://localhost:5000/api/game/latest
- [ ] Auto-save triggers after 10 seconds
- [ ] Hint endpoint returns valid hints
- [ ] Hint rate-limiting works (max 3 per game)
- [ ] Save endpoint creates/updates gameSaves in MongoDB
- [ ] ConflictModal appears for server vs local conflicts
- [ ] Undo/Reset functions work correctly

### Database:
- [ ] `gameSaves` collection has documents
- [ ] `sessions` collection tracks game sessions
- [ ] Timestamps update correctly
- [ ] sessionId indexing works

### Tests:
- [ ] `npm test` passes all 15 tests
- [ ] No console errors in browser
- [ ] No ERR_ERL_KEY_GEN_IPV6 in server logs

---

## 📊 Expected Server Logs

When everything works correctly, you should see:

```
✅ MongoDB connected successfully
🚀 Server running on port 5000
🌍 Environment: development

# On save request:
POST /api/game/save 200 45ms

# On hint request:
POST /api/game/hint 200 23ms

# On rate limit:
Too many hint requests from <IP>
```

---

## 🎯 Quick Smoke Test Summary

**5-Minute Test:**
1. ✅ Open http://localhost:5174/play-game
2. ✅ Place 3 queens → Wait 10s → See save toast
3. ✅ Click "Hint" 3 times → 4th blocked
4. ✅ Check MongoDB has gameSaves document
5. ✅ Run `npm test` → All pass

**If all above work:** 🎉 **Day 4 is fully functional!**

---

## 📝 Notes

- Server logs show non-critical warnings about email/VAPID - these are **OK**
- Rate limiter now uses `ipKeyGenerator` - **IPv6 error fixed** ✅
- Frontend on port **5174** (5173 was in use)
- All Day 4 features are backend-ready and tested

---

## 🚀 Next Steps

If everything passes:
1. Commit changes: `git add . && git commit -m "Day 4: Complete save/resume system with persistence"`
2. Test on different browsers (Chrome, Firefox, Edge)
3. Test mobile responsiveness
4. Deploy to staging environment
5. Move to Day 5 features

---

**Last Updated:** November 26, 2025  
**Day 4 Status:** ✅ Ready for Testing
