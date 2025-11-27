import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Clock, AlertCircle } from 'lucide-react'
import { decrementPlayerTime, decrementOpponentTime } from '../../store/slices/multiplayerSliceNew'
import { useMultiplayerSocket } from '../../hooks/useMultiplayerSocket'

export const TimerSync = ({ side = 'player1' }) => {
  const dispatch = useDispatch()
  const { resignGame } = useMultiplayerSocket()
  const intervalRef = useRef(null)

  const { 
    playerTimeRemaining, 
    opponentTimeRemaining, 
    gameStatus,
    playerSide 
  } = useSelector((state) => state.multiplayerGame)

  const isPlayerTimer = side === playerSide
  const timeRemaining = isPlayerTimer ? playerTimeRemaining : opponentTimeRemaining

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = (seconds) => {
    if (seconds === null || seconds === undefined) return 'bg-gray-500'
    if (seconds <= 5) return 'bg-red-500'
    if (seconds <= 10) return 'bg-yellow-500'
    if (seconds <= 30) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getTextColor = (seconds) => {
    if (seconds === null || seconds === undefined) return 'text-gray-500'
    if (seconds <= 5) return 'text-red-500'
    if (seconds <= 10) return 'text-yellow-500'
    return 'text-gray-700 dark:text-gray-300'
  }

  useEffect(() => {
    // Only run timer if game is in progress and time limit exists
    if (gameStatus !== 'in-progress' || timeRemaining === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      if (isPlayerTimer) {
        dispatch(decrementPlayerTime())
      } else {
        dispatch(decrementOpponentTime())
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameStatus, isPlayerTimer, timeRemaining, dispatch])

  // Handle time up
  useEffect(() => {
    if (timeRemaining === 0 && isPlayerTimer && gameStatus === 'in-progress') {
      // Auto-resign when time runs out
      resignGame()
    }
  }, [timeRemaining, isPlayerTimer, gameStatus, resignGame])

  if (timeRemaining === null) return null

  const percentage = timeRemaining > 0 ? (timeRemaining / 120) * 100 : 0
  const isLowTime = timeRemaining <= 10
  const isCritical = timeRemaining <= 5

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border-2
      ${isCritical ? 'border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' : 
        isLowTime ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
        'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}
    `}>
      <Clock className={`w-5 h-5 ${getTextColor(timeRemaining)}`} />
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isPlayerTimer ? 'Your Time' : 'Opponent Time'}
          </span>
          <span className={`text-2xl font-mono font-bold ${getTextColor(timeRemaining)}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${getTimerColor(timeRemaining)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Warning Icon */}
      {isLowTime && (
        <AlertCircle className={`w-5 h-5 ${isCritical ? 'text-red-500' : 'text-yellow-500'} animate-bounce`} />
      )}
    </div>
  )
}
