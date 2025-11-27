import matchmakingService from '../services/matchmakingService.js'
import MultiplayerStats from '../models/MultiplayerStats.js'
import User from '../models/User.js'

// Join matchmaking queue
export const joinQueue = async (req, res) => {
  try {
    const { matchType, preferences } = req.body
    const userId = req.user.userId
    const socketId = req.body.socketId || null

    if (!matchType || !['standard', 'speed', 'puzzle-duel'].includes(matchType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match type. Must be: standard, speed, or puzzle-duel'
      })
    }

    const result = await matchmakingService.addToQueue(userId, socketId, matchType, preferences)

    res.json(result)
  } catch (error) {
    console.error('Error joining queue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join queue',
      error: error.message
    })
  }
}

// Leave matchmaking queue
export const leaveQueue = async (req, res) => {
  try {
    const userId = req.user.userId

    const result = matchmakingService.removeFromQueue(userId)

    res.json(result)
  } catch (error) {
    console.error('Error leaving queue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to leave queue',
      error: error.message
    })
  }
}

// Get queue status
export const getQueueStatus = async (req, res) => {
  try {
    const { matchType } = req.query

    const status = matchmakingService.getQueueStatus(matchType || null)

    res.json({
      success: true,
      status
    })
  } catch (error) {
    console.error('Error getting queue status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: error.message
    })
  }
}

// Get player's queue status
export const getPlayerQueueStatus = async (req, res) => {
  try {
    const userId = req.user.userId

    const status = matchmakingService.getPlayerStatus(userId)

    res.json({
      success: true,
      status
    })
  } catch (error) {
    console.error('Error getting player queue status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get player queue status',
      error: error.message
    })
  }
}

// Get matchmaking statistics
export const getMatchmakingStats = async (req, res) => {
  try {
    const stats = matchmakingService.getStatistics()

    res.json({
      success: true,
      statistics: stats
    })
  } catch (error) {
    console.error('Error getting matchmaking stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get matchmaking statistics',
      error: error.message
    })
  }
}

// Clear queue (admin only)
export const clearQueue = async (req, res) => {
  try {
    const { matchType } = req.body

    const result = matchmakingService.clearQueue(matchType || null)

    res.json(result)
  } catch (error) {
    console.error('Error clearing queue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear queue',
      error: error.message
    })
  }
}

// Find optimal opponent (for testing)
export const findOpponent = async (req, res) => {
  try {
    const userId = req.user.userId
    const { matchType } = req.body

    // Get user stats
    const userStats = await MultiplayerStats.getOrCreate(userId)
    const user = await User.findById(userId).select('username avatarUrl')

    // Simulate adding to queue
    const player = {
      userId: userId.toString(),
      socketId: null,
      elo: userStats.elo,
      rank: userStats.rank,
      wins: userStats.wins,
      losses: userStats.losses,
      queuedAt: Date.now(),
      preferences: {
        preferredEloRange: 200,
        maxWaitTime: 25000
      }
    }

    const match = await matchmakingService.findMatch(matchType, player)

    if (!match) {
      return res.json({
        success: true,
        match: null,
        message: 'No suitable opponents found'
      })
    }

    res.json({
      success: true,
      match
    })
  } catch (error) {
    console.error('Error finding opponent:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to find opponent',
      error: error.message
    })
  }
}

export default {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getPlayerQueueStatus,
  getMatchmakingStats,
  clearQueue,
  findOpponent
}
