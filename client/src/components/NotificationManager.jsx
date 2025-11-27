import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RewardToast from './achievements/RewardToast'
import LevelUpModal from './achievements/LevelUpModal'
import { removeToastNotification } from '../store/slices/rewardSlice'
import { removeLevelUp } from '../store/slices/xpSlice'

/**
 * Global notification manager for achievements, badges, and level ups
 */
const NotificationManager = () => {
  const dispatch = useDispatch()
  const { toastQueue } = useSelector(state => state.rewards)
  const { levelUpQueue } = useSelector(state => state.xp)
  
  const [currentToast, setCurrentToast] = useState(null)
  const [currentLevelUp, setCurrentLevelUp] = useState(null)

  // Handle toast queue
  useEffect(() => {
    if (toastQueue.length > 0 && !currentToast && !currentLevelUp) {
      setCurrentToast(toastQueue[0])
    }
  }, [toastQueue, currentToast, currentLevelUp])

  // Handle level up queue (prioritize over toasts)
  useEffect(() => {
    if (levelUpQueue.length > 0 && !currentLevelUp) {
      setCurrentLevelUp(levelUpQueue[0])
      setCurrentToast(null) // Hide toast when showing level up
    }
  }, [levelUpQueue, currentLevelUp])

  const handleCloseToast = () => {
    setCurrentToast(null)
    dispatch(removeToastNotification())
  }

  const handleCloseLevelUp = () => {
    setCurrentLevelUp(null)
    dispatch(removeLevelUp())
  }

  return (
    <>
      {/* Reward Toast */}
      {currentToast && (
        <RewardToast
          notification={currentToast}
          onClose={handleCloseToast}
        />
      )}

      {/* Level Up Modal */}
      {currentLevelUp && (
        <LevelUpModal
          isOpen={!!currentLevelUp}
          onClose={handleCloseLevelUp}
          newLevel={currentLevelUp.newLevel}
          xpGained={currentLevelUp.xpGained}
        />
      )}
    </>
  )
}

export default NotificationManager
