import Analytics from '../models/Analytics.js'
import User from '../models/User.js'
import Achievement from '../models/Achievement.js'
import UserAchievement from '../models/UserAchievement.js'

class AnalyticsService {
  
  // Track user events
  static async trackEvent(data) {
    try {
      const {
        userId,
        eventType,
        sessionId,
        gameData = {},
        behaviorData = {},
        performanceData = {},
        customData = {},
        ipAddress,
        userAgent,
        referrer
      } = data

      const analytics = new Analytics({
        userId,
        eventType,
        sessionId,
        gameData,
        behaviorData,
        performanceData,
        customData,
        ipAddress,
        userAgent,
        referrer
      })

      await analytics.save()
      return { success: true, analyticsId: analytics._id }
    } catch (error) {
      console.error('Error tracking event:', error)
      return { success: false, error: error.message }
    }
  }

  // Get dashboard overview stats
  static async getDashboardStats(timeRange = 24) {
    try {
      const startDate = new Date()
      startDate.setHours(startDate.getHours() - timeRange)

      // Total users
      const totalUsers = await User.countDocuments()
      
      // Active users in time range
      const activeUsers = await Analytics.distinct('userId', {
        timestamp: { $gte: startDate }
      })

      // Total games played
      const totalGames = await Analytics.countDocuments({
        eventType: 'game_started',
        timestamp: { $gte: startDate }
      })

      // Games completed
      const completedGames = await Analytics.countDocuments({
        eventType: 'game_completed',
        timestamp: { $gte: startDate }
      })

      // Total achievements unlocked
      const achievementsUnlocked = await Analytics.countDocuments({
        eventType: 'achievement_unlocked',
        timestamp: { $gte: startDate }
      })

      // Average session time
      const sessionStats = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            'behaviorData.timeOnPage': { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            avgSessionTime: { $avg: '$behaviorData.timeOnPage' },
            totalSessions: { $sum: 1 }
          }
        }
      ])

      // Device breakdown
      const deviceStats = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            'behaviorData.deviceType': { $exists: true }
          }
        },
        {
          $group: {
            _id: '$behaviorData.deviceType',
            count: { $sum: 1 }
          }
        }
      ])

      return {
        success: true,
        stats: {
          totalUsers,
          activeUsers: activeUsers.length,
          totalGames,
          completedGames,
          completionRate: totalGames > 0 ? (completedGames / totalGames) * 100 : 0,
          achievementsUnlocked,
          avgSessionTime: sessionStats[0]?.avgSessionTime || 0,
          totalSessions: sessionStats[0]?.totalSessions || 0,
          deviceBreakdown: deviceStats
        }
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Get game mode analytics
  static async getGameModeAnalytics(timeRange = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeRange)

      const gameModeStats = await Analytics.aggregate([
        {
          $match: {
            eventType: { $in: ['game_started', 'game_completed'] },
            timestamp: { $gte: startDate },
            'gameData.mode': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              mode: '$gameData.mode',
              eventType: '$eventType'
            },
            count: { $sum: 1 },
            avgTime: { $avg: '$gameData.timeElapsed' },
            avgScore: { $avg: '$gameData.score' },
            avgMoves: { $avg: '$gameData.movesCount' },
            avgHints: { $avg: '$gameData.hintsUsed' }
          }
        },
        {
          $group: {
            _id: '$_id.mode',
            started: {
              $sum: {
                $cond: [{ $eq: ['$_id.eventType', 'game_started'] }, '$count', 0]
              }
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$_id.eventType', 'game_completed'] }, '$count', 0]
              }
            },
            avgTime: { $avg: '$avgTime' },
            avgScore: { $avg: '$avgScore' },
            avgMoves: { $avg: '$avgMoves' },
            avgHints: { $avg: '$avgHints' }
          }
        },
        {
          $project: {
            mode: '$_id',
            started: 1,
            completed: 1,
            completionRate: {
              $cond: [
                { $gt: ['$started', 0] },
                { $multiply: [{ $divide: ['$completed', '$started'] }, 100] },
                0
              ]
            },
            avgTime: { $round: ['$avgTime', 2] },
            avgScore: { $round: ['$avgScore', 2] },
            avgMoves: { $round: ['$avgMoves', 2] },
            avgHints: { $round: ['$avgHints', 2] }
          }
        },
        {
          $sort: { started: -1 }
        }
      ])

      return {
        success: true,
        gameModeStats
      }
    } catch (error) {
      console.error('Error getting game mode analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user engagement metrics
  static async getUserEngagementMetrics(timeRange = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeRange)

      // Daily active users
      const dailyActiveUsers = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            uniqueUsers: { $addToSet: '$userId' },
            totalEvents: { $sum: 1 }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            activeUsers: { $size: '$uniqueUsers' },
            totalEvents: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ])

      // User retention by cohort
      const cohortAnalysis = await this.getCohortAnalysis(7) // Last 7 days of cohorts

      // Most active users
      const topUsers = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            totalEvents: { $sum: 1 },
            gamesPlayed: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'game_started'] }, 1, 0]
              }
            },
            achievementsUnlocked: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'achievement_unlocked'] }, 1, 0]
              }
            },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            totalEvents: 1,
            gamesPlayed: 1,
            achievementsUnlocked: 1,
            lastActivity: 1
          }
        },
        {
          $sort: { totalEvents: -1 }
        },
        {
          $limit: 10
        }
      ])

      return {
        success: true,
        engagement: {
          dailyActiveUsers,
          cohortAnalysis,
          topUsers
        }
      }
    } catch (error) {
      console.error('Error getting user engagement metrics:', error)
      return { success: false, error: error.message }
    }
  }

  // Get achievement analytics
  static async getAchievementAnalytics() {
    try {
      // Total achievements available
      const totalAchievements = await Achievement.countDocuments({ isActive: true })

      // Achievement unlock rates
      const achievementStats = await UserAchievement.aggregate([
        {
          $match: { isCompleted: true }
        },
        {
          $group: {
            _id: '$achievementId',
            unlockedCount: { $sum: 1 },
            avgProgress: { $avg: '$progress.percentage' }
          }
        },
        {
          $lookup: {
            from: 'achievements',
            localField: '_id',
            foreignField: 'id',
            as: 'achievement'
          }
        },
        {
          $unwind: '$achievement'
        },
        {
          $project: {
            name: '$achievement.name',
            category: '$achievement.category',
            difficulty: '$achievement.difficulty',
            points: '$achievement.points',
            unlockedCount: 1,
            avgProgress: { $round: ['$avgProgress', 2] }
          }
        },
        {
          $sort: { unlockedCount: -1 }
        }
      ])

      // Achievement category breakdown
      const categoryStats = await UserAchievement.aggregate([
        {
          $match: { isCompleted: true }
        },
        {
          $lookup: {
            from: 'achievements',
            localField: 'achievementId',
            foreignField: 'id',
            as: 'achievement'
          }
        },
        {
          $unwind: '$achievement'
        },
        {
          $group: {
            _id: '$achievement.category',
            count: { $sum: 1 },
            totalPoints: { $sum: '$achievement.points' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])

      return {
        success: true,
        achievementAnalytics: {
          totalAchievements,
          achievementStats,
          categoryStats
        }
      }
    } catch (error) {
      console.error('Error getting achievement analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Get system performance metrics
  static async getPerformanceMetrics(timeRange = 24) {
    try {
      const startDate = new Date()
      startDate.setHours(startDate.getHours() - timeRange)

      const performanceStats = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            'performanceData.responseTime': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              hour: { $hour: '$timestamp' }
            },
            avgResponseTime: { $avg: '$performanceData.responseTime' },
            avgLoadTime: { $avg: '$performanceData.loadTime' },
            errorCount: { $sum: '$performanceData.errorCount' },
            totalRequests: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.hour': 1 }
        }
      ])

      // Error breakdown
      const errorStats = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            'performanceData.errorTypes': { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$performanceData.errorTypes'
        },
        {
          $group: {
            _id: '$performanceData.errorTypes',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])

      return {
        success: true,
        performance: {
          hourlyStats: performanceStats,
          errorBreakdown: errorStats
        }
      }
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper method for cohort analysis
  static async getCohortAnalysis(days = 7) {
    try {
      const cohorts = []
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const cohortDate = new Date(today)
        cohortDate.setDate(cohortDate.getDate() - i)
        
        const retention = await Analytics.getUserRetention(cohortDate)
        if (retention.length > 0) {
          cohorts.push({
            cohortDate,
            size: retention[0]?.activeUsers || 0,
            retention
          })
        }
      }

      return cohorts
    } catch (error) {
      console.error('Error in cohort analysis:', error)
      return []
    }
  }

  // Export analytics data
  static async exportAnalyticsData(filters = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        eventTypes = [],
        userIds = []
      } = filters

      const query = {
        timestamp: { $gte: startDate, $lte: endDate }
      }

      if (eventTypes.length > 0) {
        query.eventType = { $in: eventTypes }
      }

      if (userIds.length > 0) {
        query.userId = { $in: userIds }
      }

      const data = await Analytics.find(query)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .lean()

      return {
        success: true,
        data,
        count: data.length
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error)
      return { success: false, error: error.message }
    }
  }
}

export default AnalyticsService