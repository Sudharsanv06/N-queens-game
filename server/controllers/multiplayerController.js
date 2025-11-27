import MultiplayerStats from '../models/MultiplayerStats.js'
import GameRoom from '../models/GameRoom.js'
import User from '../models/User.js'
import eloService from '../services/eloService.js'
import Notification from '../models/Notification.js'

// Get user's multiplayer profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId

    const stats = await MultiplayerStats.getOrCreate(userId)
    const user = await User.findById(userId).select('username email avatarUrl')

    // Get rank position
    const position = await MultiplayerStats.getUserRankPosition(userId)

    res.json({
      success: true,
      profile: {
        user,
        stats,
        leaderboardPosition: position
      }
    })
  } catch (error) {
    console.error('Error getting profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    })
  }
}

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, skip = 0, rank = null } = req.query

    const leaderboard = await MultiplayerStats.getLeaderboard({
      limit: parseInt(limit),
      skip: parseInt(skip),
      rank: rank || null,
      minMatches: 5
    })

    const total = await MultiplayerStats.countDocuments({
      totalMatches: { $gte: 5 },
      isActive: true
    })

    res.json({
      success: true,
      leaderboard,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + leaderboard.length < total
      }
    })
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    })
  }
}

// Get match history
export const getMatchHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId
    const { limit = 20, skip = 0 } = req.query

    const stats = await MultiplayerStats.findOne({ userId })
      .populate('recentMatches.opponent', 'username avatarUrl')
      .lean()

    if (!stats) {
      return res.json({
        success: true,
        matches: [],
        pagination: { total: 0, limit: parseInt(limit), skip: parseInt(skip) }
      })
    }

    const matches = stats.recentMatches.slice(parseInt(skip), parseInt(skip) + parseInt(limit))

    res.json({
      success: true,
      matches,
      pagination: {
        total: stats.recentMatches.length,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    })
  } catch (error) {
    console.error('Error getting match history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get match history',
      error: error.message
    })
  }
}

// Get active game rooms
export const getActiveRooms = async (req, res) => {
  try {
    const { matchType = null, status = null } = req.query

    const query = {}
    
    if (matchType) query.matchType = matchType
    if (status) query.status = status
    else query.status = { $in: ['waiting', 'ready', 'in-progress'] }

    const rooms = await GameRoom.find(query)
      .populate('player1.userId', 'username avatarUrl')
      .populate('player2.userId', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    res.json({
      success: true,
      rooms
    })
  } catch (error) {
    console.error('Error getting active rooms:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get active rooms',
      error: error.message
    })
  }
}

// Get room details
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params

    const room = await GameRoom.findOne({ roomId })
      .populate('player1.userId', 'username avatarUrl')
      .populate('player2.userId', 'username avatarUrl')
      .populate('spectators.userId', 'username avatarUrl')
      .lean()

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      })
    }

    res.json({
      success: true,
      room
    })
  } catch (error) {
    console.error('Error getting room details:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get room details',
      error: error.message
    })
  }
}

// Get ELO change preview
export const getEloPreview = async (req, res) => {
  try {
    const userId = req.user.userId
    const { opponentElo } = req.query

    if (!opponentElo) {
      return res.status(400).json({
        success: false,
        message: 'Opponent ELO is required'
      })
    }

    const stats = await MultiplayerStats.getOrCreate(userId)
    const kFactor = stats.getKFactor()

    const preview = eloService.getEloChangePreview(
      stats.elo,
      parseInt(opponentElo),
      kFactor
    )

    const winProbability = eloService.calculateWinProbability(
      stats.elo,
      parseInt(opponentElo)
    )

    res.json({
      success: true,
      currentElo: stats.elo,
      currentRank: stats.rank,
      kFactor,
      preview,
      winProbability
    })
  } catch (error) {
    console.error('Error getting ELO preview:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get ELO preview',
      error: error.message
    })
  }
}

// Get rank thresholds
export const getRankInfo = async (req, res) => {
  try {
    const thresholds = eloService.getRankThresholds()

    // Get count of players in each rank
    const rankCounts = await MultiplayerStats.aggregate([
      {
        $match: { totalMatches: { $gte: 5 }, isActive: true }
      },
      {
        $group: {
          _id: '$rank',
          count: { $sum: 1 }
        }
      }
    ])

    const counts = {}
    rankCounts.forEach(item => {
      counts[item._id] = item.count
    })

    res.json({
      success: true,
      thresholds,
      playerCounts: counts
    })
  } catch (error) {
    console.error('Error getting rank info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get rank info',
      error: error.message
    })
  }
}

// Get user stats summary
export const getStatsSummary = async (req, res) => {
  try {
    const userId = req.user.userId

    const stats = await MultiplayerStats.getOrCreate(userId)

    // Get recent performance (last 10 matches)
    const recentWins = stats.recentMatches.filter(m => m.result === 'win').length
    const recentLosses = stats.recentMatches.filter(m => m.result === 'loss').length

    // Get current form (last 5 matches)
    const form = stats.recentMatches
      .slice(0, 5)
      .map(m => m.result === 'win' ? 'W' : m.result === 'loss' ? 'L' : 'D')

    res.json({
      success: true,
      summary: {
        elo: stats.elo,
        rank: stats.rank,
        totalMatches: stats.totalMatches,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        winRate: stats.winRate,
        currentStreak: stats.currentWinStreak,
        bestStreak: stats.bestWinStreak,
        recentPerformance: {
          wins: recentWins,
          losses: recentLosses,
          form
        },
        peakElo: stats.peakElo,
        leaderboardRank: await MultiplayerStats.getUserRankPosition(userId)
      }
    })
  } catch (error) {
    console.error('Error getting stats summary:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get stats summary',
      error: error.message
    })
  }
}

// Create notification for multiplayer event
export const createMultiplayerNotification = async (userId, type, data) => {
  try {
    const notificationMap = {
      'match-found': {
        title: '🎮 Match Found!',
        message: `Your ${data.matchType} match is ready`,
        priority: 'high'
      },
      'opponent-reconnected': {
        title: '🔄 Opponent Reconnected',
        message: 'Your opponent has returned to the match',
        priority: 'medium'
      },
      'opponent-disconnected': {
        title: '⚠️ Opponent Disconnected',
        message: 'Your opponent has disconnected. Waiting for reconnection...',
        priority: 'medium'
      },
      'match-won': {
        title: '🏆 Victory!',
        message: `You won! +${data.eloChange} ELO`,
        priority: 'high'
      },
      'match-lost': {
        title: '😔 Defeat',
        message: `You lost. ${data.eloChange} ELO`,
        priority: 'medium'
      },
      'rank-up': {
        title: '⬆️ Rank Up!',
        message: `You've been promoted to ${data.newRank}!`,
        priority: 'high'
      },
      'rematch-requested': {
        title: '🔄 Rematch Requested',
        message: 'Your opponent wants a rematch!',
        priority: 'medium'
      }
    }

    const config = notificationMap[type]
    if (!config) return

    await Notification.createNotification({
      userId,
      type: `multiplayer-${type}`,
      title: config.title,
      message: config.message,
      data,
      priority: config.priority,
      actionUrl: data.roomId ? `/multiplayer/room/${data.roomId}` : '/multiplayer'
    })
  } catch (error) {
    console.error('Error creating multiplayer notification:', error)
  }
}

export default {
  getProfile,
  getLeaderboard,
  getMatchHistory,
  getActiveRooms,
  getRoomDetails,
  getEloPreview,
  getRankInfo,
  getStatsSummary,
  createMultiplayerNotification
}
