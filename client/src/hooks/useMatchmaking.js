import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  joinQueue,
  leaveQueue,
  updateQueueStatus,
  incrementWaitTime,
  setMatchFound,
  setMatchType,
  updatePreferences,
  setSearching,
  setMatchmakingError,
  clearMatchmakingError
} from '../store/slices/matchmakingSlice'
import { useMultiplayerSocket } from './useMultiplayerSocket'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Custom hook for matchmaking operations
 * Handles queue management, match finding, and status updates
 */
export const useMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { joinMatchmakingQueue, leaveMatchmakingQueue: leaveSocketQueue } = useMultiplayerSocket()

  const {
    isInQueue,
    queueStartTime,
    waitTime,
    selectedMatchType,
    preferences,
    matchFound,
    matchData,
    isSearching,
    error
  } = useSelector((state) => state.matchmaking)

  const { user } = useSelector((state) => state.auth)

  // Join matchmaking queue
  const handleJoinQueue = useCallback(
    async (matchType = selectedMatchType, customPreferences = {}) => {
      if (isInQueue) {
        console.warn('Already in queue')
        return
      }

      if (!user) {
        toast.error('Please log in to play')
        navigate('/auth/login')
        return
      }

      try {
        dispatch(setSearching(true))
        dispatch(clearMatchmakingError())

        // Update Redux state
        dispatch(
          joinQueue({
            matchType,
            preferences: { ...preferences, ...customPreferences }
          })
        )

        // Emit socket event to join queue
        joinMatchmakingQueue(matchType, { ...preferences, ...customPreferences })

        // Also call API endpoint for backup/logging
        const token = localStorage.getItem('token')
        await axios.post(
          `${API_URL}/api/matchmaking/join`,
          { matchType, preferences: { ...preferences, ...customPreferences } },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        toast.success(`Searching for ${matchType} match...`)
      } catch (err) {
        console.error('Error joining queue:', err)
        dispatch(setMatchmakingError(err.response?.data?.message || 'Failed to join queue'))
        toast.error('Failed to join matchmaking')
        dispatch(leaveQueue())
      } finally {
        dispatch(setSearching(false))
      }
    },
    [
      isInQueue,
      user,
      selectedMatchType,
      preferences,
      dispatch,
      joinMatchmakingQueue,
      navigate
    ]
  )

  // Leave matchmaking queue
  const handleLeaveQueue = useCallback(async () => {
    if (!isInQueue) {
      return
    }

    try {
      // Emit socket event to leave queue
      leaveSocketQueue()

      // Call API endpoint
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/api/matchmaking/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update Redux state
      dispatch(leaveQueue())

      toast.info('Left matchmaking queue')
    } catch (err) {
      console.error('Error leaving queue:', err)
      // Leave queue anyway in Redux
      dispatch(leaveQueue())
    }
  }, [isInQueue, leaveSocketQueue, dispatch])

  // Fetch queue status
  const fetchQueueStatus = useCallback(async (matchType = null) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/matchmaking/status`, {
        params: { matchType },
        headers: { Authorization: `Bearer ${token}` }
      })

      dispatch(updateQueueStatus(response.data))
      return response.data
    } catch (err) {
      console.error('Error fetching queue status:', err)
      return null
    }
  }, [dispatch])

  // Fetch player status
  const fetchPlayerStatus = useCallback(async () => {
    if (!isInQueue) return null

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/matchmaking/player-status`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      dispatch(updateQueueStatus(response.data))
      return response.data
    } catch (err) {
      console.error('Error fetching player status:', err)
      return null
    }
  }, [isInQueue, dispatch])

  // Change match type (only when not in queue)
  const handleSetMatchType = useCallback(
    (matchType) => {
      if (isInQueue) {
        toast.error('Leave queue first to change match type')
        return
      }
      dispatch(setMatchType(matchType))
    },
    [isInQueue, dispatch]
  )

  // Update preferences
  const handleUpdatePreferences = useCallback(
    (newPreferences) => {
      if (isInQueue) {
        toast.error('Leave queue first to change preferences')
        return
      }
      dispatch(updatePreferences(newPreferences))
    },
    [isInQueue, dispatch]
  )

  // Navigate to room when match is found
  useEffect(() => {
    if (matchFound && matchData) {
      console.log('Match found, navigating to room:', matchData.roomId)
      navigate(`/multiplayer/room/${matchData.roomId}`)
    }
  }, [matchFound, matchData, navigate])

  // Update wait time every second when in queue
  useEffect(() => {
    if (!isInQueue) return

    const interval = setInterval(() => {
      dispatch(incrementWaitTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [isInQueue, dispatch])

  // Fetch queue status periodically when in queue
  useEffect(() => {
    if (!isInQueue) return

    // Fetch immediately
    fetchPlayerStatus()

    // Then every 5 seconds
    const interval = setInterval(() => {
      fetchPlayerStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [isInQueue, fetchPlayerStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInQueue) {
        handleLeaveQueue()
      }
    }
  }, []) // Empty deps - only run on unmount

  return {
    // State
    isInQueue,
    queueStartTime,
    waitTime,
    selectedMatchType,
    preferences,
    matchFound,
    matchData,
    isSearching,
    error,

    // Actions
    joinQueue: handleJoinQueue,
    leaveQueue: handleLeaveQueue,
    setMatchType: handleSetMatchType,
    updatePreferences: handleUpdatePreferences,
    fetchQueueStatus,
    fetchPlayerStatus,
    clearError: () => dispatch(clearMatchmakingError())
  }
}
