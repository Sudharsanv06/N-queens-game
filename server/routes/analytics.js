import express from 'express'
import AnalyticsService from '../services/analyticsService.js'
import { verifyToken } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// Middleware to check admin access for sensitive routes
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      })
    }
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin status'
    })
  }
}

// Track analytics event
router.post('/track', verifyToken, async (req, res) => {
  try {
    const {
      eventType,
      sessionId,
      gameData,
      behaviorData,
      performanceData,
      customData
    } = req.body

    if (!eventType || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Event type and session ID are required'
      })
    }

    const clientInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer')
    }

    const result = await AnalyticsService.trackEvent({
      userId: req.user.id,
      eventType,
      sessionId,
      gameData: gameData || {},
      behaviorData: behaviorData || {},
      performanceData: performanceData || {},
      customData: customData || {},
      ...clientInfo
    })

    if (result.success) {
      res.json({
        success: true,
        message: 'Event tracked successfully',
        analyticsId: result.analyticsId
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to track event',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Analytics tracking error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get dashboard overview (admin only)
router.get('/dashboard', verifyToken, adminAuth, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 24
    const result = await AnalyticsService.getDashboardStats(timeRange)

    if (result.success) {
      res.json({
        success: true,
        ...result
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get game mode analytics (admin only)
router.get('/game-modes', verifyToken, adminAuth, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 7
    const result = await AnalyticsService.getGameModeAnalytics(timeRange)

    if (result.success) {
      res.json({
        success: true,
        ...result
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch game mode analytics',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Game mode analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user engagement metrics (admin only)
router.get('/engagement', verifyToken, adminAuth, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 30
    const result = await AnalyticsService.getUserEngagementMetrics(timeRange)

    if (result.success) {
      res.json({
        success: true,
        ...result
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch engagement metrics',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Engagement metrics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get achievement analytics (admin only)
router.get('/achievements', verifyToken, adminAuth, async (req, res) => {
  try {
    const result = await AnalyticsService.getAchievementAnalytics()

    if (result.success) {
      res.json({
        success: true,
        ...result
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch achievement analytics',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Achievement analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get performance metrics (admin only)
router.get('/performance', verifyToken, adminAuth, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 24
    const result = await AnalyticsService.getPerformanceMetrics(timeRange)

    if (result.success) {
      res.json({
        success: true,
        ...result
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance metrics',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Performance metrics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Export analytics data (admin only)
router.get('/export', verifyToken, adminAuth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      eventTypes,
      userIds,
      format = 'json'
    } = req.query

    const filters = {}
    
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)
    if (eventTypes) filters.eventTypes = eventTypes.split(',')
    if (userIds) filters.userIds = userIds.split(',')

    const result = await AnalyticsService.exportAnalyticsData(filters)

    if (result.success) {
      if (format === 'csv') {
        const csv = convertToCSV(result.data)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv')
        res.send(csv)
      } else {
        res.json({
          success: true,
          data: result.data,
          count: result.count,
          exportedAt: new Date().toISOString()
        })
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics data',
        error: result.error
      })
    }
  } catch (error) {
    console.error('Analytics export error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user's own analytics (limited view) - Keep original
router.get('/my-stats', verifyToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)

    const userStats = await AnalyticsService.exportAnalyticsData({
      userIds: [req.user.id],
      startDate,
      endDate: new Date(),
      eventTypes: ['game_started', 'game_completed', 'achievement_unlocked']
    })

    if (userStats.success) {
      const stats = {
        totalGames: userStats.data.filter(event => event.eventType === 'game_started').length,
        completedGames: userStats.data.filter(event => event.eventType === 'game_completed').length,
        achievementsUnlocked: userStats.data.filter(event => event.eventType === 'achievement_unlocked').length,
        avgGameTime: 0,
        favoriteGameMode: null,
        dailyActivity: {}
      }

      const completedGamesWithTime = userStats.data.filter(
        event => event.eventType === 'game_completed' && event.gameData?.timeElapsed
      )
      
      if (completedGamesWithTime.length > 0) {
        stats.avgGameTime = Math.round(
          completedGamesWithTime.reduce((sum, game) => sum + game.gameData.timeElapsed, 0) / 
          completedGamesWithTime.length
        )
      }

      const gameModes = {}
      userStats.data.forEach(event => {
        if (event.eventType === 'game_started' && event.gameData?.mode) {
          gameModes[event.gameData.mode] = (gameModes[event.gameData.mode] || 0) + 1
        }
      })
      
      if (Object.keys(gameModes).length > 0) {
        stats.favoriteGameMode = Object.keys(gameModes).reduce((a, b) => 
          gameModes[a] > gameModes[b] ? a : b
        )
      }

      userStats.data.forEach(event => {
        const date = new Date(event.timestamp).toDateString()
        if (!stats.dailyActivity[date]) {
          stats.dailyActivity[date] = { games: 0, achievements: 0 }
        }
        
        if (event.eventType === 'game_started') {
          stats.dailyActivity[date].games++
        } else if (event.eventType === 'achievement_unlocked') {
          stats.dailyActivity[date].achievements++
        }
      })

      res.json({
        success: true,
        stats,
        timeRange
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      })
    }
  } catch (error) {
    console.error('User stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// ============================================================
// NEW: Get personal user analytics for dashboard (Day 13)
// ============================================================
router.get('/personal', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { range = 'month' } = req.query

    const now = new Date()
    let startDate = new Date()
    switch (range) {
      case 'week': startDate.setDate(now.getDate() - 7); break
      case 'month': startDate.setMonth(now.getMonth() - 1); break
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break
      case 'all': startDate = new Date(0); break
      default: startDate.setMonth(now.getMonth() - 1)
    }
    
    const Game = (await import('../models/Game.js')).default
    const games = await Game.find({
      userId,
      completedAt: { $gte: startDate },
      completed: true
    }).sort({ completedAt: 1 })
    
    // Games over time
    const gamesByDate = {}
    const winsByDate = {}
    
    games.forEach(game => {
      const date = game.completedAt.toISOString().split('T')[0]
      gamesByDate[date] = (gamesByDate[date] || 0) + 1
      if (game.won) winsByDate[date] = (winsByDate[date] || 0) + 1
    })
    
    const gamesOverTime = Object.keys(gamesByDate).map(date => ({
      date,
      games: gamesByDate[date],
      wins: winsByDate[date] || 0,
      timeSpent: games.filter(g => g.completedAt.toISOString().split('T')[0] === date)
        .reduce((sum, g) => sum + (g.timeElapsed || 0), 0)
    }))
    
    // Win rate by board size
    const sizeStats = {}
    games.forEach(game => {
      const size = `${game.boardSize}x${game.boardSize}`
      if (!sizeStats[size]) sizeStats[size] = { games: 0, wins: 0, totalTime: 0, totalMoves: 0 }
      sizeStats[size].games++
      if (game.won) sizeStats[size].wins++
      sizeStats[size].totalTime += game.timeElapsed || 0
      sizeStats[size].totalMoves += game.moves || 0
    })
    
    const winRateBySize = Object.keys(sizeStats).map(size => ({
      size,
      games: sizeStats[size].games,
      wins: sizeStats[size].wins,
      winRate: (sizeStats[size].wins / sizeStats[size].games * 100).toFixed(1),
      avgTime: Math.round(sizeStats[size].totalTime / sizeStats[size].games),
      avgMoves: Math.round(sizeStats[size].totalMoves / sizeStats[size].games)
    })).sort((a, b) => parseInt(a.size) - parseInt(b.size))
    
    // Speed improvement
    const weeklyData = {}
    games.forEach(game => {
      const weekNum = Math.floor((game.completedAt - startDate) / (7 * 24 * 60 * 60 * 1000))
      if (!weeklyData[weekNum]) {
        weeklyData[weekNum] = { times: [], bestTime: Infinity, games: 0, weekStart: game.completedAt }
      }
      weeklyData[weekNum].times.push(game.timeElapsed || 0)
      weeklyData[weekNum].bestTime = Math.min(weeklyData[weekNum].bestTime, game.timeElapsed || Infinity)
      weeklyData[weekNum].games++
    })
    
    const speedImprovement = Object.keys(weeklyData).sort((a, b) => a - b).map(week => ({
      week: `Week ${parseInt(week) + 1}`,
      avgTime: Math.round(weeklyData[week].times.reduce((a, b) => a + b, 0) / weeklyData[week].times.length),
      bestTime: weeklyData[week].bestTime === Infinity ? 0 : weeklyData[week].bestTime,
      gamesPlayed: weeklyData[week].games
    })).slice(-12)
    
    // Activity heatmap
    const heatmapData = {}
    games.forEach(game => {
      const hour = game.completedAt.getHours()
      const dayOfWeek = game.completedAt.getDay()
      const key = `${dayOfWeek}-${hour}`
      heatmapData[key] = (heatmapData[key] || 0) + 1
    })
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const activityHeatmap = days.map((day, dayIndex) => {
      const row = { day: day.slice(0, 3) }
      for (let hour = 0; hour < 24; hour++) {
        const key = `${dayIndex}-${hour}`
        row[`h${hour}`] = Math.min(100, Math.round((heatmapData[key] || 0) / Math.max(1, games.length) * 100))
      }
      return row
    })
    
    // Total stats
    const totalGames = games.length
    const totalWins = games.filter(g => g.won).length
    const totalTimePlayed = games.reduce((sum, g) => sum + (g.timeElapsed || 0), 0)
    
    const user = await User.findById(userId)
    
    res.json({
      success: true,
      gamesOverTime,
      winRateBySize,
      speedImprovement,
      activityHeatmap,
      totalStats: {
        totalGames,
        totalWins,
        winRate: totalGames > 0 ? (totalWins / totalGames * 100).toFixed(1) : 0,
        totalTimePlayed,
        averageTime: totalGames > 0 ? Math.round(totalTimePlayed / totalGames) : 0,
        bestStreak: user?.stats?.bestStreak || 0,
        currentStreak: user?.stats?.currentStreak || 0,
        achievementsUnlocked: user?.achievements?.length || 0,
        totalXP: user?.xp || 0
      },
      recentGames: games.slice(-10).reverse().map(game => ({
        date: game.completedAt,
        size: `${game.boardSize}x${game.boardSize}`,
        time: game.timeElapsed,
        moves: game.moves,
        result: game.won ? 'win' : 'loss',
        score: game.score || 0
      }))
    })
  } catch (error) {
    console.error('Personal analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal analytics',
      error: error.message
    })
  }
})

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return ''

  const headers = [
    'timestamp',
    'eventType',
    'userId',
    'sessionId',
    'gameMode',
    'boardSize',
    'timeElapsed',
    'score',
    'deviceType',
    'responseTime'
  ]

  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      row.timestamp,
      row.eventType,
      row.userId?._id || row.userId,
      row.sessionId,
      row.gameData?.mode || '',
      row.gameData?.boardSize || '',
      row.gameData?.timeElapsed || '',
      row.gameData?.score || '',
      row.behaviorData?.deviceType || '',
      row.performanceData?.responseTime || ''
    ].map(field => `"${field}"`).join(','))
  ]

  return csvRows.join('\n')
}

export default router