// client/src/hooks/useSoundEffects.js
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import soundEffects from '../utils/soundEffects'

function useSoundEffects() {
  const { soundEnabled, volume } = useSelector(state => state.settings?.sound || { enabled: true, volume: 0.7 })

  // Update sound effects settings when Redux changes
  useEffect(() => {
    if (soundEnabled !== undefined) {
      soundEffects.enabled = soundEnabled
      soundEffects.savePreferences()
    }
    if (volume !== undefined) {
      soundEffects.volume = volume
      soundEffects.savePreferences()
    }
  }, [soundEnabled, volume])

  // Play place queen sound
  const playMoveSound = useCallback(() => {
    soundEffects.placeQueen()
  }, [])

  // Play victory sound
  const playWinSound = useCallback(() => {
    soundEffects.victory()
  }, [])

  // Play invalid move / conflict sound
  const playConflictSound = useCallback(() => {
    soundEffects.invalidMove()
  }, [])

  // Play achievement unlock sound
  const playAchievementSound = useCallback(() => {
    soundEffects.showHint() // Reuse hint sound for achievements
  }, [])

  // Play level up sound
  const playLevelUpSound = useCallback(() => {
    soundEffects.victory()
  }, [])

  // Play click sound
  const playClickSound = useCallback(() => {
    soundEffects.placeQueen()
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    soundEffects.timerTick()
  }, [])

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    soundEffects.toggle()
  }, [])

  // Set volume
  const setVolume = useCallback((vol) => {
    soundEffects.setVolume(vol)
  }, [])

  return {
    playMoveSound,
    playWinSound,
    playConflictSound,
    playAchievementSound,
    playLevelUpSound,
    playClickSound,
    playNotificationSound,
    toggleSound,
    setVolume,
    isEnabled: soundEffects.enabled
  }
}

export default useSoundEffects