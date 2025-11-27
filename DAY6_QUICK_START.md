# Day 6: Quick Start Guide 🚀

Get the Predefined Puzzle Mode system up and running in 5 minutes!

---

## ✅ Prerequisites

- ✓ Backend server running (Node.js + MongoDB)
- ✓ Frontend client running (React + Vite)
- ✓ User authentication working
- ✓ MongoDB connection established

---

## 🚀 Setup Steps

### 1. Seed Puzzles (Backend)

```bash
# Navigate to server directory
cd server

# Run seeding script
node seed-puzzles.js
```

**Expected Output:**
```
🎮 Seeding predefined puzzles...
✅ Seeded 10 predefined puzzles successfully!
```

### 2. Test Backend API

```bash
# Test puzzle list endpoint (no auth required)
curl http://localhost:5000/api/puzzles/predefined/list
```

**Expected Response:**
```json
{
  "success": true,
  "puzzles": [
    {
      "puzzleId": "puzzle-001",
      "puzzleName": "First Steps",
      "difficulty": "easy",
      "n": 4,
      ...
    }
  ],
  "total": 10
}
```

### 3. Start Frontend

```bash
# Navigate to client directory
cd client

# Start dev server (if not already running)
npm run dev
```

### 4. Access Puzzle Mode

Open browser and navigate to:
```
http://localhost:3000/puzzles
```

---

## 🎮 Quick Test Flow

### Test 1: Browse Puzzles (Guest)
1. Go to `/puzzles`
2. See all 10 puzzles listed
3. Try filtering by difficulty
4. Click "Play" on any puzzle → Redirects to login

### Test 2: Play Puzzle (Authenticated)
1. Sign in at `/login`
2. Return to `/puzzles`
3. Click "Play" on `puzzle-001` (First Steps)
4. Should see:
   - 4×4 board with 2 locked queens (blue rings)
   - Timer starting automatically
   - Stats bar showing 0 moves, 0/3 hints, 2/4 queens
5. Click empty squares to place queens
6. Try clicking locked queen → Shows error toast
7. Click "Get Hint" → Shows hint suggestion
8. Click "Reset Board" → Board resets to initial state
9. Complete puzzle → Click "Check Solution"
10. If correct → Redirects to `/puzzles/puzzle-001/completed`
11. See completion screen with stars earned

### Test 3: View Results
1. Completion page shows:
   - Stars earned (3 if time ≤ 30s)
   - Time taken vs expected (30s)
   - Moves and hints used
   - Performance analysis
2. Click "Try Again" → Returns to puzzle gameplay
3. Click "More Puzzles" → Returns to puzzle list

### Test 4: Progress Tracking
1. Complete 2-3 puzzles
2. Return to `/puzzles`
3. User progress summary shows:
   - Completed count (e.g., "3 / 10")
   - Completion rate (e.g., "30%")
   - Total stars earned
   - Average stars per puzzle
4. Completed puzzles show:
   - Green checkmark ✓
   - Best score with stars
   - "Play Again" button (green gradient)

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /api/puzzles/predefined/list"

**Solution:**
- Check server is running: `cd server && npm start`
- Verify route registered in `server/server.js`
- Check MongoDB connection

### Issue: Puzzles not showing in UI

**Solution:**
- Verify seeding ran successfully: `node server/seed-puzzles.js`
- Check MongoDB database has `predefinedpuzzles` collection
- Open browser DevTools → Network tab → Check API response

### Issue: "Please sign in to play puzzles" when clicking Play

**Solution:**
- This is expected for guest users
- Sign in at `/login`
- Protected routes require authentication

### Issue: Timer not starting

**Solution:**
- Check Redux store configured with `puzzleSlice`
- Open DevTools → Redux tab → Verify `puzzle` state exists
- Check `startPuzzleAttempt` thunk dispatched on mount

### Issue: "Check Solution" shows error even when correct

**Solution:**
- Verify all n queens placed (e.g., 4 queens on 4×4 board)
- Check no queens in same row/column/diagonal
- Open DevTools → Console for error messages

---

## 📊 Verify Installation

### Backend Checklist
- [ ] `server/models/PredefinedPuzzle.js` exists
- [ ] `server/controllers/predefinedPuzzleController.js` exists
- [ ] `server/routes/predefinedPuzzles.js` exists
- [ ] `server/seed-puzzles.js` exists
- [ ] Routes registered in `server/server.js`
- [ ] Seeding script executed successfully
- [ ] API endpoint returns 10 puzzles

### Frontend Checklist
- [ ] `client/src/api/puzzleApi.js` exists
- [ ] `client/src/store/slices/puzzleSlice.js` exists
- [ ] `client/src/components/PuzzleCard.jsx` exists
- [ ] `client/src/components/PuzzleTimer.jsx` exists
- [ ] `client/src/components/PuzzleStatsBar.jsx` exists
- [ ] `client/src/pages/PuzzleList.jsx` exists
- [ ] `client/src/pages/PuzzlePlay.jsx` exists
- [ ] `client/src/pages/PuzzleCompleted.jsx` exists
- [ ] Routes added to `client/src/router.jsx`
- [ ] Store includes `puzzle` reducer

---

## 🎯 Expected Behavior

### PuzzleList Page (`/puzzles`)
- Shows all 10 puzzles in grid layout
- Responsive (1-4 columns based on screen size)
- Filter panel with difficulty and board size dropdowns
- User progress summary (if authenticated)
- Guest prompt with sign-in CTA
- Completed puzzles show checkmark and best score

### PuzzlePlay Page (`/puzzles/:id`)
- Loads puzzle with locked queens (blue rings)
- Timer starts automatically
- Stats bar updates with moves/hints/queens
- Click squares to toggle queens
- Locked queens cannot be removed
- Hint button provides suggestions (max 3)
- Reset button restores initial state
- Check Solution validates and submits
- Give Up button ends attempt

### PuzzleCompleted Page (`/puzzles/:id/completed`)
- Shows stars earned (animated)
- Performance label (Excellent/Good/Keep Practicing)
- Stats grid (time, moves, hints, stars)
- Performance analysis with time comparison
- Try Again button returns to gameplay
- More Puzzles button returns to list

---

## 📝 Next Steps

### 1. Add Puzzle Link to Navbar
```jsx
// client/src/components/Navbar.jsx
<Link to="/puzzles" className="...">
  Puzzles
</Link>
```

### 2. Test All 10 Puzzles
- Start with puzzle-001 (easiest)
- Progress through difficulties
- Try to earn 3 stars on each
- Test hint system on harder puzzles

### 3. Monitor Performance
- Check MongoDB for `puzzleattempts` collection
- Verify user stats update on completion
- Test replay functionality (try same puzzle multiple times)

### 4. Production Deployment
- Seed puzzles in production database
- Verify API endpoints accessible
- Test with real users
- Monitor completion rates

---

## 🎉 Success Criteria

You'll know everything works when:
- ✅ All 10 puzzles visible in `/puzzles`
- ✅ Filters work (difficulty, board size)
- ✅ Authenticated users can play puzzles
- ✅ Timer starts and updates every second
- ✅ Locked queens cannot be moved
- ✅ Hints provide suggestions
- ✅ Solution validation works correctly
- ✅ Stars calculated based on time
- ✅ Completion page shows results
- ✅ User progress persists across sessions
- ✅ Replay improves best scores

---

## 🆘 Need Help?

### Documentation
- **Full Guide**: `DAY6_COMPLETE.md`
- **Puzzle Details**: `PUZZLE_LIBRARY.md`
- **Scoring System**: `PUZZLE_SCORING.md`

### Common Commands
```bash
# Restart backend
cd server && npm start

# Restart frontend
cd client && npm run dev

# Re-seed puzzles
node server/seed-puzzles.js

# Check MongoDB
mongosh
> use nqueens-game
> db.predefinedpuzzles.countDocuments()  # Should be 10
> db.puzzleattempts.find().limit(5)      # View recent attempts
```

### API Testing
```bash
# Get all puzzles
curl http://localhost:5000/api/puzzles/predefined/list

# Get single puzzle
curl http://localhost:5000/api/puzzles/predefined/puzzle-001

# Start attempt (requires auth token)
curl -X POST http://localhost:5000/api/puzzles/predefined/puzzle-001/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**🎮 Ready to Play! Have fun solving puzzles! 🧩**

---

## ⏱️ Time Estimate

- Seeding puzzles: **30 seconds**
- Testing backend API: **1 minute**
- Testing frontend UI: **3 minutes**
- **Total setup time: ~5 minutes**

---

**🏆 Day 6 Complete! Enjoy the Puzzle Mode! ✨**
