import UserXP from '../models/UserXP.js'
import UserAchievement from '../models/UserAchievement.js'
import UserBadge from '../models/UserBadge.js'
import Achievement from '../models/Achievement.js'
import Badge from '../models/Badge.js'

/**
 * Get user's XP and level information
 */
export const getUserXP = async (req, res) => {
  try {
    const userId = req.user.id
    
    let userXP = await UserXP.findOne({ userId })
    
    if (!userXP) {
      userXP = new UserXP({ userId })
      await userXP.save()
    }
    
    res.json({
      success: true,
      xp: {
        currentXP: userXP.currentXP,
        totalXP: userXP.totalXP,
        level: userXP.level,
        xpToNextLevel: userXP.xpToNextLevel,
        levelProgress: userXP.getLevelProgress(),
        lastLevelUp: userXP.lastLevelUp,
        achievementPoints: userXP.achievementPoints
      }
    })
    
  } catch (error) {
    console.error('Get user XP error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user XP',
      error: error.message
    })
  }
}

/**
 * Get XP leaderboard
 */
export const getXPLeaderboard = async (req, res) => {
  try {
    const { limit = 100, sortBy = 'level' } = req.query
    
    const sortOption = sortBy === 'totalXP' 
      ? { totalXP: -1 } 
      : { level: -1, currentXP: -1 }
    
    const leaderboard = await UserXP.find()
      .populate('userId', 'username email')
      .sort(sortOption)
      .limit(parseInt(limit))
    
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId._id,
      username: entry.userId.username,
      level: entry.level,
      totalXP: entry.totalXP,
      currentXP: entry.currentXP,
      xpToNextLevel: entry.xpToNextLevel
    }))
    
    res.json({
      success: true,
      count: formattedLeaderboard.length,
      leaderboard: formattedLeaderboard
    })
    
  } catch (error) {
    console.error('Get XP leaderboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    })
  }
}

/**
 * Get user's progress summary
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get XP
    let userXP = await UserXP.findOne({ userId })
    if (!userXP) {
      userXP = new UserXP({ userId })
      await userXP.save()
    }
    
    // Get achievements
    const totalAchievements = await Achievement.countDocuments({ isActive: true })
    const completedAchievements = await UserAchievement.countDocuments({ userId, isCompleted: true })
    
    // Get badges
    const totalBadges = await Badge.countDocuments({ isActive: true })
    const earnedBadges = await UserBadge.countDocuments({ userId })
    
    // Get recent unlocks
    const recentAchievements = await UserAchievement.find({ userId, isCompleted: true })
      .sort({ unlockedAt: -1 })
      .limit(5)
    
    const achievementIds = recentAchievements.map(ua => ua.achievementId)
    const achievements = await Achievement.find({ achievementId: { $in: achievementIds } })
    
    const recentUnlocks = recentAchievements.map(ua => {
      const achievement = achievements.find(a => a.achievementId === ua.achievementId)
      return {
        type: 'achievement',
        ...achievement?.toObject(),
        unlockedAt: ua.unlockedAt
      }
    })
    
    res.json({
      success: true,
      progress: {
        xp: {
          level: userXP.level,
          currentXP: userXP.currentXP,
          totalXP: userXP.totalXP,
          xpToNextLevel: userXP.xpToNextLevel,
          levelProgress: userXP.getLevelProgress()
        },
        achievements: {
          total: totalAchievements,
          completed: completedAchievements,
          remaining: totalAchievements - completedAchievements,
          completionPercentage: Math.floor((completedAchievements / totalAchievements) * 100)
        },
        badges: {
          total: totalBadges,
          earned: earnedBadges,
          remaining: totalBadges - earnedBadges
        },
        recentUnlocks
      }
    })
    
  } catch (error) {
    console.error('Get user progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
      error: error.message
    })
  }
}

/**
 * Get all notifications (achievements + badges)
 */
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get unshown achievements
    const unshownAchievements = await UserAchievement.find({
      userId,
      isCompleted: true,
      notificationShown: false
    }).sort({ unlockedAt: -1 })
    
    const achievementIds = unshownAchievements.map(ua => ua.achievementId)
    const achievements = await Achievement.find({ achievementId: { $in: achievementIds } })
    
    const achievementNotifications = unshownAchievements.map(ua => {
      const achievement = achievements.find(a => a.achievementId === ua.achievementId)
      return {
        type: 'achievement',
        id: ua.achievementId,
        ...achievement?.toObject(),
        unlockedAt: ua.unlockedAt
      }
    })
    
    // Get unshown badges
    const unshownBadges = await UserBadge.find({
      userId,
      notificationShown: false
    }).sort({ earnedAt: -1 })
    
    const badgeIds = unshownBadges.map(ub => ub.badgeId)
    const badges = await Badge.find({ badgeId: { $in: badgeIds } })
    
    const badgeNotifications = unshownBadges.map(ub => {
      const badge = badges.find(b => b.badgeId === ub.badgeId)
      return {
        type: 'badge',
        id: ub.badgeId,
        ...badge?.toObject(),
        earnedAt: ub.earnedAt
      }
    })
    
    // Combine and sort by date
    const allNotifications = [...achievementNotifications, ...badgeNotifications].sort((a, b) => {
      const dateA = a.unlockedAt || a.earnedAt
      const dateB = b.unlockedAt || b.earnedAt
      return dateB - dateA
    })
    
    res.json({
      success: true,
      count: allNotifications.length,
      notifications: allNotifications
    })
    
  } catch (error) {
    console.error('Get all notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    })
  }
}

/**
 * Mark all notifications as shown
 */
export const markAllNotificationsShown = async (req, res) => {
  try {
    const userId = req.user.id
    
    await UserAchievement.updateMany(
      { userId, notificationShown: false },
      { notificationShown: true }
    )
    
    await UserBadge.updateMany(
      { userId, notificationShown: false },
      { notificationShown: true }
    )
    
    res.json({
      success: true,
      message: 'All notifications marked as shown'
    })
    
  } catch (error) {
    console.error('Mark all notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking notifications',
      error: error.message
    })
  }
}

/**
 * Get reward history
 */
export const getRewardHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 50 } = req.query
    
    // Get completed achievements with timestamps
    const completedAchievements = await UserAchievement.find({ userId, isCompleted: true })
      .sort({ unlockedAt: -1 })
      .limit(parseInt(limit))
    
    const achievementIds = completedAchievements.map(ua => ua.achievementId)
    const achievements = await Achievement.find({ achievementId: { $in: achievementIds } })
    
    const achievementRewards = completedAchievements.map(ua => {
      const achievement = achievements.find(a => a.achievementId === ua.achievementId)
      return {
        type: 'achievement',
        name: achievement?.name,
        icon: achievement?.icon,
        xpReward: achievement?.rewardXP || 0,
        pointsReward: achievement?.rewardPoints || 0,
        timestamp: ua.unlockedAt
      }
    })
    
    // Get earned badges
    const earnedBadges = await UserBadge.find({ userId })
      .sort({ earnedAt: -1 })
      .limit(parseInt(limit))
    
    const badgeIds = earnedBadges.map(ub => ub.badgeId)
    const badges = await Badge.find({ badgeId: { $in: badgeIds } })
    
    const badgeRewards = earnedBadges.map(ub => {
      const badge = badges.find(b => b.badgeId === ub.badgeId)
      return {
        type: 'badge',
        name: badge?.name,
        icon: badge?.icon,
        tier: badge?.tier,
        timestamp: ub.earnedAt
      }
    })
    
    // Combine and sort
    const allRewards = [...achievementRewards, ...badgeRewards].sort((a, b) => b.timestamp - a.timestamp)
    
    res.json({
      success: true,
      count: allRewards.length,
      rewards: allRewards.slice(0, parseInt(limit))
    })
    
  } catch (error) {
    console.error('Get reward history error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching reward history',
      error: error.message
    })
  }
}
