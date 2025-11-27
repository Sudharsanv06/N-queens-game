# ⭐ Puzzle Scoring System

Comprehensive guide to the star-based scoring system, performance tracking, and user progress in the N-Queens Predefined Puzzle Mode.

---

## 🎯 Star Scoring Overview

The puzzle system uses a **3-star rating system** based on completion time compared to expected time. Stars incentivize replay and reward efficient solutions.

### Star Calculation Formula

```javascript
calculateStars(timeTaken, expectedMinTime) {
  if (timeTaken <= expectedMinTime) return 3;           // ⭐⭐⭐ Excellent!
  if (timeTaken <= expectedMinTime * 1.5) return 2;     // ⭐⭐ Good!
  if (timeTaken <= expectedMinTime * 2) return 1;       // ⭐ Keep trying!
  return 0;                                              // No stars (over time)
}
```

### Star Tiers

| Stars | Performance | Time Requirement | Description |
|-------|-------------|------------------|-------------|
| ⭐⭐⭐ | Excellent | ≤ Expected Time | Beat or match target time |
| ⭐⭐ | Good | ≤ 1.5x Expected | Up to 50% over target |
| ⭐ | Keep Trying | ≤ 2x Expected | Up to 100% over target |
| (No stars) | Need Practice | > 2x Expected | More than double target time |

---

## 📊 Scoring Examples

### Puzzle 001: First Steps (Expected: 30s)

| Time Taken | Stars | Performance Label | Calculation |
|------------|-------|-------------------|-------------|
| 25s | ⭐⭐⭐ | Excellent! | 25 ≤ 30 → 3 stars |
| 30s | ⭐⭐⭐ | Excellent! | 30 ≤ 30 → 3 stars |
| 40s | ⭐⭐ | Good! | 40 ≤ 45 (1.5×30) → 2 stars |
| 45s | ⭐⭐ | Good! | 45 ≤ 45 (1.5×30) → 2 stars |
| 55s | ⭐ | Keep Practicing | 55 ≤ 60 (2×30) → 1 star |
| 60s | ⭐ | Keep Practicing | 60 ≤ 60 (2×30) → 1 star |
| 70s | (none) | Need More Practice | 70 > 60 (2×30) → 0 stars |

### Puzzle 008: Classic Eight (Expected: 240s / 4 min)

| Time Taken | Stars | Performance Label | Calculation |
|------------|-------|-------------------|-------------|
| 3:30 (210s) | ⭐⭐⭐ | Excellent! | 210 ≤ 240 → 3 stars |
| 4:00 (240s) | ⭐⭐⭐ | Excellent! | 240 ≤ 240 → 3 stars |
| 5:00 (300s) | ⭐⭐ | Good! | 300 ≤ 360 (1.5×240) → 2 stars |
| 6:00 (360s) | ⭐⭐ | Good! | 360 ≤ 360 (1.5×240) → 2 stars |
| 7:00 (420s) | ⭐ | Keep Practicing | 420 ≤ 480 (2×240) → 1 star |
| 8:00 (480s) | ⭐ | Keep Practicing | 480 ≤ 480 (2×240) → 1 star |
| 9:00 (540s) | (none) | Need More Practice | 540 > 480 (2×240) → 0 stars |

### Puzzle 010: Corner Challenge (Expected: 320s / 5 min 20s)

| Time Taken | Stars | Performance Label | Calculation |
|------------|-------|-------------------|-------------|
| 5:00 (300s) | ⭐⭐⭐ | Excellent! | 300 ≤ 320 → 3 stars |
| 5:20 (320s) | ⭐⭐⭐ | Excellent! | 320 ≤ 320 → 3 stars |
| 7:00 (420s) | ⭐⭐ | Good! | 420 ≤ 480 (1.5×320) → 2 stars |
| 8:00 (480s) | ⭐⭐ | Good! | 480 ≤ 480 (1.5×320) → 2 stars |
| 9:30 (570s) | ⭐ | Keep Practicing | 570 ≤ 640 (2×320) → 1 star |
| 10:40 (640s) | ⭐ | Keep Practicing | 640 ≤ 640 (2×320) → 1 star |
| 12:00 (720s) | (none) | Need More Practice | 720 > 640 (2×320) → 0 stars |

---

## 🏆 Star Thresholds for All Puzzles

| Puzzle | Expected | 3 Stars | 2 Stars | 1 Star | 0 Stars |
|--------|----------|---------|---------|--------|---------|
| 001 | 30s | ≤ 30s | 31-45s | 46-60s | > 60s |
| 002 | 45s | ≤ 45s | 46-67s | 68-90s | > 90s |
| 003 | 60s | ≤ 60s | 61-90s | 91-120s | > 120s |
| 004 | 90s | ≤ 90s | 91-135s | 136-180s | > 180s |
| 005 | 120s | ≤ 120s | 121-180s | 181-240s | > 240s |
| 006 | 135s | ≤ 135s | 136-202s | 203-270s | > 270s |
| 007 | 180s | ≤ 180s | 181-270s | 271-360s | > 360s |
| 008 | 240s | ≤ 240s | 241-360s | 361-480s | > 480s |
| 009 | 300s | ≤ 300s | 301-450s | 451-600s | > 600s |
| 010 | 320s | ≤ 320s | 321-480s | 481-640s | > 640s |

---

## 📈 User Progress Tracking

### Individual Puzzle Progress

For each puzzle, the system tracks:

```javascript
userProgress: {
  puzzleId: "puzzle-001",
  completed: true,              // Has user completed this puzzle?
  bestTime: 28,                 // Best time in seconds
  bestStars: 3,                 // Best star rating achieved
  totalAttempts: 5,             // Number of attempts
  attemptHistory: [             // All attempts
    { timeTaken: 35, stars: 2, solved: true },
    { timeTaken: 28, stars: 3, solved: true },
    { timeTaken: 50, stars: 1, solved: true },
    { timeTaken: 120, stars: 0, solved: false }, // gave up
    { timeTaken: 29, stars: 3, solved: true }
  ]
}
```

### Overall User Progress

Aggregated stats across all puzzles:

```javascript
overallProgress: {
  totalPuzzles: 10,              // Total available puzzles
  totalCompleted: 7,             // Puzzles completed at least once
  completionRate: 70,            // Percentage (7/10 * 100)
  totalStars: 18,                // Sum of best stars per puzzle
  averageStars: 2.57,            // Average stars (18/7)
  totalAttempts: 25,             // All attempts across all puzzles
  
  // Breakdown by difficulty
  breakdown: {
    easy: {
      total: 3,                  // Total easy puzzles
      completed: 3,              // Completed easy puzzles
      stars: 9,                  // Stars earned in easy
      completionRate: 100        // 3/3 * 100
    },
    medium: {
      total: 3,
      completed: 3,
      stars: 6,
      completionRate: 100
    },
    hard: {
      total: 2,
      completed: 1,
      stars: 2,
      completionRate: 50
    },
    expert: {
      total: 2,
      completed: 0,
      stars: 0,
      completionRate: 0
    }
  },
  
  // Recent activity
  recentAttempts: [
    { puzzleId: "puzzle-007", stars: 2, timeTaken: 200, ... },
    { puzzleId: "puzzle-006", stars: 3, timeTaken: 130, ... },
    ...
  ]
}
```

---

## 🎯 Performance Metrics

### Performance Labels

The system provides contextual feedback based on time ratios:

```javascript
getPerformanceLabel(timeTaken, expectedTime) {
  const ratio = timeTaken / expectedTime;
  
  if (ratio <= 1.0) return { text: "Excellent!", color: "green" };
  if (ratio <= 1.5) return { text: "Good!", color: "yellow" };
  if (ratio <= 2.0) return { text: "Keep Practicing", color: "orange" };
  return { text: "Need More Practice", color: "red" };
}
```

### Time Comparison Display

On the completion screen:

```
Your Time:      1:28 (88 seconds)
Expected Time:  1:20 (80 seconds)
Performance:    Good! (⭐⭐)

You took 10% longer than expected.
```

Or for faster completion:

```
Your Time:      1:05 (65 seconds)
Expected Time:  1:20 (80 seconds)
Performance:    Excellent! (⭐⭐⭐)

You were 19% faster than expected!
```

---

## 📊 Leaderboard & Rankings

### Best Times per Puzzle

Each puzzle maintains a global leaderboard:

```javascript
puzzleStats: {
  totalAttempts: 1547,           // All attempts by all users
  completions: 892,              // Successful completions
  completionRate: 57.7,          // 892/1547 * 100
  averageTime: 42,               // Average completion time
  fastestTime: 18,               // World record time
  
  topPerformers: [
    { username: "speedster123", time: 18, stars: 3 },
    { username: "queenmaster", time: 20, stars: 3 },
    { username: "logicpro", time: 22, stars: 3 },
    ...
  ]
}
```

### User Rankings

Users can be ranked by:
1. **Total Stars**: Sum of best stars across all puzzles (max 30)
2. **Completion Rate**: Percentage of puzzles completed
3. **Average Stars**: Average stars per completed puzzle
4. **Total Time**: Sum of best times across all puzzles
5. **First Completions**: Who completed each puzzle first

---

## 🎮 Gameplay Mechanics

### Timer Behavior

**Timer Starts:**
- Automatically when PuzzlePlay page loads
- Uses `startPuzzleAttempt` API to create attempt record
- Tracks elapsed time with 1-second updates

**Timer Display:**
- Green: On track for 3 stars (≤ expected)
- Yellow: On track for 2 stars (≤ 1.5x expected)
- Orange: On track for 1 star (≤ 2x expected)
- Red: Over 2x expected time (0 stars)

**Timer Pauses:**
- Does NOT pause (encourages focus)
- Only stops when:
  - User clicks "Check Solution" (correct)
  - User clicks "Give Up"

### Move Tracking

**What Counts as a Move:**
- Placing a queen on an empty square
- Removing a queen from a square
- Clicking "Reset Board" (counts as 1 move)

**Move Counter Display:**
```
Moves: 12
```

### Hint System

**Hint Mechanics:**
- Maximum 3 hints per puzzle (configurable in puzzle definition)
- Hint counter shows: "2 / 3" (used / available)
- Clicking "Get Hint" when maxed out shows error toast
- Hints provide suggestions like: "Try row 3, column 5"

**Hint Algorithm:**
1. Find all current queens on board
2. Search for empty safe squares (no conflicts)
3. Suggest first safe square found
4. If no safe squares, show generic message

**Hint Tracking:**
- Hints used stored in attempt record
- Displayed on completion screen
- Does NOT affect star rating (only time matters)

---

## 💾 Data Persistence

### PuzzleAttempt Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User
  puzzleId: "puzzle-001",        // Reference to PredefinedPuzzle
  startTime: Date,               // When attempt started
  endTime: Date,                 // When attempt ended (null if in progress)
  timeTaken: 28,                 // Seconds elapsed
  solved: true,                  // Completed successfully?
  stars: 3,                      // 0-3 stars earned
  movesUsed: 8,                  // Total moves made
  hintsUsed: 1,                  // Hints requested
  boardState: {
    queens: [                    // Final queen positions
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      ...
    ],
    lockedQueens: [              // Initial locked queens
      { row: 0, col: 1 },
      { row: 2, col: 3 }
    ]
  },
  status: "completed",           // "in_progress", "completed", "gave_up"
  createdAt: Date,
  updatedAt: Date
}
```

### Puzzle Stats Updates

When an attempt is completed, the system updates:

**PredefinedPuzzle.stats:**
```javascript
stats: {
  totalAttempts: 1547,           // Incremented on attempt start
  completions: 892,              // Incremented on successful completion
  averageTime: 42,               // Recalculated: sum(times) / completions
  fastestTime: 18                // Updated if new time is faster
}
```

**User.stats:**
```javascript
stats: {
  totalGames: 125,               // Incremented on completion
  fastestSolveTime: 18,          // Updated if puzzle time is faster
  highestBoardSizeSolved: 8      // Updated if puzzle.n is larger
}
```

---

## 🔄 Retry & Replay System

### Best Score Tracking

Users can replay puzzles to improve their star rating:

**Scenario 1: First Completion**
- Time: 40s on puzzle-001 (expected: 30s)
- Stars: 2 ⭐⭐
- Stored as best score

**Scenario 2: Retry (Worse Score)**
- Time: 50s on puzzle-001
- Stars: 1 ⭐
- Best score remains 2 stars (not updated)

**Scenario 3: Retry (Better Score)**
- Time: 28s on puzzle-001
- Stars: 3 ⭐⭐⭐
- Best score updated to 3 stars!

### Attempt History

All attempts are saved:
```javascript
attemptHistory: [
  { timeTaken: 40, stars: 2, solved: true, date: "2025-01-10" },
  { timeTaken: 50, stars: 1, solved: true, date: "2025-01-11" },
  { timeTaken: 28, stars: 3, solved: true, date: "2025-01-12" } // NEW BEST!
]
```

User can view full history in profile/stats page.

---

## 📱 UI Indicators

### PuzzleCard (List View)

**Completed Puzzle:**
```
┌─────────────────────────┐
│ ✅ First Steps         │
│ Puzzle #001             │
│                         │
│ Board: 4x4              │
│ Locked: 2 queens        │
│ Expected: 30s           │
│                         │
│ Your Best: 28s          │
│ Stars: ⭐⭐⭐          │
│                         │
│ [▶ Play Again]         │
└─────────────────────────┘
```

**Incomplete Puzzle:**
```
┌─────────────────────────┐
│ Diagonal Dilemma        │
│ Puzzle #004             │
│                         │
│ Board: 5x5              │
│ Locked: 1 queen         │
│ Expected: 90s           │
│                         │
│ [▶ Play]               │
└─────────────────────────┘
```

### PuzzleTimer (Gameplay)

**Timer Display:**
```
⏱️ 00:28
━━━━━━━━━━━━━━░░░░░░ 93%
⭐⭐⭐ Excellent!
```

Colors:
- 🟢 Green background: On pace for 3 stars
- 🟡 Yellow background: On pace for 2 stars
- 🟠 Orange background: On pace for 1 star
- 🔴 Red background: Over 2x expected

### PuzzleStatsBar (Gameplay)

```
┌──────────────────────────────┐
│ 🎯 Moves: 8                  │
│ 💡 Hints: 1 / 3              │
│ 👑 Queens: 3 / 4             │
│                              │
│ ━━━━━━━━━━━━░░░░░░░░ 75%   │
└──────────────────────────────┘
```

### PuzzleCompleted (Results)

```
┌─────────────────────────────┐
│       🏆 Puzzle Solved!     │
│       First Steps           │
│                             │
│      ⭐ ⭐ ⭐              │
│        Excellent!           │
│                             │
│ ⏱️ Time: 00:28             │
│    Target: 00:30            │
│                             │
│ 🎯 Moves: 8                │
│ 💡 Hints: 1 / 3            │
│ ⭐ Stars: 3 / 3            │
│                             │
│ You were 7% faster! 🚀     │
│                             │
│ [🔄 Try Again] [➡️ More]  │
└─────────────────────────────┘
```

---

## 🎯 Achievement Ideas

### Star-Based Achievements

- **First Star**: Earn your first star
- **Triple Crown**: Get 3 stars on any puzzle
- **Star Collector**: Earn 15 total stars
- **Half Full**: Earn 15/30 stars
- **Perfect Score**: Earn all 30 stars
- **Golden Standard**: Get 3 stars on all Easy puzzles
- **Silver Master**: Get 3 stars on all Medium puzzles
- **Bronze Champion**: Get 3 stars on all Hard puzzles
- **Platinum Legend**: Get 3 stars on all Expert puzzles

### Speed-Based Achievements

- **Speed Demon**: Complete any puzzle in half the expected time
- **Lightning Fast**: Complete puzzle-001 in under 15 seconds
- **Time Master**: Beat expected time on 5 puzzles
- **Efficiency Expert**: Complete all puzzles beating expected time

### Completion-Based Achievements

- **First Steps**: Complete first puzzle
- **Explorer**: Complete 3 puzzles
- **Adventurer**: Complete 5 puzzles
- **Master**: Complete 7 puzzles
- **Completionist**: Complete all 10 puzzles
- **Expert Conqueror**: Complete both expert puzzles
- **No Hints Needed**: Complete 5 puzzles without using hints
- **Minimalist**: Complete any puzzle with fewer than 10 moves

---

## 📊 Analytics & Insights

### Player Performance Analysis

**Time-to-Star Distribution:**
```
3 Stars: 35% of completions
2 Stars: 40% of completions
1 Star:  20% of completions
0 Stars: 5% of completions
```

**Average Attempts Before First Completion:**
```
Easy:    1.2 attempts
Medium:  2.1 attempts
Hard:    3.5 attempts
Expert:  5.2 attempts
```

**Hint Usage Patterns:**
```
0 hints: 45% of completions (expert players)
1 hint:  30% of completions
2 hints: 15% of completions
3 hints: 10% of completions (beginners)
```

### Puzzle Difficulty Calibration

Puzzles are calibrated so:
- **Easy**: 90% of players complete on first try
- **Medium**: 70% of players complete on first try
- **Hard**: 40% of players complete on first try
- **Expert**: 20% of players complete on first try

If actual completion rates differ significantly, puzzle difficulty or expected times can be adjusted.

---

## 🔧 Tuning & Balancing

### Adjusting Expected Times

If puzzle-001 shows:
- Average completion time: 45s
- Expected time: 30s
- 3-star rate: 10% (too low!)

**Solution**: Increase expected time to 40s for better balance.

### Adjusting Star Thresholds

Current thresholds:
- 3 stars: ≤ 1.0x expected
- 2 stars: ≤ 1.5x expected
- 1 star: ≤ 2.0x expected

Alternative (easier):
- 3 stars: ≤ 1.2x expected
- 2 stars: ≤ 1.8x expected
- 1 star: ≤ 2.5x expected

### Hint Limit Tuning

- Easy puzzles: 5 hints (more forgiving)
- Medium puzzles: 3 hints (balanced)
- Hard puzzles: 2 hints (challenging)
- Expert puzzles: 1 hint (minimal help)

---

## 💡 Best Practices for Players

### Earning 3 Stars

1. **Know the Rules**: Understand N-Queens constraints thoroughly
2. **Plan Ahead**: Think 2-3 moves ahead
3. **Use Hints Wisely**: Hints don't affect stars, use them early if stuck
4. **Practice**: Replay puzzles to learn patterns
5. **Stay Calm**: Rushing leads to mistakes and slower times

### Optimal Strategy

**Phase 1: Analysis (5-10s)**
- Identify locked queens
- Count rows/columns with constraints
- Plan first 1-2 placements

**Phase 2: Execution (15-20s)**
- Place queens systematically (row by row or column by column)
- Check conflicts before clicking
- Use hints if stuck for >10 seconds

**Phase 3: Validation (2-5s)**
- Quick visual scan for conflicts
- Click "Check Solution"

**Total Time**: 22-35s for puzzle-001 (Expected: 30s) = ⭐⭐⭐

---

## 🏁 Conclusion

The star scoring system provides:
- **Clear Goals**: 3-star system is intuitive
- **Replayability**: Encourages retries to improve scores
- **Fair Challenge**: Expected times calibrated for average players
- **Progress Tracking**: Comprehensive stats and history
- **Motivation**: Visual feedback and achievements

**Maximum Score**: 30 stars (3 × 10 puzzles)  
**Target Completion Rate**: 70% of players complete all Easy/Medium puzzles  
**Target 3-Star Rate**: 35-40% of completions earn 3 stars

---

**⭐ Happy Star Collecting! ⭐**
