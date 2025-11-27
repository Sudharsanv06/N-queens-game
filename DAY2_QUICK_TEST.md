# 🎮 Day 2 - Quick Test Guide

## ⚡ Quick Start (2 minutes)

### 1. Start the Development Server
```bash
cd c:\Users\sudha\OneDrive\Desktop\project\n-queens-game\client
npm run dev
```

### 2. Open in Browser
Navigate to: **http://localhost:5173/play-game**

### 3. Test the Game
✅ Click any cell to place a queen  
✅ Click again to remove it  
✅ Watch the red cells (under attack)  
✅ Complete the puzzle!

---

## 🧪 Comprehensive Test Checklist

### ✅ Visual Test (1 minute)
- [ ] Board displays with chess pattern (light/dark squares)
- [ ] Status bar shows "0/8 queens"
- [ ] Control buttons are visible
- [ ] Board size selector is visible
- [ ] Progress bar is empty

### ✅ Interaction Test (2 minutes)
- [ ] Click cell → Queen appears with animation
- [ ] Click queen → Queen disappears
- [ ] Attacked cells turn red
- [ ] Progress bar fills up
- [ ] Stats update (queens placed count)

### ✅ Validation Test (2 minutes)
- [ ] Cannot place queen on attacked cell
- [ ] Can place queen on safe cell
- [ ] Completing puzzle shows success overlay
- [ ] Score is calculated and displayed

### ✅ Controls Test (2 minutes)
- [ ] Reset button → Clears all queens
- [ ] Undo button → Removes last queen
- [ ] Hint button → Shows suggestion
- [ ] Toggle "Attacks" → Shows/hides red cells
- [ ] Toggle "Safe Cells" → Shows/hides green cells

### ✅ Board Size Test (2 minutes)
- [ ] Click "4×4" → Board resizes to 4×4
- [ ] Click "12×12" → Board resizes to 12×12
- [ ] Click "20×20" → Board resizes to 20×20
- [ ] Stats update to show new queen count

### ✅ Mobile Test (3 minutes)
- [ ] Open DevTools (F12)
- [ ] Toggle device emulator (Ctrl+Shift+M)
- [ ] Select "iPhone 12 Pro"
- [ ] Test touch interactions
- [ ] Layout adapts correctly

---

## 🎯 Feature Walkthrough

### How to Play a Complete Game:

#### Step 1: Start with 4×4 (Easy)
```
1. Click board size "4×4"
2. Board resets to 4×4 grid
3. Status shows "0/4 queens"
```

#### Step 2: Place First Queen
```
1. Click cell (0,1) - Row 1, Column B
2. Queen appears with animation
3. Red cells show attacked positions
4. Status shows "1/4 queens"
```

#### Step 3: Place Second Queen
```
1. Click cell (1,3) - Row 2, Column D
2. Queen appears
3. More red cells appear
4. Status shows "2/4 queens"
```

#### Step 4: Complete the Puzzle
```
1. Place remaining 2 queens in safe cells
2. When all 4 queens are placed safely:
   → Success overlay appears
   → Confetti animation plays
   → Score is displayed
```

#### Step 5: Try Again
```
1. Click "Reset" button
2. Board clears
3. Try to beat your score!
```

---

## 🎨 Visual Features to Notice

### Animations:
- ✨ Queen placement: **Spring animation with rotation**
- ✨ Success overlay: **Fade in with scale**
- ✨ Progress bar: **Smooth fill animation**
- ✨ Buttons: **Hover scale + tap feedback**

### Colors:
- 🟡 **Queen**: Golden yellow gradient
- 🔴 **Attacked**: Red overlay (40% opacity)
- 🟢 **Safe**: Green overlay (40% opacity)
- ⬜ **Light square**: Beige (#f0d9b5)
- ⬛ **Dark square**: Brown (#b58863)

### Highlights:
- 👑 **Queen cell**: Gold ring + gradient background
- 🎯 **Hover cell**: Scale up 1.05x
- 🖱️ **Tap cell**: Scale down 0.95x

---

## 📊 Expected Results

### For 4×4 Board:
```
Solution example:
. Q . .
. . . Q
Q . . .
. . Q .

Score: ~900-1000 points (varies by time)
```

### For 8×8 Board (Classic):
```
Multiple solutions exist
Typical score: ~1200-1500 points
Time to solve: 2-5 minutes
```

### For 12×12 Board:
```
Challenging puzzle
Typical score: ~1800-2200 points
Time to solve: 5-10 minutes
```

---

## 🐛 Troubleshooting

### Issue: Board doesn't display
**Fix**: Check console for errors (F12)
```bash
# Restart dev server
cd client
npm run dev
```

### Issue: Clicking cells does nothing
**Fix**: Check Redux DevTools
- Install Redux DevTools extension
- Check if state updates on click

### Issue: Animations are choppy
**Fix**: Check browser performance
- Close other tabs
- Try Chrome/Firefox
- Check CPU usage

### Issue: Layout looks broken
**Fix**: Check Tailwind compilation
```bash
# Rebuild
npm run build
```

---

## 🔍 Developer Tools

### Redux DevTools:
```
1. Install Redux DevTools extension
2. Open DevTools (F12)
3. Click "Redux" tab
4. Watch state changes on actions:
   - game/boardGame/toggleQueen
   - game/boardGame/resetBoard
   - etc.
```

### React DevTools:
```
1. Install React DevTools extension
2. Open DevTools (F12)
3. Click "Components" tab
4. Inspect component hierarchy:
   - NQueensGame
     - Chessboard
       - BoardCell (64 instances for 8×8)
     - GameController
```

### Performance:
```
1. Open DevTools (F12)
2. Click "Performance" tab
3. Record while placing queens
4. Check for smooth 60 FPS
```

---

## 📱 Mobile Testing

### Chrome DevTools:
```
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Select device:
   - iPhone 12 Pro (390×844)
   - iPad Pro (1024×1366)
   - Pixel 5 (393×851)
3. Test touch interactions
4. Check responsive layout
```

### Real Device Testing:
```
1. Get your local IP: ipconfig
2. Update Vite config if needed
3. Access from phone: http://YOUR_IP:5173/play-game
4. Test touch gestures
```

---

## ✅ Success Criteria

You know it's working when:
- [x] All animations are smooth
- [x] Queen placement is instant
- [x] No console errors
- [x] Success overlay appears on completion
- [x] All buttons respond correctly
- [x] Mobile layout works properly
- [x] Board scales for all sizes (4-20)

---

## 🎯 Performance Benchmarks

### Expected Metrics:
```
Initial Load: < 1 second
Queen Placement: < 50ms
Board Reset: < 100ms
Size Change: < 200ms
Animation FPS: 60 FPS
Memory Usage: < 50 MB
```

### How to Measure:
```
1. Open DevTools → Performance
2. Record interaction
3. Check timing in flame chart
4. Verify smooth 60 FPS line
```

---

## 🎉 You Should See...

### On Load:
- Beautiful gradient background
- Professional chess board
- Status bar with 0 queens
- All control buttons
- Clean, modern UI

### While Playing:
- Smooth queen animations
- Instant visual feedback
- Real-time attack highlighting
- Progress bar filling up
- Stats updating live

### On Completion:
- 🎉 Success overlay
- Confetti-style animation
- Score display
- Celebration message

---

## 📸 Screenshots (What to Expect)

### Empty Board:
```
┌─────────┐
│░█░█░█░█│  Light/dark chess pattern
│█░█░█░█░│  8×8 grid
│░█░█░█░█│  Professional borders
│█░█░█░█░│  Golden frame
│░█░█░█░█│
│█░█░█░█░│
│░█░█░█░█│
│█░█░█░█░│
└─────────┘
```

### With Queens:
```
┌─────────┐
│░👑░█░█░█│  Queens in gold
│█░█░█👑░│  Red attacked cells
│░█👑█░█░█│  Green safe cells
│█░█░█░█░│  Clear visual feedback
│░█░█░█👑│
│👑░█░█░█░│
│░█░█░█░█│
│█👑█░█░█░│
└─────────┘
```

---

## 🚀 Next Steps After Testing

If everything works:
1. ✅ Mark Day 2 as complete
2. ✅ Review DAY2_COMPLETE.md
3. ✅ Plan Day 3 features
4. ✅ Celebrate! 🎉

If issues found:
1. Check console errors
2. Verify all files created
3. Check imports
4. Restart dev server
5. Clear browser cache

---

## 💡 Pro Tips

### For Best Experience:
- Use Chrome or Firefox (best DevTools)
- Enable Redux DevTools
- Test on real mobile device
- Try different board sizes
- Use hints sparingly (they reduce score)

### For Development:
- Keep DevTools open
- Watch Redux state changes
- Profile performance
- Test edge cases
- Check mobile responsiveness

---

## 📞 Need Help?

### Common Questions:

**Q: Where's the game?**  
A: Navigate to `/play-game` or `/nqueens`

**Q: How do I place queens?**  
A: Just click any cell!

**Q: Why can't I place a queen?**  
A: That cell is under attack (shown in red)

**Q: How do I win?**  
A: Place all N queens without conflicts

**Q: What do the colors mean?**  
A: Check the legend at the bottom of the controller

---

**Status**: ✅ **Day 2 Complete - Ready to Test!**

**Time to Test**: ~15 minutes for full test suite

**Enjoy your N-Queens game! 🎮👑**
