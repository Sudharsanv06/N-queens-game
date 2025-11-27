# 🛡️ BADGE SYSTEM - COMPLETE DOCUMENTATION

## 📋 **OVERVIEW**

Total Badges: **12**  
Tiers: **4** (Bronze, Silver, Gold, Platinum)  
Rarity Levels: **4** (Common, Rare, Epic, Legendary)  
Categories: **4** (Progress, Performance, Puzzle, Special)

---

## 🎖️ **BADGE TIERS & RARITY**

| Tier | Icon | Color | Rarity Levels | Badge Count |
|------|------|-------|---------------|-------------|
| Bronze | 🥉 | Orange/Brown | Common | 2 |
| Silver | 🥈 | Silver/Gray | Rare | 2 |
| Gold | 🥇 | Gold/Yellow | Epic | 5 |
| Platinum | 💎 | Purple/Diamond | Legendary | 2 |

### **Rarity Definitions:**
- **Common (Bronze):** Easily obtainable for beginners
- **Rare (Silver):** Requires consistent play
- **Epic (Gold):** Requires skill and dedication
- **Legendary (Platinum):** Extremely challenging milestones

---

## 🥉 **BRONZE BADGES (2 Total)**

### **1. Bronze Solver** 🥉
- **Badge ID:** `bronze_solver`
- **Name:** Bronze Solver
- **Description:** Awarded for placing 50 queens
- **Icon:** 🥉
- **Tier:** Bronze
- **Category:** Progress
- **Rarity:** Common
- **Unlock Condition:**
  - Achievement: `sharp_thinker`
  - Requirement: Place 50 queens across all games
- **Unlock Trigger:** Automatically awarded when "Sharp Thinker" achievement is completed
- **Display:** Orange/brown gradient background

---

### **2. Bronze Speedster** 🥉⚡
- **Badge ID:** `bronze_speed`
- **Name:** Bronze Speedster
- **Description:** Awarded for solving under 60 seconds
- **Icon:** 🥉⚡
- **Tier:** Bronze
- **Category:** Performance
- **Rarity:** Common
- **Unlock Condition:**
  - Achievement: `speed_starter`
  - Requirement: Complete a game in ≤60 seconds
- **Unlock Trigger:** Automatically awarded when "Speed Starter" achievement is completed
- **Display:** Orange/brown gradient with lightning bolt

---

## 🥈 **SILVER BADGES (2 Total)**

### **3. Silver Solver** 🥈
- **Badge ID:** `silver_solver`
- **Name:** Silver Solver
- **Description:** Awarded for completing 10 games
- **Icon:** 🥈
- **Tier:** Silver
- **Category:** Progress
- **Rarity:** Rare
- **Unlock Condition:**
  - Achievement: `strategic_mind`
  - Requirement: Complete 10 N-Queens games
- **Unlock Trigger:** Automatically awarded when "Strategic Mind" achievement is completed
- **Display:** Silver/gray gradient background

---

### **4. Puzzle Solver** 🥈🧩
- **Badge ID:** `puzzle_solver`
- **Name:** Puzzle Solver
- **Description:** Awarded for solving 6 puzzles
- **Icon:** 🥈🧩
- **Tier:** Silver
- **Category:** Puzzle
- **Rarity:** Rare
- **Unlock Condition:**
  - Achievement: `puzzle_adept`
  - Requirement: Solve 6 predefined puzzles
- **Unlock Trigger:** Automatically awarded when "Puzzle Adept" achievement is completed
- **Display:** Silver gradient with puzzle piece icon

---

## 🥇 **GOLD BADGES (5 Total)**

### **5. Gold Solver** 🥇
- **Badge ID:** `gold_solver`
- **Name:** Gold Solver
- **Description:** Awarded for completing 20 games
- **Icon:** 🥇
- **Tier:** Gold
- **Category:** Progress
- **Rarity:** Epic
- **Unlock Condition:**
  - Achievement: `deep_solver`
  - Requirement: Complete 20 N-Queens games
- **Unlock Trigger:** Automatically awarded when "Deep Solver" achievement is completed
- **Display:** Gold/yellow gradient background

---

### **6. Gold Speedster** 🥇⚡
- **Badge ID:** `gold_speed`
- **Name:** Gold Speedster
- **Description:** Awarded for solving under 30 seconds
- **Icon:** 🥇⚡
- **Tier:** Gold
- **Category:** Performance
- **Rarity:** Epic
- **Unlock Condition:**
  - Achievement: `lightning_solver`
  - Requirement: Complete a game in ≤30 seconds
- **Unlock Trigger:** Automatically awarded when "Lightning Solver" achievement is completed
- **Display:** Gold gradient with lightning bolt

---

### **7. Puzzle Master** 🥇🧩
- **Badge ID:** `puzzle_master`
- **Name:** Puzzle Master
- **Description:** Awarded for solving all puzzles
- **Icon:** 🥇🧩
- **Tier:** Gold
- **Category:** Puzzle
- **Rarity:** Epic
- **Unlock Condition:**
  - Achievement: `puzzle_expert`
  - Requirement: Solve all 10 predefined puzzles
- **Unlock Trigger:** Automatically awarded when "Puzzle Expert" achievement is completed
- **Display:** Gold gradient with puzzle icon

---

### **8. Efficiency Master** 🥇💯
- **Badge ID:** `efficiency_master`
- **Name:** Efficiency Master
- **Description:** Awarded for 5 zero-hint solves
- **Icon:** 🥇💯
- **Tier:** Gold
- **Category:** Performance
- **Rarity:** Epic
- **Unlock Condition:**
  - Achievement: `efficiency_pro`
  - Requirement: Complete 5 games with zero hints
- **Unlock Trigger:** Automatically awarded when "Efficiency Pro" achievement is completed
- **Display:** Gold gradient with 100 emoji

---

### **9. Streak Master** 🔥
- **Badge ID:** `streak_master`
- **Name:** Streak Master
- **Description:** Awarded for 7-day play streak
- **Icon:** 🔥
- **Tier:** Gold
- **Category:** Special
- **Rarity:** Epic
- **Unlock Condition:**
  - Achievement: `dedicated_player`
  - Requirement: Play for 7 consecutive days
- **Unlock Trigger:** Automatically awarded when "Dedicated Player" achievement is completed
- **Display:** Gold gradient with fire emoji

---

## 💎 **PLATINUM BADGES (2 Total)**

### **10. Grandmaster** 💎
- **Badge ID:** `grandmaster`
- **Name:** Grandmaster
- **Description:** Awarded for completing 50 games
- **Icon:** 💎
- **Tier:** Platinum
- **Category:** Progress
- **Rarity:** Legendary
- **Unlock Condition:**
  - Achievement: `grandmaster`
  - Requirement: Complete 50 N-Queens games
- **Unlock Trigger:** Automatically awarded when "Grandmaster" achievement is completed
- **Display:** Purple/diamond gradient background
- **Prestige:** Ultimate progress badge

---

### **11. Star Champion** 💎⭐
- **Badge ID:** `star_champion`
- **Name:** Star Champion
- **Description:** Awarded for earning 30 stars
- **Icon:** 💎⭐
- **Tier:** Platinum
- **Category:** Puzzle
- **Rarity:** Legendary
- **Unlock Condition:**
  - Achievement: `supreme_star_master`
  - Requirement: Earn 30 puzzle stars (3★ on all 10 puzzles)
- **Unlock Trigger:** Automatically awarded when "Supreme Star Master" achievement is completed
- **Display:** Purple gradient with star
- **Prestige:** Ultimate puzzle mastery badge

---

## 🎨 **BADGE DESIGN SYSTEM**

### **Tier Colors:**
```javascript
const tierColors = {
  bronze: {
    gradient: 'from-orange-600 to-orange-800',
    border: 'border-orange-500',
    glow: 'shadow-orange-500/50'
  },
  silver: {
    gradient: 'from-gray-300 to-gray-500',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50'
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/50'
  },
  platinum: {
    gradient: 'from-purple-500 to-purple-700',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50'
  }
}
```

### **Locked State:**
- **Overlay:** Semi-transparent dark overlay
- **Icon:** 🔒 Lock icon displayed
- **Text:** "LOCKED" in uppercase
- **Interaction:** Click shows unlock requirements

### **Equipped State:**
- **Border:** Thick animated gradient border
- **Badge:** "EQUIPPED" tag displayed
- **Glow:** Enhanced glow effect
- **Icon:** ✓ Checkmark badge

---

## 🎯 **BADGE MECHANICS**

### **1. Automatic Awarding**
Badges are automatically awarded when linked achievements are unlocked:

```javascript
// Example: User completes "Sharp Thinker" achievement
achievementEngine.unlockAchievement(userId, achievement) {
  // Create UserAchievement record
  // Check if achievement has rewardBadgeId
  if (achievement.rewardBadgeId) {
    await achievementEngine.awardBadge(userId, achievement.rewardBadgeId)
  }
}
```

### **2. Equip Functionality**
Users can equip one badge at a time:
- **Display Location:** User profile, leaderboard, game sessions
- **Equip Action:** Click "Equip" button on badge card
- **Unequip:** Equip a different badge or click "Unequip"
- **Default:** No badge equipped initially

```javascript
// Equip badge
dispatch(equipBadge(badgeId))

// Backend updates UserBadge.isEquipped = true
// Sets all other badges to isEquipped = false
```

### **3. Collection Tracking**
- **Total Badges:** 12
- **Earned Count:** Number of badges user has unlocked
- **Collection Rate:** `(earned / total) × 100`
- **Display:** Progress bar and percentage in Badges page

---

## 🏆 **BADGE PROGRESSION PATHS**

### **Path 1: Solver Progression**
1. 🥉 Bronze Solver (50 queens)
2. 🥈 Silver Solver (10 games)
3. 🥇 Gold Solver (20 games)
4. 💎 Grandmaster (50 games)

### **Path 2: Speed Progression**
1. 🥉⚡ Bronze Speedster (60s)
2. 🥇⚡ Gold Speedster (30s)

### **Path 3: Puzzle Progression**
1. 🥈🧩 Puzzle Solver (6 puzzles)
2. 🥇🧩 Puzzle Master (10 puzzles)
3. 💎⭐ Star Champion (30 stars)

### **Path 4: Mastery Badges**
1. 🥇💯 Efficiency Master (5 zero-hint games)
2. 🔥 Streak Master (7-day streak)

---

## 📊 **BADGE STATISTICS**

### **Earn Rates (Estimated):**
| Badge | Tier | Estimated % of Players |
|-------|------|------------------------|
| Bronze Solver | Bronze | 70% |
| Bronze Speedster | Bronze | 50% |
| Silver Solver | Silver | 40% |
| Puzzle Solver | Silver | 35% |
| Gold Solver | Gold | 20% |
| Gold Speedster | Gold | 10% |
| Puzzle Master | Gold | 15% |
| Efficiency Master | Gold | 12% |
| Streak Master | Gold | 8% |
| Grandmaster | Platinum | 3% |
| Star Champion | Platinum | 2% |

---

## 🎮 **BADGE INTEGRATION**

### **Backend Integration:**

#### **Badge Model:**
```javascript
{
  badgeId: String (unique),
  name: String,
  description: String,
  icon: String,
  tier: Enum ['bronze', 'silver', 'gold', 'platinum'],
  category: Enum ['progress', 'performance', 'puzzle', 'special'],
  unlockCondition: {
    achievementId: String,
    description: String
  },
  rarity: Enum ['common', 'rare', 'epic', 'legendary'],
  sortOrder: Number
}
```

#### **UserBadge Model:**
```javascript
{
  userId: ObjectId,
  badgeId: String,
  earnedAt: Date,
  isEquipped: Boolean,
  notificationShown: Boolean
}
```

### **Frontend Integration:**

#### **Redux Slice:**
```javascript
// State
const badgeSlice = {
  badges: [],           // All badges
  userBadges: [],       // User's earned badges
  equippedBadge: null,  // Currently equipped badge
  notifications: [],    // Unshown badge notifications
  loading: false,
  error: null
}

// Thunks
fetchAllBadges()
fetchUserBadges()
equipBadge(badgeId)
fetchEquippedBadge()
fetchBadgeNotifications()
markBadgeNotificationShown(badgeId)
```

#### **Component Usage:**
```javascript
import BadgeCard from '@/components/achievements/BadgeCard'

<BadgeCard
  badge={badge}
  isEarned={userBadges.includes(badge.badgeId)}
  isEquipped={equippedBadge?.badgeId === badge.badgeId}
  onEquip={() => dispatch(equipBadge(badge.badgeId))}
/>
```

---

## 🔓 **UNLOCK NOTIFICATIONS**

### **Notification Flow:**
1. **Achievement Unlocked** → Check if `rewardBadgeId` exists
2. **Award Badge** → Create UserBadge record
3. **Add to Queue** → Add badge notification to Redux state
4. **Display Toast** → Show RewardToast with badge details
5. **Mark Shown** → Update `notificationShown = true`

### **Toast Content:**
- **Icon:** Badge tier icon (🥉/🥈/🥇/💎)
- **Title:** "NEW BADGE UNLOCKED!"
- **Badge Name:** Display badge name
- **Badge Icon:** Display badge icon
- **Description:** Show unlock condition
- **Auto-Dismiss:** 5 seconds

---

## 📱 **BADGE DISPLAY LOCATIONS**

### **1. Badges Page** (`/badges`)
- Grid layout with all 12 badges
- Tier filter (All/Bronze/Silver/Gold/Platinum)
- Collection summary stats
- Locked state for unearned badges
- Equip button for earned badges

### **2. User Profile**
- Equipped badge displayed prominently
- Badge count (e.g., "8/12 Badges")
- Collection rate percentage

### **3. Leaderboard**
- Equipped badge shown next to username
- Badge icon displayed inline

### **4. Game Session**
- Equipped badge shown in player card
- Badge displayed during multiplayer (future)

### **5. Reward History** (`/rewards/history`)
- Timeline entry when badge earned
- Badge icon + name + earned date

---

## 🧪 **TESTING SCENARIOS**

### **Test 1: Earn First Badge**
1. Start new account (0 badges)
2. Place 50 queens → Unlock "Sharp Thinker" achievement
3. **Expected:** Bronze Solver badge awarded
4. **Expected:** Toast notification appears
5. **Expected:** Badge appears in Badges page as earned

### **Test 2: Equip Badge**
1. Navigate to Badges page
2. Click Bronze Solver card → Detail modal opens
3. Click "Equip" button
4. **Expected:** Badge marked as equipped
5. **Expected:** Badge displayed in profile
6. **Expected:** Border animation applied

### **Test 3: Collect All Gold Badges**
1. Earn all 5 gold badges
2. Navigate to Badges page
3. Filter by "Gold" tier
4. **Expected:** All 5 gold badges shown as earned
5. **Expected:** Collection stats update

### **Test 4: Platinum Badge Unlock**
1. Complete 50 games
2. **Expected:** "Grandmaster" achievement unlocks
3. **Expected:** Grandmaster badge (💎) awarded
4. **Expected:** Special notification with confetti
5. **Expected:** Badge collection rate updates

### **Test 5: Locked Badge Display**
1. View badge not yet earned
2. **Expected:** 🔒 overlay displayed
3. **Expected:** "LOCKED" text shown
4. **Expected:** Click shows unlock requirements

---

## 🎨 **UI/UX GUIDELINES**

### **Badge Card Design:**
- **Size:** 160x200px
- **Border Radius:** 12px
- **Gradient Background:** Tier-specific colors
- **Icon Size:** 48px (large emoji or SVG)
- **Glow Effect:** Tier-specific shadow
- **Hover Effect:** Scale 1.05 + increased glow

### **Locked State:**
- **Opacity:** 60%
- **Overlay:** rgba(0, 0, 0, 0.7)
- **Lock Icon:** 🔒 centered
- **Text:** "LOCKED" below icon
- **Tooltip:** Show unlock requirements

### **Equipped State:**
- **Border:** 3px animated gradient
- **Badge Tag:** "EQUIPPED" top-right corner
- **Glow:** Enhanced + pulsing animation
- **Checkmark:** ✓ displayed

### **Animations:**
- **Earn Animation:** Scale up + rotate + sparkles
- **Equip Animation:** Border glow pulse
- **Hover Animation:** Smooth scale + glow increase
- **Loading State:** Skeleton shimmer

---

## 📚 **RELATED DOCUMENTATION**

- **DAY7_COMPLETE.md** - Complete implementation guide
- **ACHIEVEMENT_LIST.md** - Achievement specifications
- **XP_SYSTEM.md** - XP and leveling mechanics
- **ACHIEVEMENT_ENGINE.md** - Engine architecture

---

## 🔮 **FUTURE ENHANCEMENTS**

1. **Badge Evolution** - Upgrade badges (e.g., Bronze → Silver → Gold)
2. **Limited Edition Badges** - Seasonal/event badges
3. **Badge Rarity System** - Common/Rare/Epic/Legendary tiers
4. **Badge Showcase** - Display multiple badges (3-5) on profile
5. **Badge Trading** (optional) - Trade duplicate badges
6. **Badge Leaderboard** - Top collectors
7. **Custom Badge Icons** - User-uploaded icons for special badges
8. **Badge Prestige** - Reset badges for prestige levels
9. **Badge Sets** - Earn bonuses for completing badge sets
10. **Animated Badges** - Animated SVG badges for legendary tiers

---

**🛡️ The badge system provides 12 unique rewards across 4 tiers with automatic awarding and equip functionality!**
