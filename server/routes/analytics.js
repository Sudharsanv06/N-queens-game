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

    // Extract client info from request
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
        // Convert to CSV format
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

// Get user's own analytics (limited view)
router.get('/my-stats', verifyToken, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)

    // Get user's game statistics from Analytics collection
    const userStats = await AnalyticsService.exportAnalyticsData({
      userIds: [req.user.id],
      startDate,
      endDate: new Date(),
      eventTypes: ['game_started', 'game_completed', 'achievement_unlocked']
    })

    if (userStats.success) {
      // Process the data to create meaningful stats
      const stats = {
        totalGames: userStats.data.filter(event => event.eventType === 'game_started').length,
        completedGames: userStats.data.filter(event => event.eventType === 'game_completed').length,
        achievementsUnlocked: userStats.data.filter(event => event.eventType === 'achievement_unlocked').length,
        avgGameTime: 0,
        favoriteGameMode: null,
        dailyActivity: {}
      }

      // Calculate average game time
      const completedGamesWithTime = userStats.data.filter(
        event => event.eventType === 'game_completed' && event.gameData?.timeElapsed
      )
      
      if (completedGamesWithTime.length > 0) {
        stats.avgGameTime = Math.round(
          completedGamesWithTime.reduce((sum, game) => sum + game.gameData.timeElapsed, 0) / 
          completedGamesWithTime.length
        )
      }

      // Find favorite game mode
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

      // Daily activity breakdown
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
