import express from 'express'
import AchievementService from '../services/achievementService.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Get all achievements for the current user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const achievements = await AchievementService.getUserAchievements(req.user.id)
    res.json({
      success: true,
      ...achievements
    })
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    })
  }
})

// Check and unlock achievements after game completion
router.post('/check', verifyToken, async (req, res) => {
  try {
    const { gameData } = req.body
    
    if (!gameData) {
      return res.status(400).json({
        success: false,
        message: 'Game data is required'
      })
    }

    const result = await AchievementService.checkAndUnlockAchievements(req.user.id, gameData)
    
    res.json({
      success: true,
      newUnlocks: result.newUnlocks,
      totalUnlocked: result.totalUnlocked,
      message: result.totalUnlocked > 0 
        ? `Congratulations! You unlocked ${result.totalUnlocked} new achievement${result.totalUnlocked > 1 ? 's' : ''}!`
        : 'Keep playing to unlock more achievements!'
    })
  } catch (error) {
    console.error('Error checking achievements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: error.message
    })
  }
})

// Get achievement leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const leaderboard = await AchievementService.getAchievementLeaderboard(limit)
    
    res.json({
      success: true,
      leaderboard
    })
  } catch (error) {
    console.error('Error fetching achievement leaderboard:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement leaderboard',
      error: error.message
    })
  }
})

// Initialize default achievements (admin only or first-time setup)
router.post('/initialize', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or if this is initial setup
    const user = await User.findById(req.user.id)
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      })
    }

    const result = await AchievementService.initializeDefaultAchievements()
    
    res.json({
      success: true,
      message: 'Default achievements initialized',
      count: result.count
    })
  } catch (error) {
    console.error('Error initializing achievements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to initialize achievements',
      error: error.message
    })
  }
})

// Unlock secret achievement
router.post('/secret/:achievementId', verifyToken, async (req, res) => {
  try {
    const { achievementId } = req.params
    
    const result = await AchievementService.unlockSecretAchievement(req.user.id, achievementId)
    
    res.json({
      success: true,
      newUnlocks: result.newUnlocks,
      message: result.totalUnlocked > 0 
        ? 'Secret achievement unlocked! You found it!'
        : 'Secret achievement not found or already unlocked'
    })
  } catch (error) {
    console.error('Error unlocking secret achievement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to unlock secret achievement',
      error: error.message
    })
  }
})

// Get user's achievement statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const achievements = await AchievementService.getUserAchievements(req.user.id)
    
    // Additional statistics
    const user = await User.findById(req.user.id)
    const completionRate = achievements.stats.total > 0 
      ? Math.round((achievements.stats.completed / achievements.stats.total) * 100) 
      : 0

    res.json({
      success: true,
      stats: {
        ...achievements.stats,
        completionRate,
        totalExperience: user.experiencePoints,
        level: user.level,
        rank: user.rank
      }
    })
  } catch (error) {
    console.error('Error fetching achievement stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement statistics',
      error: error.message
    })
  }
})

// Get achievements by category
router.get('/category/:category', verifyToken, async (req, res) => {
  try {
    const { category } = req.params
    const achievements = await AchievementService.getUserAchievements(req.user.id)
    
    const categoryAchievements = achievements.achievements.filter(
      achievement => achievement.category === category
    )
    
    res.json({
      success: true,
      category,
      achievements: categoryAchievements,
      total: categoryAchievements.length,
      completed: categoryAchievements.filter(a => a.isCompleted).length
    })
  } catch (error) {
    console.error('Error fetching category achievements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category achievements',
      error: error.message
    })
  }
})

// Get recent achievements for user
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const achievements = await AchievementService.getUserAchievements(req.user.id)
    
    const recentAchievements = achievements.achievements
      .filter(a => a.isCompleted && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, limit)
    
    res.json({
      success: true,
      recentAchievements
    })
  } catch (error) {
    console.error('Error fetching recent achievements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent achievements',
      error: error.message
    })
  }
})

export default router
