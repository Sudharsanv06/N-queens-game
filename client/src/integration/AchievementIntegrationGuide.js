/**
 * Achievement Integration Guide
 * 
 * This file demonstrates how to integrate achievement tracking
 * into existing game components.
 */

import useAchievementTracker from '../hooks/useAchievementTracker'

// ============================================
// EXAMPLE 1: Puzzle Completion
// ============================================

// In your PuzzleGame component or similar:
/*
import useAchievementTracker from '../hooks/useAchievementTracker'

const PuzzleGame = () => {
  const { trackPuzzleComplete } = useAchievementTracker()
  
  const handlePuzzleComplete = async (puzzleData) => {
    // Your existing puzzle completion logic
    const completionData = {
      puzzleId: puzzleData.id,
      stars: puzzleData.stars,
      time: puzzleData.completionTime,
      hintsUsed: puzzleData.hintsUsed,
      moves: puzzleData.moves
    }
    
    // Save to backend
    await savePuzzleCompletion(completionData)
    
    // Track achievement
    await trackPuzzleComplete(completionData)
  }
  
  return (
    // Your component JSX
  )
}
*/

// ============================================
// EXAMPLE 2: Classic Mode Completion
// ============================================

/*
import useAchievementTracker from '../hooks/useAchievementTracker'

const ClassicGame = () => {
  const { trackClassicComplete } = useAchievementTracker()
  
  const handleGameComplete = async (gameData) => {
    // Your existing game completion logic
    const completionData = {
      boardSize: gameData.size,
      time: gameData.completionTime,
      moves: gameData.totalMoves,
      hintsUsed: gameData.hintsUsed
    }
    
    // Save to backend
    await saveGameResult(completionData)
    
    // Track achievement
    await trackClassicComplete(completionData)
  }
  
  return (
    // Your component JSX
  )
}
*/

// ============================================
// EXAMPLE 3: Time Trial Completion
// ============================================

/*
import useAchievementTracker from '../hooks/useAchievementTracker'

const TimeTrialGame = () => {
  const { trackTimeTrialComplete } = useAchievementTracker()
  
  const handleTimeTrialComplete = async (gameData) => {
    // Your existing time trial completion logic
    const completionData = {
      boardSize: gameData.size,
      time: gameData.completionTime,
      moves: gameData.totalMoves
    }
    
    // Save to backend
    await saveTimeTrialResult(completionData)
    
    // Track achievement (will check for speed achievements)
    await trackTimeTrialComplete(completionData)
  }
  
  return (
    // Your component JSX
  )
}
*/

// ============================================
// EXAMPLE 4: Individual Move Tracking
// ============================================

/*
import useAchievementTracker from '../hooks/useAchievementTracker'

const GameBoard = () => {
  const { trackQueenPlaced, trackMoveMade } = useAchievementTracker()
  
  const handleQueenPlaced = (row, col) => {
    // Your existing queen placement logic
    placeQueen(row, col)
    
    // Track achievement (for total queens placed achievements)
    trackQueenPlaced()
  }
  
  const handleMoveMade = () => {
    // Your existing move logic
    incrementMoveCount()
    
    // Track achievement (for total moves achievements)
    trackMoveMade()
  }
  
  return (
    // Your component JSX
  )
}
*/

// ============================================
// EXAMPLE 5: Generic Event Tracking
// ============================================

/*
import useAchievementTracker from '../hooks/useAchievementTracker'

const GameComponent = () => {
  const { trackEvent } = useAchievementTracker()
  
  const handleCustomEvent = async () => {
    // Track any custom event
    await trackEvent('custom_event', {
      customData: 'value'
    })
  }
  
  return (
    // Your component JSX
  )
}
*/

// ============================================
// INTEGRATION CHECKLIST
// ============================================

/*
✅ 1. Import useAchievementTracker hook
✅ 2. Call appropriate tracker function after game events
✅ 3. Ensure user statistics are updated in backend
✅ 4. Test achievement unlocking with various scenarios
✅ 5. Verify notifications appear correctly
✅ 6. Check XP gains and level ups work
✅ 7. Verify badges are awarded when achievements unlock
*/

// ============================================
// IMPORTANT NOTES
// ============================================

/*
1. Achievement checking is done on the BACKEND
   - The frontend only triggers the check
   - Backend evaluates all achievement requirements
   - This prevents cheating

2. User statistics must be updated BEFORE checking achievements
   - Save game results to database first
   - Then trigger achievement check
   - Backend reads latest stats from database

3. Achievements check automatically includes:
   - XP rewards
   - Badge awards
   - Milestone checking
   - Multiple achievements can unlock at once

4. Notifications are shown automatically:
   - Achievement unlock toast
   - Badge earned toast
   - Level up modal
   - All queued and shown sequentially

5. Performance considerations:
   - Don't call tracker on every tiny action
   - Batch related events when possible
   - Achievement checks are rate-limited on backend
*/

export default {
  // This is just a guide file, no exports needed
}
