import DailyChallenge from '../models/DailyChallenge.js'
import UserDailyChallenge from '../models/UserDailyChallenge.js'
import UserStreak from '../models/UserStreak.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'

// Get current daily challenge
export const getCurrentChallenge = async (req, res) => {
  try {
    const challenge = await DailyChallenge.getCurrentChallenge()
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active challenge found' 
      })
    }
    
    // Get user's progress on this challenge
    let userProgress = null
    if (req.user) {
      userProgress = await UserDailyChallenge.findOne({
        userId: req.user._id,
        challengeId: challenge._id
      })
      
      // Create user challenge entry if doesn't exist
      if (!userProgress) {
        userProgress = await UserDailyChallenge.create({
          userId: req.user._id,
          challengeId: challenge._id,
          status: 'pending'
        })
      }
    }
    
    // Get user's streak info
    let streak = null
    if (req.user) {
      streak = await UserStreak.getOrCreate(req.user._id)
    }
    
    const timeRemaining = challenge.getTimeRemaining()
    
    res.json({
      success: true,
      challenge: {
        ...challenge.toObject(),
        timeRemaining
      },
      userProgress,
      streak: streak ? streak.getStatus() : null
    })
  } catch (error) {
    console.error('Get current challenge error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get current challenge',
      error: error.message 
    })
  }
}

// Get challenge history
export const getChallengeHistory = async (req, res) => {
  try {
    const { limit = 30, skip = 0 } = req.query
    
    const history = await UserDailyChallenge.find({ userId: req.user._id })
      .populate('challengeId')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
    
    const total = await UserDailyChallenge.countDocuments({ userId: req.user._id })
    
    res.json({
      success: true,
      history,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get challenge history error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get challenge history',
      error: error.message 
    })
  }
}

// Start a challenge
export const startChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body
    
    if (!challengeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge ID is required' 
      })
    }
    
    const challenge = await DailyChallenge.findById(challengeId)
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      })
    }
    
    if (challenge.isExpired()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge has expired' 
      })
    }
    
    // Get or create user challenge
    let userChallenge = await UserDailyChallenge.findOne({
      userId: req.user._id,
      challengeId: challenge._id
    })
    
    if (!userChallenge) {
      userChallenge = await UserDailyChallenge.create({
        userId: req.user._id,
        challengeId: challenge._id
      })
    }
    
    // Check if already completed
    if (userChallenge.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge already completed' 
      })
    }
    
    // Start the challenge
    await userChallenge.start()
    
    // Update challenge stats
    challenge.stats.totalAttempts += 1
    await challenge.save()
    
    res.json({
      success: true,
      message: 'Challenge started',
      userChallenge,
      challenge
    })
  } catch (error) {
    console.error('Start challenge error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start challenge',
      error: error.message 
    })
  }
}

// Complete a challenge
export const completeChallenge = async (req, res) => {
  try {
    const { 
      challengeId, 
      timeTaken, 
      movesUsed, 
      hintsUsed = 0, 
      solution,
      success = true 
    } = req.body
    
    // Validation
    if (!challengeId || timeTaken === undefined || movesUsed === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      })
    }
    
    const challenge = await DailyChallenge.findById(challengeId)
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      })
    }
    
    // Get user challenge
    let userChallenge = await UserDailyChallenge.findOne({
      userId: req.user._id,
      challengeId: challenge._id
    })
    
    if (!userChallenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not started' 
      })
    }
    
    // Check if already completed
    if (userChallenge.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge already completed' 
      })
    }
    
    // Check constraints
    if (challenge.timeLimit && timeTaken > challenge.timeLimit) {
      await userChallenge.markFailed()
      return res.status(400).json({ 
        success: false, 
        message: 'Time limit exceeded',
        userChallenge 
      })
    }
    
    if (challenge.moveLimit && movesUsed > challenge.moveLimit) {
      await userChallenge.markFailed()
      return res.status(400).json({ 
        success: false, 
        message: 'Move limit exceeded',
        userChallenge 
      })
    }
    
    if (!challenge.hintsAllowed && hintsUsed > 0) {
      await userChallenge.markFailed()
      return res.status(400).json({ 
        success: false, 
        message: 'Hints not allowed in this challenge',
        userChallenge 
      })
    }
    
    if (!success) {
      await userChallenge.markFailed()
      return res.json({
        success: true,
        message: 'Challenge marked as failed',
        userChallenge
      })
    }
    
    // Complete the challenge
    await userChallenge.complete({
      timeTaken,
      movesUsed,
      hintsUsed,
      solution
    })
    
    // Calculate performance score
    userChallenge.performanceScore = userChallenge.calculatePerformanceScore(challenge)
    
    // Get or create user streak
    const streak = await UserStreak.getOrCreate(req.user._id)
    const streakUpdate = await streak.updateOnCompletion()
    
    // Calculate rewards
    const baseXP = challenge.rewardXP
    const streakBonus = streak.getStreakBonus(baseXP)
    const totalXP = baseXP + streakBonus
    
    userChallenge.rewardXP = baseXP
    userChallenge.streakBonus = streakBonus
    userChallenge.totalReward = totalXP
    userChallenge.rewardGranted = true
    
    await userChallenge.save()
    
    // Grant XP to user
    const user = await User.findById(req.user._id)
    user.xp = (user.xp || 0) + totalXP
    
    // Check for level up
    const oldLevel = user.level || 1
    const xpForNextLevel = oldLevel * 100
    if (user.xp >= xpForNextLevel) {
      user.level = (user.level || 1) + 1
      user.xp = user.xp - xpForNextLevel
    }
    
    await user.save()
    
    // Update challenge stats
    challenge.stats.totalCompletions += 1
    challenge.stats.averageTime = 
      (challenge.stats.averageTime * (challenge.stats.totalCompletions - 1) + timeTaken) / 
      challenge.stats.totalCompletions
    challenge.stats.averageMoves = 
      (challenge.stats.averageMoves * (challenge.stats.totalCompletions - 1) + movesUsed) / 
      challenge.stats.totalCompletions
    
    if (hintsUsed === 0) {
      challenge.stats.noHintCompletions += 1
    }
    
    await challenge.save()
    
    // Create notification
    await Notification.createNotification({
      userId: req.user._id,
      type: 'daily-challenge-completed',
      title: '🎉 Challenge Completed!',
      message: `You earned ${totalXP} XP! Current streak: ${streak.currentStreak} days`,
      data: {
        challengeId: challenge._id,
        xpEarned: totalXP,
        streakBonus,
        currentStreak: streak.currentStreak
      },
      actionUrl: '/daily-challenge/history'
    })
    
    // Check streak milestone notification
    if (streakUpdate.milestoneAchieved) {
      await Notification.createNotification({
        userId: req.user._id,
        type: 'streak-milestone',
        title: `🔥 ${streak.currentStreak} Day Streak!`,
        message: `Amazing! You've maintained a ${streak.currentStreak} day streak!`,
        data: {
          streak: streak.currentStreak
        },
        priority: 'high',
        actionUrl: '/profile'
      })
    }
    
    // Check for achievements (optional integration)
    // TODO: Integrate with achievement system when available
    // await checkAchievementProgress(req.user._id, {
    //   type: 'daily-challenge-complete',
    //   data: { challengeType, difficulty, streak, noHints, performanceScore }
    // })
    
    res.json({
      success: true,
      message: 'Challenge completed!',
      userChallenge,
      rewards: {
        baseXP,
        streakBonus,
        totalXP,
        levelUp: user.level > oldLevel
      },
      streak: streakUpdate,
      user: {
        level: user.level,
        xp: user.xp
      }
    })
  } catch (error) {
    console.error('Complete challenge error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete challenge',
      error: error.message 
    })
  }
}

// Get challenge statistics
export const getChallengeStats = async (req, res) => {
  try {
    const stats = await UserDailyChallenge.getUserStats(req.user._id)
    const streak = await UserStreak.getOrCreate(req.user._id)
    
    // Get type-specific stats
    const typeStats = await UserDailyChallenge.aggregate([
      { 
        $match: { 
          userId: req.user._id,
          status: 'completed'
        } 
      },
      {
        $lookup: {
          from: 'dailychallenges',
          localField: 'challengeId',
          foreignField: '_id',
          as: 'challenge'
        }
      },
      { $unwind: '$challenge' },
      {
        $group: {
          _id: '$challenge.type',
          count: { $sum: 1 },
          avgScore: { $avg: '$performanceScore' }
        }
      }
    ])
    
    res.json({
      success: true,
      stats: {
        ...stats,
        streak: streak.getStatus(),
        byType: typeStats
      }
    })
  } catch (error) {
    console.error('Get challenge stats error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get challenge stats',
      error: error.message 
    })
  }
}

// Get user streak
export const getUserStreak = async (req, res) => {
  try {
    const streak = await UserStreak.getOrCreate(req.user._id)
    
    res.json({
      success: true,
      streak: streak.getStatus()
    })
  } catch (error) {
    console.error('Get user streak error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user streak',
      error: error.message 
    })
  }
}

// Get streak leaderboard
export const getStreakLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const topStreaks = await UserStreak.getTopStreaks(parseInt(limit))
    
    res.json({
      success: true,
      leaderboard: topStreaks
    })
  } catch (error) {
    console.error('Get streak leaderboard error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get streak leaderboard',
      error: error.message 
    })
  }
}

// Admin: Generate test challenge (for development)
export const generateTestChallenge = async (req, res) => {
  try {
    const types = ['classic', 'puzzle', 'speedrun', 'no-hint', 'hardcore']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const challengeConfigs = {
      classic: {
        title: 'Classic Challenge',
        description: 'Solve an 8×8 board within the time limit',
        boardSize: 8,
        timeLimit: 300, // 5 minutes
        rewardXP: 100,
        hintsAllowed: true
      },
      puzzle: {
        title: 'Puzzle Challenge',
        description: 'Solve a predefined puzzle',
        boardSize: 8,
        rewardXP: 120,
        hintsAllowed: true
      },
      speedrun: {
        title: 'Speed Run',
        description: 'Complete in under 90 seconds',
        boardSize: 6,
        timeLimit: 90,
        rewardXP: 150,
        hintsAllowed: true
      },
      'no-hint': {
        title: 'No-Hint Challenge',
        description: 'Complete without using any hints',
        boardSize: 8,
        timeLimit: 300,
        rewardXP: 200,
        hintsAllowed: false
      },
      hardcore: {
        title: 'Hardcore Challenge',
        description: 'Complete 8×8 with strict move limit',
        boardSize: 8,
        moveLimit: 50,
        rewardXP: 250,
        hintsAllowed: false
      }
    }
    
    const config = challengeConfigs[type]
    
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setHours(23, 59, 59, 999)
    
    const challenge = await DailyChallenge.create({
      type,
      ...config,
      difficulty: 'medium',
      date: now,
      expiresAt,
      isActive: true
    })
    
    res.json({
      success: true,
      message: 'Test challenge generated',
      challenge
    })
  } catch (error) {
    console.error('Generate test challenge error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate test challenge',
      error: error.message 
    })
  }
}
