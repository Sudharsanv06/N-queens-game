# 🧩 Predefined Puzzle Library

Complete catalog of all 10 predefined N-Queens puzzles with solutions, design rationale, and difficulty analysis.

---

## 📊 Puzzle Overview

| Puzzle ID | Name | Board Size | Difficulty | Locked Queens | Expected Time | Max Hints |
|-----------|------|------------|------------|---------------|---------------|-----------|
| puzzle-001 | First Steps | 4×4 | Easy | 2 | 30s | 3 |
| puzzle-002 | Corner Start | 4×4 | Easy | 2 | 45s | 3 |
| puzzle-003 | Five Queens Challenge | 5×5 | Easy | 2 | 60s | 3 |
| puzzle-004 | Diagonal Dilemma | 5×5 | Medium | 1 | 90s | 3 |
| puzzle-005 | Half and Half | 6×6 | Medium | 3 | 120s | 3 |
| puzzle-006 | Edge Master | 6×6 | Medium | 2 | 135s | 3 |
| puzzle-007 | Lucky Seven | 7×7 | Hard | 2 | 180s | 3 |
| puzzle-008 | Classic Eight | 8×8 | Hard | 3 | 240s | 3 |
| puzzle-009 | Minimal Clues | 8×8 | Expert | 1 | 300s | 3 |
| puzzle-010 | Corner Challenge | 8×8 | Expert | 2 | 320s | 3 |

---

## 🎯 Puzzle Definitions

### Puzzle 001: First Steps
**Difficulty**: Easy  
**Board Size**: 4×4  
**Expected Time**: 30 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 1  (🔒 Top row, second column)
Row 2, Col 3  (🔒 Third row, last column)
```

**Solution:**
```
Row 0, Col 1  (Locked)
Row 1, Col 3
Row 2, Col 0
Row 3, Col 2
```

**Board Visualization:**
```
   0  1  2  3
0  .  👑 .  .
1  .  .  .  👑
2  👑 .  .  .
3  .  .  👑 .
```

**Design Rationale:**
- Perfect introduction puzzle for beginners
- Two locked queens provide strong constraints
- Only 2 queens need to be placed
- Multiple valid solutions exist
- Expected to be solved in under 30 seconds

**Learning Objective:**
- Understand basic N-Queens rules (no same row/column/diagonal)
- Practice clicking squares to place queens
- Learn how locked queens work

---

### Puzzle 002: Corner Start
**Difficulty**: Easy  
**Board Size**: 4×4  
**Expected Time**: 45 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 0  (🔒 Top-left corner)
Row 3, Col 3  (🔒 Bottom-right corner)
```

**Solution:**
```
Row 0, Col 0  (Locked)
Row 1, Col 2
Row 2, Col 1
Row 3, Col 3  (Locked)
```

**Board Visualization:**
```
   0  1  2  3
0  👑 .  .  .
1  .  .  👑 .
2  .  👑 .  .
3  .  .  .  👑
```

**Design Rationale:**
- Corner placement introduces diagonal constraints
- Symmetric locked positions create visual appeal
- Slightly harder than puzzle-001 due to diagonal conflicts
- Teaches importance of diagonal checking

**Learning Objective:**
- Master diagonal conflict detection
- Understand corner placement strategies
- Develop spatial reasoning skills

---

### Puzzle 003: Five Queens Challenge
**Difficulty**: Easy  
**Board Size**: 5×5  
**Expected Time**: 60 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 2  (🔒 Top row, middle)
Row 3, Col 4  (🔒 Fourth row, last column)
```

**Solution:**
```
Row 0, Col 2  (Locked)
Row 1, Col 4
Row 2, Col 1
Row 3, Col 3
Row 4, Col 0
```

**Board Visualization:**
```
   0  1  2  3  4
0  .  .  👑 .  .
1  .  .  .  .  👑
2  .  👑 .  .  .
3  .  .  .  👑 .
4  👑 .  .  .  .
```

**Design Rationale:**
- First 5×5 puzzle introduces larger board complexity
- Center-locked queen creates unique constraints
- 3 queens to place, moderate difficulty
- Good transition from 4×4 to larger boards

**Learning Objective:**
- Adapt strategies to 5×5 board
- Handle increased queen count (5 total)
- Plan multiple moves ahead

---

### Puzzle 004: Diagonal Dilemma
**Difficulty**: Medium  
**Board Size**: 5×5  
**Expected Time**: 90 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 2, Col 2  (🔒 Center of board)
```

**Solution:**
```
Row 0, Col 1
Row 1, Col 3
Row 2, Col 0
Row 3, Col 2
Row 4, Col 4
```

**Board Visualization:**
```
   0  1  2  3  4
0  .  👑 .  .  .
1  .  .  .  👑 .
2  👑 .  .  .  .
3  .  .  👑 .  .
4  .  .  .  .  👑
```

**Design Rationale:**
- Center-locked queen creates maximum diagonal constraints
- Only 1 locked queen forces more strategic thinking
- Named "Diagonal Dilemma" due to center-locked diagonal conflicts
- First puzzle to reach Medium difficulty

**Learning Objective:**
- Handle center-locked queen challenges
- Develop advanced diagonal avoidance strategies
- Practice trial-and-error problem-solving

---

### Puzzle 005: Half and Half
**Difficulty**: Medium  
**Board Size**: 6×6  
**Expected Time**: 120 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 1  (🔒 Top section)
Row 2, Col 3  (🔒 Middle section)
Row 4, Col 5  (🔒 Bottom section)
```

**Solution:**
```
Row 0, Col 1  (Locked)
Row 1, Col 3
Row 2, Col 5
Row 3, Col 0
Row 4, Col 2
Row 5, Col 4
```

**Board Visualization:**
```
   0  1  2  3  4  5
0  .  👑 .  .  .  .
1  .  .  .  👑 .  .
2  .  .  .  .  .  👑
3  👑 .  .  .  .  .
4  .  .  👑 .  .  .
5  .  .  .  .  👑 .
```

**Design Rationale:**
- First 6×6 puzzle with 3 locked queens
- Locked queens distributed across top/middle/bottom
- 3 queens to place, moderate search space
- Tests ability to work with partial solutions

**Learning Objective:**
- Master 6×6 board complexity
- Handle multiple locked constraints
- Develop systematic placement strategies

---

### Puzzle 006: Edge Master
**Difficulty**: Medium  
**Board Size**: 6×6  
**Expected Time**: 135 seconds  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 1, Col 0  (🔒 Left edge)
Row 4, Col 5  (🔒 Right edge)
```

**Solution:**
```
Row 0, Col 2
Row 1, Col 4
Row 2, Col 1
Row 3, Col 3
Row 4, Col 0
Row 5, Col 5
```

**Board Visualization:**
```
   0  1  2  3  4  5
0  .  .  👑 .  .  .
1  .  .  .  .  👑 .
2  .  👑 .  .  .  .
3  .  .  .  👑 .  .
4  👑 .  .  .  .  .
5  .  .  .  .  .  👑
```

**Design Rationale:**
- Edge-locked queens create unique constraints
- Only 2 locked queens but strategically placed
- Requires careful column management
- Tests edge-case problem-solving

**Learning Objective:**
- Handle edge-locked queen challenges
- Optimize column and diagonal usage
- Build confidence with 6×6 boards

---

### Puzzle 007: Lucky Seven
**Difficulty**: Hard  
**Board Size**: 7×7  
**Expected Time**: 180 seconds (3 minutes)  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 3  (🔒 Top row, near center)
Row 5, Col 6  (🔒 Bottom area, right edge)
```

**Solution:**
```
Row 0, Col 3  (Locked)
Row 1, Col 5
Row 2, Col 0
Row 3, Col 2
Row 4, Col 6
Row 5, Col 1
Row 6, Col 4
```

**Board Visualization:**
```
   0  1  2  3  4  5  6
0  .  .  .  👑 .  .  .
1  .  .  .  .  .  👑 .
2  👑 .  .  .  .  .  .
3  .  .  👑 .  .  .  .
4  .  .  .  .  .  .  👑
5  .  👑 .  .  .  .  .
6  .  .  .  .  👑 .  .
```

**Design Rationale:**
- First Hard difficulty puzzle
- 7×7 board significantly increases complexity
- 5 queens to place with limited locked constraints
- Expected 3-minute solve time
- Tests patience and systematic search

**Learning Objective:**
- Master larger board sizes (7×7)
- Handle 7-queen placement complexity
- Develop persistence and methodical approaches

---

### Puzzle 008: Classic Eight
**Difficulty**: Hard  
**Board Size**: 8×8  
**Expected Time**: 240 seconds (4 minutes)  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 4  (🔒 Top row, center-right)
Row 3, Col 1  (🔒 Middle-left area)
Row 6, Col 7  (🔒 Bottom-right area)
```

**Solution:**
```
Row 0, Col 4  (Locked)
Row 1, Col 6
Row 2, Col 3
Row 3, Col 1  (Locked)
Row 4, Col 7
Row 5, Col 2
Row 6, Col 0
Row 7, Col 5
```

**Board Visualization:**
```
   0  1  2  3  4  5  6  7
0  .  .  .  .  👑 .  .  .
1  .  .  .  .  .  .  👑 .
2  .  .  .  👑 .  .  .  .
3  .  👑 .  .  .  .  .  .
4  .  .  .  .  .  .  .  👑
5  .  .  👑 .  .  .  .  .
6  👑 .  .  .  .  .  .  .
7  .  .  .  .  .  👑 .  .
```

**Design Rationale:**
- Classic 8×8 N-Queens problem
- 3 locked queens provide some guidance
- 5 queens to place, large search space
- Named "Classic Eight" as homage to original problem
- Expected 4-minute solve time

**Learning Objective:**
- Conquer the classic 8×8 challenge
- Apply all learned strategies
- Demonstrate mastery of N-Queens rules

---

### Puzzle 009: Minimal Clues
**Difficulty**: Expert  
**Board Size**: 8×8  
**Expected Time**: 300 seconds (5 minutes)  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 3, Col 3  (🔒 Center of board)
```

**Solution:**
```
Row 0, Col 5
Row 1, Col 2
Row 2, Col 4
Row 3, Col 7
Row 4, Col 1
Row 5, Col 3
Row 6, Col 6
Row 7, Col 0
```

**Board Visualization:**
```
   0  1  2  3  4  5  6  7
0  .  .  .  .  .  👑 .  .
1  .  .  👑 .  .  .  .  .
2  .  .  .  .  👑 .  .  .
3  .  .  .  .  .  .  .  👑
4  .  👑 .  .  .  .  .  .
5  .  .  .  👑 .  .  .  .
6  .  .  .  .  .  .  👑 .
7  👑 .  .  .  .  .  .  .
```

**Design Rationale:**
- Expert difficulty with only 1 locked queen
- Center-locked queen creates maximum constraints
- 7 queens to place independently
- Minimal guidance forces deep problem-solving
- Expected 5-minute solve time

**Learning Objective:**
- Handle minimal constraint scenarios
- Develop independent solution strategies
- Push problem-solving limits

---

### Puzzle 010: Corner Challenge
**Difficulty**: Expert  
**Board Size**: 8×8  
**Expected Time**: 320 seconds (5 min 20 sec)  
**Max Hints**: 3

**Initial Queens (Locked):**
```
Row 0, Col 0  (🔒 Top-left corner)
Row 7, Col 7  (🔒 Bottom-right corner)
```

**Solution:**
```
Row 0, Col 0  (Locked)
Row 1, Col 4
Row 2, Col 7
Row 3, Col 5
Row 4, Col 2
Row 5, Col 6
Row 6, Col 1
Row 7, Col 3
```

**Board Visualization:**
```
   0  1  2  3  4  5  6  7
0  👑 .  .  .  .  .  .  .
1  .  .  .  .  👑 .  .  .
2  .  .  .  .  .  .  .  👑
3  .  .  .  .  .  👑 .  .
4  .  .  👑 .  .  .  .  .
5  .  .  .  .  .  .  👑 .
6  .  👑 .  .  .  .  .  .
7  .  .  .  👑 .  .  .  .
```

**Design Rationale:**
- Final expert challenge
- Symmetric corner-locked queens
- Main diagonal fully blocked by locked queens
- 6 queens to place with extreme diagonal constraints
- Longest expected solve time (5 min 20 sec)
- Perfect finale puzzle

**Learning Objective:**
- Master extreme diagonal constraints
- Demonstrate complete N-Queens mastery
- Achieve ultimate puzzle completion

---

## 🎯 Difficulty Progression

### Easy (Puzzles 001-003)
- **Board Sizes**: 4×4 to 5×5
- **Locked Queens**: 2
- **Expected Time**: 30-60 seconds
- **Target Audience**: Complete beginners
- **Focus**: Learn basic rules and controls

### Medium (Puzzles 004-006)
- **Board Sizes**: 5×5 to 6×6
- **Locked Queens**: 1-3
- **Expected Time**: 90-135 seconds
- **Target Audience**: Players with basic understanding
- **Focus**: Strategic placement and planning

### Hard (Puzzles 007-008)
- **Board Sizes**: 7×7 to 8×8
- **Locked Queens**: 2-3
- **Expected Time**: 180-240 seconds
- **Target Audience**: Experienced players
- **Focus**: Patience and systematic search

### Expert (Puzzles 009-010)
- **Board Sizes**: 8×8
- **Locked Queens**: 1-2 (but strategically challenging)
- **Expected Time**: 300-320 seconds
- **Target Audience**: Masters seeking ultimate challenge
- **Focus**: Independent problem-solving with minimal guidance

---

## ⭐ Star Scoring Breakdown

| Puzzle | Expected Time | 3 Stars (≤) | 2 Stars (≤ 1.5x) | 1 Star (≤ 2x) |
|--------|---------------|-------------|------------------|---------------|
| puzzle-001 | 30s | ≤ 30s | ≤ 45s | ≤ 60s |
| puzzle-002 | 45s | ≤ 45s | ≤ 67s | ≤ 90s |
| puzzle-003 | 60s | ≤ 60s | ≤ 90s | ≤ 120s |
| puzzle-004 | 90s | ≤ 90s | ≤ 135s | ≤ 180s |
| puzzle-005 | 120s | ≤ 120s | ≤ 180s | ≤ 240s |
| puzzle-006 | 135s | ≤ 135s | ≤ 202s | ≤ 270s |
| puzzle-007 | 180s | ≤ 180s | ≤ 270s | ≤ 360s |
| puzzle-008 | 240s | ≤ 240s | ≤ 360s | ≤ 480s |
| puzzle-009 | 300s | ≤ 300s | ≤ 450s | ≤ 600s |
| puzzle-010 | 320s | ≤ 320s | ≤ 480s | ≤ 640s |

**Maximum Possible Stars**: 30 (3 stars × 10 puzzles)

---

## 📊 Statistics & Metrics

### Puzzle Complexity Metrics

| Metric | Easy | Medium | Hard | Expert |
|--------|------|--------|------|--------|
| Avg Board Size | 4.3 | 5.7 | 7.5 | 8.0 |
| Avg Locked Queens | 2.0 | 2.0 | 2.5 | 1.5 |
| Avg Expected Time | 45s | 115s | 210s | 310s |
| Queens to Place | 2-3 | 3-5 | 5 | 6-7 |

### Completion Rate Predictions
Based on typical puzzle game metrics:

- **Easy**: 90-95% completion rate
- **Medium**: 70-80% completion rate
- **Hard**: 40-50% completion rate
- **Expert**: 20-30% completion rate

---

## 🧠 Puzzle Design Principles

### 1. **Progressive Difficulty**
Puzzles are ordered by increasing complexity:
- Start with 4×4 boards
- Gradually increase to 8×8
- More locked queens initially (easier)
- Fewer locked queens later (harder)

### 2. **Diverse Strategies**
Each puzzle teaches different skills:
- Corner placements (002, 010)
- Center constraints (004, 009)
- Edge management (006)
- Diagonal mastery (all)

### 3. **Balanced Guidance**
- Easy: More locked queens (2) = more guidance
- Expert: Fewer locked queens (1-2) = less guidance
- Strategic locked positions create unique challenges

### 4. **Achievable Goals**
- Expected times calibrated for average players
- 3-star thresholds encourage replay
- Hints available for all puzzles (max 3)
- No puzzle is impossible

### 5. **Visual Appeal**
- Symmetric locked positions when possible
- Aesthetically pleasing solutions
- Clear difficulty progression
- Memorable puzzle names

---

## 🏆 Achievement Milestones

### Completion Milestones
- **First Steps**: Complete puzzle-001 (easiest)
- **Half Done**: Complete 5 puzzles
- **Full House**: Complete all 10 puzzles
- **Star Collector**: Earn 15 stars total
- **Perfect Score**: Earn all 30 stars
- **Speed Demon**: Complete any puzzle in half the expected time
- **Hint-Free Master**: Complete all puzzles without using hints
- **Expert Conqueror**: Complete both expert puzzles

---

## 📝 Usage in Game

### For Players
1. **Browse Puzzles**: View all 10 in `/puzzles`
2. **Filter**: By difficulty or board size
3. **Select**: Click "Play" on any puzzle
4. **Solve**: Place queens to match solution
5. **Earn Stars**: Based on completion time
6. **Retry**: Improve star rating

### For Developers
1. **Seeding**: `node server/seed-puzzles.js`
2. **API Access**: GET `/api/puzzles/predefined/list`
3. **Custom Puzzles**: Add to seed-puzzles.js
4. **Difficulty Tuning**: Adjust expectedMinTime
5. **Monitoring**: Track puzzle stats in database

---

## 🔮 Future Puzzle Ideas

### Potential Additions
1. **Daily Puzzles**: New puzzle each day
2. **Themed Collections**: "Speed Master Pack", "Logic Master Pack"
3. **Community Puzzles**: User-created puzzles
4. **Seasonal Puzzles**: Holiday-themed challenges
5. **Timed Challenges**: Beat the clock mode
6. **Puzzle Tournaments**: Weekly competitions

---

## 📚 Educational Value

### Skills Developed
- **Logical Thinking**: Systematic problem-solving
- **Pattern Recognition**: Identify queen conflicts
- **Strategic Planning**: Multi-step ahead thinking
- **Spatial Reasoning**: 2D board visualization
- **Persistence**: Retry until success
- **Optimization**: Improve times and star ratings

### Classroom Use
Puzzles can be used to teach:
- Constraint satisfaction problems
- Backtracking algorithms
- Combinatorial optimization
- Critical thinking skills

---

**🧩 Total Puzzles: 10**  
**🎯 Total Expected Playtime: 23 minutes (if all solved at expected times)**  
**⭐ Maximum Stars: 30**  
**📊 Difficulty Distribution: 3 Easy, 3 Medium, 2 Hard, 2 Expert**

---

**Happy Puzzle Solving! 👑**
