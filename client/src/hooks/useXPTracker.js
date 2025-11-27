import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllNotifications, removeToastNotification } from '../store/slices/rewardSlice'
import { addLevelUp } from '../store/slices/xpSlice'

/**
 * Custom hook to manage XP tracking and level ups
 */
const useXPTracker = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { xp } = useSelector(state => state.xp)

  useEffect(() => {
    if (user) {
      // Fetch unshown notifications on mount
      dispatch(fetchAllNotifications())
    }
  }, [user, dispatch])

  /**
   * Handle XP gain and level up detection
   */
  const handleXPGain = (xpAmount) => {
    if (!xpAmount || xpAmount <= 0) return

    const newTotalXP = xp.currentXP + xpAmount
    const xpNeeded = xp.xpToNextLevel

    if (newTotalXP >= xpNeeded) {
      // Level up!
      const newLevel = xp.level + 1
      dispatch(addLevelUp({
        newLevel,
        xpGained: xpAmount
      }))
    }
  }

  /**
   * Show next toast notification
   */
  const showNextNotification = () => {
    dispatch(removeToastNotification())
  }

  return {
    handleXPGain,
    showNextNotification,
    currentLevel: xp.level,
    currentXP: xp.currentXP,
    xpToNextLevel: xp.xpToNextLevel,
    levelProgress: xp.levelProgress
  }
}

export default useXPTracker
