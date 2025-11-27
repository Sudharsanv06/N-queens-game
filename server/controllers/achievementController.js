import Achievement from '../models/Achievement.js'
import UserAchievement from '../models/UserAchievement.js'
import achievementEngine from '../services/achievementEngine.js'

/**
 * Get all achievements
 */
export const getAllAchievements = async (req, res) => {
  try {
    const { category, tier } = req.query
    
    const filter = { isActive: true }
    if (category) filter.category = category
    if (tier) filter.tier = tier
    
    const achievements = await Achievement.find(filter).sort({ sortOrder: 1, tier: 1 })
    
    res.json({
      success: true,
      count: achievements.length,
      achievements
    })
    
  } catch (error) {
    console.error('Get all achievements error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    })
  }
}

/**
 * Get user's achievements with progress
 */
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get all achievements
    const allAchievements = await Achievement.find({ isActive: true }).sort({ category: 1, sortOrder: 1 })
    
    // Get user's achievement progress
    const userAchievements = await UserAchievement.find({ userId })
    
    // Map user progress to achievements
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userProgress = userAchievements.find(
        ua => ua.achievementId === achievement.achievementId
      )
      
      return {
        ...achievement.toObject(),
        progress: userProgress?.progress || 0,
        isCompleted: userProgress?.isCompleted || false,
        unlockedAt: userProgress?.unlockedAt || null,
        progressPercentage: Math.min(100, Math.floor((userProgress?.progress || 0) / achievement.requirementValue * 100))
      }
    })
    
    // Group by category
    const grouped = {
      progress: achievementsWithProgress.filter(a => a.category === 'progress'),
      performance: achievementsWithProgress.filter(a => a.category === 'performance'),
      puzzle: achievementsWithProgress.filter(a => a.category === 'puzzle')
    }
    
    const completed = achievementsWithProgress.filter(a => a.isCompleted).length
    
    res.json({
      success: true,
      total: achievementsWithProgress.length,
      completed,
      completionPercentage: Math.floor((completed / achievementsWithProgress.length) * 100),
      achievements: achievementsWithProgress,
      grouped
    })
    
  } catch (error) {
    console.error('Get user achievements error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user achievements',
      error: error.message
    })
  }
}

/**
 * Get specific achievement details
 */
export const getAchievementById = async (req, res) => {
  try {
    const { achievementId } = req.params
    const userId = req.user.id
    
    const achievement = await Achievement.findOne({ achievementId, isActive: true })
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      })
    }
    
    const userAchievement = await UserAchievement.findOne({ userId, achievementId })
    
    res.json({
      success: true,
      achievement: {
        ...achievement.toObject(),
        progress: userAchievement?.progress || 0,
        isCompleted: userAchievement?.isCompleted || false,
        unlockedAt: userAchievement?.unlockedAt || null
      }
    })
    
  } catch (error) {
    console.error('Get achievement by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement',
      error: error.message
    })
  }
}

/**
 * Check and unlock achievements for user (manual trigger)
 */
export const checkUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id
    
    const userStats = await achievementEngine.getUserStats(userId)
    const results = await achievementEngine.checkAchievements(userId, userStats)
    
    res.json({
      success: true,
      message: 'Achievement check completed',
      results
    })
    
  } catch (error) {
    console.error('Check achievements error:', error)
    res.status(500).json({
      success: false,
      message: 'Error checking achievements',
      error: error.message
    })
  }
}

/**
 * Mark achievement notification as shown
 */
export const markNotificationShown = async (req, res) => {
  try {
    const userId = req.user.id
    const { achievementId } = req.params
    
    await UserAchievement.findOneAndUpdate(
      { userId, achievementId },
      { notificationShown: true }
    )
    
    res.json({
      success: true,
      message: 'Notification marked as shown'
    })
    
  } catch (error) {
    console.error('Mark notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking notification',
      error: error.message
    })
  }
}

/**
 * Get unshown achievement notifications
 */
export const getUnshownNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    
    const unshownAchievements = await UserAchievement.find({
      userId,
      isCompleted: true,
      notificationShown: false
    }).sort({ unlockedAt: -1 })
    
    // Get full achievement details
    const achievementIds = unshownAchievements.map(ua => ua.achievementId)
    const achievements = await Achievement.find({ achievementId: { $in: achievementIds } })
    
    const notifications = unshownAchievements.map(ua => {
      const achievement = achievements.find(a => a.achievementId === ua.achievementId)
      return {
        ...achievement?.toObject(),
        unlockedAt: ua.unlockedAt
      }
    })
    
    res.json({
      success: true,
      count: notifications.length,
      notifications
    })
    
  } catch (error) {
    console.error('Get unshown notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    })
  }
}

/**
 * Get achievement statistics
 */
export const getAchievementStats = async (req, res) => {
  try {
    const userId = req.user.id
    
    const totalAchievements = await Achievement.countDocuments({ isActive: true })
    const userCompleted = await UserAchievement.countDocuments({ userId, isCompleted: true })
    
    const byCategory = await UserAchievement.aggregate([
      { $match: { userId: req.user._id, isCompleted: true } },
      { $group: { _id: null, achievementIds: { $push: '$achievementId' } } }
    ])
    
    const completedIds = byCategory[0]?.achievementIds || []
    const completedAchievements = await Achievement.find({ achievementId: { $in: completedIds } })
    
    const categoryStats = {
      progress: completedAchievements.filter(a => a.category === 'progress').length,
      performance: completedAchievements.filter(a => a.category === 'performance').length,
      puzzle: completedAchievements.filter(a => a.category === 'puzzle').length
    }
    
    res.json({
      success: true,
      stats: {
        total: totalAchievements,
        completed: userCompleted,
        remaining: totalAchievements - userCompleted,
        completionPercentage: Math.floor((userCompleted / totalAchievements) * 100),
        byCategory: categoryStats
      }
    })
    
  } catch (error) {
    console.error('Get achievement stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement stats',
      error: error.message
    })
  }
}

// Admin endpoints (create/update/delete achievements)
export const createAchievement = async (req, res) => {
  try {
    const achievement = new Achievement(req.body)
    await achievement.save()
    
    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      achievement
    })
    
  } catch (error) {
    console.error('Create achievement error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating achievement',
      error: error.message
    })
  }
}

export const updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params
    
    const achievement = await Achievement.findOneAndUpdate(
      { achievementId },
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Achievement updated successfully',
      achievement
    })
    
  } catch (error) {
    console.error('Update achievement error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating achievement',
      error: error.message
    })
  }
}

export const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params
    
    await Achievement.findOneAndUpdate(
      { achievementId },
      { isActive: false }
    )
    
    res.json({
      success: true,
      message: 'Achievement deactivated successfully'
    })
    
  } catch (error) {
    console.error('Delete achievement error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting achievement',
      error: error.message
    })
  }
}
