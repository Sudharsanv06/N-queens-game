# 📈 XP & LEVELING SYSTEM - COMPLETE DOCUMENTATION

## 📋 **OVERVIEW**

The XP (Experience Points) and Leveling system provides progression mechanics that reward player activity across all game modes. Players earn XP through achievements, milestones, and game completions, which contribute to level advancement.

---

## 🎯 **CORE MECHANICS**

### **XP Formula:**
```javascript
XP Required for Next Level = (currentLevel + 1)² × 50
```

### **Example Calculation:**
- **Level 1 → Level 2:** (1 + 1)² × 50 = **200 XP**
- **Level 2 → Level 3:** (2 + 1)² × 50 = **450 XP**
- **Level 3 → Level 4:** (3 + 1)² × 50 = **800 XP**
- **Level 10 → Level 11:** (10 + 1)² × 50 = **6,050 XP**

### **Progression Type:**
**Polynomial (Quadratic)** - XP requirements increase exponentially, creating meaningful long-term progression.

---

## 📊 **LEVEL PROGRESSION TABLE**

| Level | XP for Next Level | Total XP Needed | Cumulative XP |
|-------|-------------------|-----------------|---------------|
| 1 | 200 | 0 | 0 |
| 2 | 450 | 200 | 200 |
| 3 | 800 | 650 | 650 |
| 4 | 1,250 | 1,450 | 1,450 |
| 5 | 1,800 | 2,700 | 2,700 |
| 6 | 2,450 | 4,500 | 4,500 |
| 7 | 3,200 | 6,950 | 6,950 |
| 8 | 4,050 | 10,150 | 10,150 |
| 9 | 5,000 | 14,200 | 14,200 |
| 10 | 6,050 | 19,200 | 19,200 |
| 11 | 7,200 | 25,250 | 25,250 |
| 12 | 8,450 | 32,450 | 32,450 |
| 13 | 9,800 | 40,900 | 40,900 |
| 14 | 11,250 | 50,700 | 50,700 |
| 15 | 12,800 | 61,950 | 61,950 |
| 20 | 22,050 | 148,450 | 148,450 |
| 25 | 33,800 | 306,200 | 306,200 |
| 30 | 48,050 | 528,200 | 528,200 |
| 40 | 84,050 | 1,270,200 | 1,270,200 |
| 50 | 130,050 | 2,520,200 | 2,520,200 |

---

## 💰 **XP SOURCES**

### **1. Achievements (Primary Source)**
XP awards range from 25 to 500 based on achievement tier:

| Achievement Tier | XP Range | Example |
|-----------------|----------|---------|
| Bronze | 25-75 | First Steps (+25 XP) |
| Silver | 75-150 | Strategic Mind (+100 XP) |
| Gold | 150-300 | Deep Solver (+150 XP) |
| Platinum | 300-500 | Grandmaster (+500 XP) |

**Total Available from Achievements:** ~2,475 XP (18 achievements)

### **2. Milestones (Bonus Source)**
Milestones provide XP bonuses for major accomplishments:

| Milestone | Trigger | XP Reward |
|-----------|---------|-----------|
| Level 5 Reached | Reach level 5 | +100 XP |
| 25 Puzzles Solved | Solve 25 puzzles | +250 XP |
| 100 Queens Placed | Place 100 queens | +200 XP |
| 1000 Moves Made | 1000 total moves | +300 XP |
| 10 Achievements | Unlock 10 achievements | +500 XP |

**Total Available from Milestones:** ~1,350 XP (5 milestones)

### **3. Game Completions (Future)**
Planned XP rewards for game completions:
- Classic Mode: 10-20 XP per game
- Puzzle Mode: 15-30 XP per puzzle
- Time Trial: 25-50 XP per session

### **4. Daily Bonuses (Future)**
- Daily Login: +50 XP
- First Game of Day: +25 XP
- 7-Day Streak: +200 XP

---

## 🎖️ **LEVELING MECHANICS**

### **Level-Up Process:**

```javascript
// When user earns XP
UserXP.addXP(xpAmount) {
  this.currentXP += xpAmount
  this.totalXP += xpAmount
  
  // Check for level up
  while (this.currentXP >= this.xpToNextLevel) {
    this.currentXP -= this.xpToNextLevel
    this.level += 1
    this.xpToNextLevel = this.calculateXPForNextLevel()
    
    // Trigger level-up event
    emit('level_up', { level: this.level })
  }
  
  await this.save()
}
```

### **calculateXPForNextLevel():**
```javascript
calculateXPForNextLevel() {
  return Math.pow(this.level + 1, 2) * 50
}
```

### **getLevelProgress():**
```javascript
getLevelProgress() {
  if (this.xpToNextLevel === 0) return 0
  return Math.floor((this.currentXP / this.xpToNextLevel) * 100)
}
```

---

## 🎨 **UI COMPONENTS**

### **1. XP Progress Bar**

**Location:** Navbar, Profile page  
**Component:** `XPProgressBar.jsx`

**Display Elements:**
- Current level (large number)
- Current XP / XP to next level
- Progress bar with shimmer effect
- Percentage to next level

**Example:**
```
Level 5
─────────────────■■■■■■■■■■□□□□□□
1,250 / 1,800 XP (69%)
```

**Tailwind Styling:**
```javascript
<div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
    style={{ width: `${progress}%` }}
  >
    <div className="absolute inset-0 shimmer-effect" />
  </div>
</div>
```

---

### **2. Level-Up Modal**

**Location:** Full-screen overlay  
**Component:** `LevelUpModal.jsx`  
**Trigger:** Automatically when user levels up

**Display Elements:**
- Confetti animation (canvas-confetti)
- Large level badge
- Congratulations message
- Stats summary (total XP, achievements, badges)
- "Continue" button

**Animation Sequence:**
1. Modal slides in from center
2. Confetti explodes
3. Level badge scales up + rotates
4. Stats fade in sequentially
5. Auto-dismiss after 5s or click "Continue"

**Dependencies:**
```bash
npm install canvas-confetti
```

**Example:**
```javascript
import confetti from 'canvas-confetti'

const fireConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
}
```

---

### **3. XP Leaderboard**

**Location:** `/rewards/xp/leaderboard` (future page)  
**Display:** Top 100 players by total XP

**Columns:**
- Rank (#1, #2, #3, etc.)
- Username
- Level
- Total XP
- Equipped badge (if any)

**Sorting:** Total XP (descending)

---

## 📈 **LEVEL MILESTONES**

### **Level-Based Rewards:**

| Level | Reward | Description |
|-------|--------|-------------|
| 5 | +100 XP | Level 5 milestone |
| 10 | Badge unlock | Special "Level 10" badge (future) |
| 15 | Profile frame | Bronze profile frame (future) |
| 20 | Title unlock | "Expert Solver" title (future) |
| 25 | Profile frame | Silver profile frame (future) |
| 30 | Badge unlock | Special "Level 30" badge (future) |
| 40 | Profile frame | Gold profile frame (future) |
| 50 | Title unlock | "Legendary Solver" title (future) |

---

## 🔄 **XP TRACKING LIFECYCLE**

### **Backend Flow:**

1. **User Completes Action** (e.g., unlocks achievement)
2. **Achievement Engine Awards XP:**
   ```javascript
   achievementEngine.awardXP(userId, xpAmount)
   ```
3. **UserXP Model Updates:**
   - Adds XP to currentXP and totalXP
   - Checks for level up
   - Calculates new xpToNextLevel
   - Emits level-up event if applicable
4. **Response Sent to Frontend:**
   ```json
   {
     "xpAwarded": 150,
     "levelUp": true,
     "newLevel": 6,
     "currentXP": 250,
     "xpToNextLevel": 2450,
     "totalXP": 4750
   }
   ```

### **Frontend Flow:**

1. **Redux Action Dispatched:**
   ```javascript
   dispatch(updateLocalXP({ xpAwarded, levelUp, newLevel }))
   ```
2. **XP Slice Updates State:**
   - Updates currentXP, level, xpToNextLevel
   - Adds level-up to queue if `levelUp === true`
3. **NotificationManager Detects Level-Up:**
   - Displays LevelUpModal with confetti
   - Marks level-up as shown
4. **UI Updates:**
   - XP progress bar animates
   - Level number updates
   - Leaderboard refreshes (if open)

---

## 🎯 **INTEGRATION POINTS**

### **Hook: useXPTracker**

```javascript
import { useXPTracker } from '@/hooks/useXPTracker'

const { 
  handleXPGain, 
  showNextNotification,
  currentLevel,
  currentXP,
  xpToNextLevel,
  levelProgress
} = useXPTracker()

// Trigger XP gain
handleXPGain(150) // Awards 150 XP

// Display next notification
showNextNotification()
```

### **Achievement Integration:**

```javascript
// After unlocking achievement with XP reward
const response = await achievementEngine.unlockAchievement(userId, achievement)

if (response.xpAwarded) {
  // XP automatically added by backend
  // Frontend receives updated XP data
  dispatch(updateLocalXP(response.xp))
  
  if (response.xp.levelUp) {
    dispatch(addLevelUp({ level: response.xp.newLevel }))
  }
}
```

---

## 🧪 **TESTING SCENARIOS**

### **Test 1: First XP Gain**
1. Start new account (Level 1, 0 XP)
2. Complete "First Steps" achievement (+25 XP)
3. **Expected:** XP bar updates to 25/200 (12.5%)
4. **Expected:** Level remains 1
5. **Expected:** No level-up modal

### **Test 2: Level-Up to Level 2**
1. Start with 150 XP at Level 1
2. Unlock achievement (+50 XP)
3. **Expected:** Total XP = 200
4. **Expected:** Level-up to Level 2
5. **Expected:** Confetti modal appears
6. **Expected:** currentXP = 0, xpToNextLevel = 450

### **Test 3: Multiple Level-Ups**
1. Start with 0 XP at Level 1
2. Award 2,700 XP (enough for Level 5)
3. **Expected:** Level-up to Level 5
4. **Expected:** currentXP = 0, xpToNextLevel = 1800
5. **Expected:** Modal shows "Level 5 Reached!"

### **Test 4: XP Progress Bar Animation**
1. Open game with XP bar visible
2. Complete achievement (+150 XP)
3. **Expected:** Progress bar smoothly animates
4. **Expected:** XP fraction updates (e.g., 350/450)
5. **Expected:** Percentage updates (e.g., 78%)

### **Test 5: Level-Up Queue**
1. Earn enough XP for 2 level-ups simultaneously
2. **Expected:** First level-up modal appears
3. **Expected:** After dismissal, second modal appears
4. **Expected:** Both level-ups processed sequentially

---

## 📊 **PROGRESSION ANALYSIS**

### **Time to Level (Estimated):**

Assuming average XP gain per hour: ~200 XP/hour (casual play)

| Level | Hours Played | Days (1hr/day) |
|-------|--------------|----------------|
| 5 | 13.5 | 14 |
| 10 | 96 | 96 |
| 15 | 309.8 | 310 |
| 20 | 742.3 | 742 |
| 30 | 2,641 | 2,641 |
| 50 | 12,601 | 12,601 |

**Note:** These estimates assume no game completion XP. With game XP, progression is faster.

### **Achievement Coverage:**

| Achievements Completed | Total XP Earned | Approximate Level |
|------------------------|-----------------|-------------------|
| 3 (all Bronze) | 150 | 1 |
| 6 (Bronze + Silver) | 500 | 2 |
| 10 (Bronze + Silver + some Gold) | 1,200 | 3-4 |
| 15 (Most achievements) | 2,000 | 5 |
| 18 (All achievements) | 2,475 | 6 |

---

## 🎨 **UI/UX GUIDELINES**

### **XP Progress Bar:**
- **Height:** 16px (h-4)
- **Border Radius:** Full rounded
- **Background:** Dark gray (bg-gray-700)
- **Fill:** Blue-to-purple gradient
- **Animation:** Transition-all duration-500
- **Shimmer:** Diagonal animated gradient overlay

### **Level Display:**
- **Font Size:** Large (text-3xl)
- **Font Weight:** Bold (font-bold)
- **Color:** White text with purple glow
- **Icon:** 🎖️ or custom level badge

### **Level-Up Modal:**
- **Size:** Full-screen overlay
- **Background:** Semi-transparent dark (bg-black/80)
- **Card:** Centered 500x400px card
- **Animation:** Scale + fade in
- **Confetti:** 100 particles, 70° spread
- **Auto-Dismiss:** 5 seconds

### **XP Notifications:**
- **Format:** "+150 XP" in green text
- **Position:** Top-right corner
- **Duration:** 2 seconds
- **Animation:** Slide in from right, fade out

---

## 🔮 **FUTURE ENHANCEMENTS**

1. **XP Boosters** - 2x XP events or consumables
2. **Level Prestige** - Reset to Level 1 with prestige badge
3. **XP Leaderboard Page** - Dedicated leaderboard UI
4. **Level Titles** - Unlock titles at specific levels
5. **Profile Frames** - Decorative borders at milestones
6. **XP Gifting** - Send XP to friends (multiplayer)
7. **Battle Pass** - Seasonal XP tracks with rewards
8. **XP Decay** (optional) - Encourage continued play
9. **XP Predictions** - Estimate time to next level
10. **Custom Level Badges** - Unique icons for levels 25, 50, 100

---

## 🔧 **BACKEND IMPLEMENTATION**

### **UserXP Model:**
```javascript
const UserXPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentXP: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xpToNextLevel: { type: Number, default: 200 }
}, { timestamps: true })

UserXPSchema.methods.calculateXPForNextLevel = function() {
  return Math.pow(this.level + 1, 2) * 50
}

UserXPSchema.methods.addXP = async function(xpAmount) {
  this.currentXP += xpAmount
  this.totalXP += xpAmount
  
  const levelUps = []
  
  while (this.currentXP >= this.xpToNextLevel) {
    this.currentXP -= this.xpToNextLevel
    this.level += 1
    this.xpToNextLevel = this.calculateXPForNextLevel()
    levelUps.push(this.level)
  }
  
  await this.save()
  return { levelUps, newLevel: this.level, currentXP: this.currentXP, xpToNextLevel: this.xpToNextLevel }
}

UserXPSchema.methods.getLevelProgress = function() {
  if (this.xpToNextLevel === 0) return 0
  return Math.floor((this.currentXP / this.xpToNextLevel) * 100)
}
```

### **API Endpoints:**
- `GET /api/rewards/xp` - Get user XP data
- `GET /api/rewards/xp/leaderboard` - Get top 100 players
- `GET /api/rewards/progress` - Get detailed progress (XP, achievements, badges)

---

## 📚 **RELATED DOCUMENTATION**

- **DAY7_COMPLETE.md** - Complete implementation guide
- **ACHIEVEMENT_LIST.md** - Achievement specifications
- **BADGE_LIST.md** - Badge system documentation
- **ACHIEVEMENT_ENGINE.md** - Engine architecture

---

**📈 The XP & Leveling system provides polynomial progression with level-up celebrations and comprehensive tracking!**
