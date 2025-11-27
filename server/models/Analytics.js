import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Event tracking
  eventType: {
    type: String,
    required: true,
    enum: [
      'game_started',
      'game_completed',
      'game_abandoned',
      'hint_used',
      'achievement_unlocked',
      'daily_challenge_completed',
      'multiplayer_joined',
      'multiplayer_completed',
      'tutorial_completed',
      'settings_changed',
      'social_share',
      'puzzle_created',
      'puzzle_shared'
    ],
    index: true
  },
  
  // Session tracking
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Game-specific data
  gameData: {
    mode: String, // classic, time-trial, daily-challenge, multiplayer, etc.
    boardSize: Number,
    difficulty: String,
    timeElapsed: Number,
    movesCount: Number,
    hintsUsed: Number,
    score: Number,
    completed: Boolean,
    level: Number
  },
  
  // User behavior data
  behaviorData: {
    deviceType: String, // mobile, desktop, tablet
    browserType: String,
    screenResolution: String,
    platform: String, // web, ios, android
    timeOnPage: Number,
    clicksCount: Number,
    scrollDepth: Number
  },
  
  // Performance data
  performanceData: {
    loadTime: Number,
    renderTime: Number,
    responseTime: Number,
    errorCount: Number,
    errorTypes: [String]
  },
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  ipAddress: String,
  userAgent: String,
  referrer: String,
  
  // Custom event data
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  // Automatically remove old analytics data after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60
})

// Compound indexes for efficient queries
analyticsSchema.index({ userId: 1, eventType: 1, timestamp: -1 })
analyticsSchema.index({ sessionId: 1, timestamp: 1 })
analyticsSchema.index({ eventType: 1, timestamp: -1 })
analyticsSchema.index({ 'gameData.mode': 1, timestamp: -1 })

// Static methods for analytics queries
analyticsSchema.statics.getUserGameStats = async function(userId, timeRange = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeRange)
  
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        eventType: { $in: ['game_started', 'game_completed'] },
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgTime: { $avg: '$gameData.timeElapsed' },
        avgScore: { $avg: '$gameData.score' },
        avgMoves: { $avg: '$gameData.movesCount' }
      }
    }
  ])
}

analyticsSchema.statics.getSystemMetrics = async function(timeRange = 24) {
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - timeRange)
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          eventType: '$eventType'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgPerformance: { $avg: '$performanceData.responseTime' }
      }
    },
    {
      $group: {
        _id: '$_id.hour',
        events: {
          $push: {
            type: '$_id.eventType',
            count: '$count',
            uniqueUsers: { $size: '$uniqueUsers' },
            avgPerformance: '$avgPerformance'
          }
        },
        totalEvents: { $sum: '$count' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ])
}

analyticsSchema.statics.getPopularGameModes = async function(timeRange = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeRange)
  
  return await this.aggregate([
    {
      $match: {
        eventType: 'game_started',
        timestamp: { $gte: startDate },
        'gameData.mode': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$gameData.mode',
        totalGames: { $sum: 1 },
        uniquePlayers: { $addToSet: '$userId' },
        avgCompletionTime: { $avg: '$gameData.timeElapsed' },
        avgScore: { $avg: '$gameData.score' }
      }
    },
    {
      $project: {
        mode: '$_id',
        totalGames: 1,
        uniquePlayers: { $size: '$uniquePlayers' },
        avgCompletionTime: 1,
        avgScore: 1
      }
    },
    {
      $sort: { totalGames: -1 }
    }
  ])
}

analyticsSchema.statics.getUserRetention = async function(cohortDate) {
  const cohortStart = new Date(cohortDate)
  const cohortEnd = new Date(cohortStart)
  cohortEnd.setDate(cohortEnd.getDate() + 1)
  
  // Get users who joined in the cohort period
  const cohortUsers = await this.distinct('userId', {
    eventType: 'game_started',
    timestamp: { $gte: cohortStart, $lt: cohortEnd }
  })
  
  if (cohortUsers.length === 0) return []
  
  // Track retention for 30 days
  const retentionData = []
  
  for (let day = 1; day <= 30; day++) {
    const checkDate = new Date(cohortStart)
    checkDate.setDate(checkDate.getDate() + day)
    
    const nextDay = new Date(checkDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const activeUsers = await this.distinct('userId', {
      userId: { $in: cohortUsers },
      timestamp: { $gte: checkDate, $lt: nextDay }
    })
    
    retentionData.push({
      day,
      date: checkDate,
      activeUsers: activeUsers.length,
      retentionRate: (activeUsers.length / cohortUsers.length) * 100
    })
  }
  
  return retentionData
}

const Analytics = mongoose.model('Analytics', analyticsSchema)

export default Analytics