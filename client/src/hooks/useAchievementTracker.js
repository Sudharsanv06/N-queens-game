import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAchievements } from '../store/slices/achievementSlice'
import { fetchUserXP } from '../store/slices/xpSlice'
import { addToastNotification } from '../store/slices/rewardSlice'

/**
 * Custom hook to track achievements and trigger checks
 */
const useAchievementTracker = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    if (user) {
      // Initial fetch of XP
      dispatch(fetchUserXP())
    }
  }, [user, dispatch])

  /**
   * Trigger achievement check after game events
   */
  const trackEvent = async (eventType, eventData = {}) => {
    if (!user) return

    try {
      // Check achievements
      const result = await dispatch(checkAchievements()).unwrap()
      
      // Show notifications for newly unlocked achievements
      if (result.results?.unlockedAchievements?.length > 0) {
        result.results.unlockedAchievements.forEach(unlock => {
          dispatch(addToastNotification({
            type: 'achievement',
            ...unlock.achievement
          }))
        })
      }

      // Show notifications for newly earned badges
      if (result.results?.newBadges?.length > 0) {
        result.results.newBadges.forEach(badgeData => {
          dispatch(addToastNotification({
            type: 'badge',
            ...badgeData.badge
          }))
        })
      }

      // Refresh XP data
      dispatch(fetchUserXP())

      return result
    } catch (error) {
      console.error('Achievement tracking error:', error)
    }
  }

  /**
   * Track puzzle completion
   */
  const trackPuzzleComplete = async (puzzleData) => {
    return trackEvent('puzzle_completed', puzzleData)
  }

  /**
   * Track classic game completion
   */
  const trackClassicComplete = async (gameData) => {
    return trackEvent('classic_completed', gameData)
  }

  /**
   * Track time trial completion
   */
  const trackTimeTrialComplete = async (gameData) => {
    return trackEvent('time_trial_completed', gameData)
  }

  /**
   * Track queen placed
   */
  const trackQueenPlaced = async () => {
    return trackEvent('queen_placed')
  }

  /**
   * Track move made
   */
  const trackMoveMade = async () => {
    return trackEvent('move_made')
  }

  return {
    trackEvent,
    trackPuzzleComplete,
    trackClassicComplete,
    trackTimeTrialComplete,
    trackQueenPlaced,
    trackMoveMade
  }
}

export default useAchievementTracker
