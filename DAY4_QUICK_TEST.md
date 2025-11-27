# Day 4 Quick Test Guide

## Prerequisites Checklist

- [ ] MongoDB running locally or connection string set
- [ ] Node.js v16+ installed
- [ ] Server dependencies installed (`cd server && npm install`)
- [ ] Client dependencies installed (`cd client && npm install`)
- [ ] `.env` file configured in server directory

## Step 1: Environment Setup (5 minutes)

### Create/Update `.env` in server directory

```bash
# Required
MONGO_URI=mongodb://localhost:27017/nqueens
JWT_SECRET=your-super-secret-key-here

# Optional
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
SAVE_RETENTION_DAYS=90
```

### Install New Dependencies

```powershell
# Server dependencies
cd server
npm install express-rate-limit

# Dev dependencies for testing
npm install --save-dev jest supertest

# Client dependencies
cd ../client
npm install uuid
```

## Step 2: Start MongoDB (if local)

```powershell
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db

# Verify connection
mongosh
> show dbs
> exit
```

## Step 3: Start Backend Server (5 minutes)

```powershell
cd server
npm start
```

**Expected Output:**
```
Environment loaded: {
  NODE_ENV: 'development',
  PORT: '5000',
  MONGO_URI: 'Set',
  JWT_SECRET: 'Set'
}
Server listening on port 5000
Database connected successfully
```

**Troubleshooting:**
- ❌ "Database connection unavailable" → Check MongoDB is running
- ❌ "Cannot find module" → Run `npm install` again
- ❌ Port in use → Change PORT in .env or kill process on port 5000

## Step 4: Start Frontend Client (5 minutes)

```powershell
# In new terminal
cd client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 5: Manual API Testing (10 minutes)

### Test 1: Health Check
```powershell
curl http://localhost:5000/health
```

**Expected:** 
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T...",
  "version": "1.0.0",
  "database": "Connected",
  "uptime": 123.45
}
```

### Test 2: Create Session & Save Game (Guest)
```powershell
curl -X POST http://localhost:5000/api/game/save `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"test-session-001\",
    \"n\": 8,
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"moves\": [],
    \"placedQueens\": 0,
    \"timer\": 0,
    \"hintsUsed\": 0
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Game saved successfully",
  "data": {
    "id": "...",
    "sessionId": "test-session-001",
    "n": 8,
    ...
  }
}
```

### Test 3: Load Latest Save
```powershell
curl "http://localhost:5000/api/game/latest?sessionId=test-session-001"
```

**Expected:** Same data as saved

### Test 4: Request First Hint
```powershell
curl -X POST http://localhost:5000/api/game/hint `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"test-session-001\",
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"n\": 8
  }'
```

**Expected:**
```json
{
  "success": true,
  "hint": {
    "row": 0,
    "col": 0,
    "reasoning": "Safe position with score ..."
  },
  "hintsRemaining": 2,
  "hintsUsed": 1
}
```

### Test 5: Exhaust Hints (Test Rate Limiting)
```powershell
# Run the hint request 2 more times (copy Test 4 command)
# On 4th attempt, you should get:
```

**Expected:**
```json
{
  "success": false,
  "message": "Hint limit reached. Maximum 3 hints per game.",
  "hintsRemaining": 0
}
```

## Step 6: Frontend UI Testing (15 minutes)

### 6.1 Test Auto-Save
1. Open http://localhost:5173 in browser
2. Open DevTools Console (F12)
3. Navigate to Play Game
4. Check console for: `Auto-save initialized`
5. Wait 10 seconds
6. Look for: `Game saved successfully!` toast

### 6.2 Test localStorage
1. In DevTools, go to Application → Local Storage
2. Look for key: `nqueens:autosave:guest:...`
3. Verify it contains game state JSON

### 6.3 Test Manual Save
1. Click "Save Now" button
2. Verify toast: "Manual save successful!"
3. Check network tab for POST to `/api/game/save`

### 6.4 Test Load Game
1. Click "Load Game" button
2. Should see modal with saved games list
3. Click on a save
4. Game should restore state

### 6.5 Test Conflict Resolution
1. **Setup conflict:**
   - Save a game while logged out
   - Modify localStorage manually (change placedQueens)
   - Save again via API with different data
2. **Trigger conflict:**
   - Refresh page or trigger resume
3. **Verify modal appears** showing:
   - Local save details
   - Server save details
   - "Newer" badge on correct one
4. **Test resolution:**
   - Click "Use Local" → saves local to server
   - Click "Use Server" → loads server data
   - Click "Smart Merge" → combines both

### 6.6 Test Auto-Resume on Login
1. Save a game
2. Logout (if logged in) or refresh page
3. Login (or just reload)
4. Game should auto-resume from last save

## Step 7: Run Automated Tests (5 minutes)

```powershell
cd server
npm test -- gameSaves.test.js
```

**Expected:**
```
PASS  __tests__/gameSaves.test.js
  Game Save API
    POST /api/game/save
      ✓ should save a game without authentication (guest)
      ✓ should save a game with authentication
      ✓ should reject invalid save data
      ✓ should upsert existing save
    GET /api/game/load/:saveId
      ✓ should load a game by ID
      ✓ should return 404 for non-existent save
    ...

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

## Step 8: Edge Case Testing (10 minutes)

### Test Invalid Board Size
```powershell
curl -X POST http://localhost:5000/api/game/save `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"test-invalid\",
    \"n\": 25,
    \"boardState\": [],
    \"moves\": [],
    \"placedQueens\": 0,
    \"timer\": 0,
    \"hintsUsed\": 0
  }'
```

**Expected:** Error response with validation message

### Test Large Payload (>500KB)
Create a huge board or long moves array and try to save.

**Expected:** 400 error "Payload size exceeds 500KB limit"

### Test Hint Without Session
```powershell
curl -X POST http://localhost:5000/api/game/hint `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"non-existent\",
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"n\": 8
  }'
```

**Expected:** 404 "Session not found"

### Test Rate Limiter
```powershell
# Run this command rapidly 15+ times
for ($i=1; $i -le 15; $i++) {
  curl -X POST http://localhost:5000/api/game/hint ...
}
```

**Expected:** After 10 requests, get 429 "Too many hint requests"

## Step 9: Verify Database (5 minutes)

```powershell
mongosh
```

```javascript
use nqueens

// Check collections exist
show collections
// Should see: gamesaves, sessions, users

// Count saves
db.gamesaves.countDocuments()

// View recent saves
db.gamesaves.find().sort({ lastUpdated: -1 }).limit(3).pretty()

// Check sessions
db.sessions.find().pretty()

// Verify indexes
db.gamesaves.getIndexes()
// Should see indexes on: userId, sessionId, lastUpdated

db.sessions.getIndexes()
// Should see indexes on: sessionId, userId
```

## Step 10: Browser DevTools Checks (5 minutes)

### Console
- ✅ No errors related to save/load
- ✅ See successful save messages
- ✅ See resume attempt logs

### Network Tab
- ✅ POST /api/game/save returns 200
- ✅ GET /api/game/latest returns 200
- ✅ POST /api/game/hint returns 200

### Application Tab
- ✅ localStorage has save data
- ✅ Save data updates every 10s

### Redux DevTools (if installed)
- ✅ `save/saveGameAsync/pending`
- ✅ `save/saveGameAsync/fulfilled`
- ✅ State updates with save data

## 🎯 Success Criteria Checklist

- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] Health endpoint responds
- [ ] Can save game (guest and auth)
- [ ] Can load game by ID
- [ ] Can load latest game
- [ ] Hints work (3 limit enforced)
- [ ] Rate limiting works (10/min)
- [ ] Auto-save triggers every 10s
- [ ] localStorage syncs correctly
- [ ] Conflict modal appears when needed
- [ ] Smart merge works correctly
- [ ] Auto-resume on login works
- [ ] All 15 tests pass
- [ ] No console errors in browser
- [ ] Database has correct indexes

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```powershell
# Check if MongoDB is running
Get-Service MongoDB
# If not running
net start MongoDB
```

### Issue: "JWT_SECRET not set"
**Solution:** Add to server/.env:
```bash
JWT_SECRET=your-secret-key-at-least-32-chars-long
```

### Issue: "CORS error in browser"
**Solution:** Add to server/.env:
```bash
CLIENT_ORIGIN=http://localhost:5173
```

### Issue: "Auto-save not working"
**Solutions:**
1. Check Redux store includes `save` reducer
2. Verify `useAutoSave` hook is called
3. Check console for errors
4. Verify sessionId is not null

### Issue: "Hint returns 404"
**Solution:** 
1. Ensure session was created (happens on first save)
2. Check sessionId matches between save and hint request

### Issue: "Tests fail with timeout"
**Solutions:**
1. Increase Jest timeout: `jest.setTimeout(10000)`
2. Check test database connection
3. Ensure MongoDB is running

### Issue: "Conflict modal not appearing"
**Solutions:**
1. Verify `conflictData` in Redux state
2. Check `ConflictModal` is rendered
3. Create actual conflict by:
   - Saving locally
   - Modifying server save manually
   - Triggering resume

### Issue: "Save list empty"
**Solution:**
1. Must be authenticated to list saves
2. Guest saves don't appear in list
3. Create saves while logged in

## 📊 Performance Validation

### Backend Response Times
- Save: < 100ms
- Load: < 50ms
- Hint: < 200ms
- List: < 150ms

### Frontend Metrics
- Auto-save should not block UI
- Conflict modal should appear instantly
- Save status updates in real-time

## 🔐 Security Validation

1. Try accessing another user's save without auth
   - Should get 403 Forbidden
2. Try saving 600KB payload
   - Should get 400 Bad Request
3. Try requesting 50 hints in 30 seconds
   - Should get 429 Too Many Requests
4. Try SQL injection in sessionId
   - Should be sanitized by Mongoose

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

✅ / ❌  Server startup
✅ / ❌  Database connection
✅ / ❌  API endpoints working
✅ / ❌  Auto-save functioning
✅ / ❌  Manual save/load
✅ / ❌  Hint system
✅ / ❌  Rate limiting
✅ / ❌  Conflict resolution
✅ / ❌  Auto-resume
✅ / ❌  All tests passing
✅ / ❌  No console errors

Notes:
_________________________________
_________________________________

Issues Found:
_________________________________
_________________________________
```

## 🎉 Next Steps After Testing

1. ✅ All tests passing? → Day 4 Complete!
2. ⚠️ Some issues? → Check troubleshooting section
3. 🚀 Ready for production? → Review security checklist
4. 📈 Want more? → Check future enhancements in DAY4_COMPLETE.md

---

**Total Test Time: ~1 hour**

If you encounter any issues not covered here, check:
1. Server logs
2. Browser console
3. MongoDB logs
4. Network tab in DevTools
