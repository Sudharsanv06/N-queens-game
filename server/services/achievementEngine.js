import Achievement from '../models/Achievement.js'
import UserAchievement from '../models/UserAchievement.js'
import UserXP from '../models/UserXP.js'
import Badge from '../models/Badge.js'
import UserBadge from '../models/UserBadge.js'
import Milestone from '../models/Milestone.js'
import UserMilestone from '../models/UserMilestone.js'
import User from '../models/User.js'

/**
 * Achievement Engine - Automatically evaluates and unlocks achievements
 * Handles XP rewards, badge awards, and milestone tracking
 */
class AchievementEngine {
  
  /**
   * Check and unlock achievements for a user based on current stats
   * @param {String} userId - User ID
   * @param {Object} userStats - Current user statistics
   * @returns {Object} - Unlocked achievements and rewards
   */
  async checkAchievements(userId, userStats) {
    try {
      const unlockedAchievements = []
      const newBadges = []
      const levelUps = []
      
      // Get all active achievements
      const achievements = await Achievement.find({ isActive: true })
      
      // Get user's existing achievements
      const userAchievements = await UserAchievement.find({ userId })
      const completedIds = new Set(
        userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievementId)
      )
      
      // Check each achievement
      for (const achievement of achievements) {
        // Skip if already completed
        if (completedIds.has(achievement.achievementId)) continue
        
        const currentProgress = this.calculateProgress(achievement, userStats)
        const isUnlocked = this.evaluateRequirement(
          currentProgress,
          achievement.requirementValue,
          achievement.comparisonOperator
        )
        
        if (isUnlocked) {
          // Unlock achievement
          const userAchievement = await this.unlockAchievement(userId, achievement, currentProgress)
          unlockedAchievements.push({
            achievement,
            userAchievement,
            xpReward: achievement.rewardXP,
            pointsReward: achievement.rewardPoints
          })
          
          // Award XP
          const xpResult = await this.awardXP(userId, achievement.rewardXP)
          if (xpResult.levelsGained > 0) {
            levelUps.push(xpResult)
          }
          
          // Award badge if specified
          if (achievement.rewardBadgeId) {
            const badge = await this.awardBadge(userId, achievement.rewardBadgeId)
            if (badge) newBadges.push(badge)
          }
        } else {
          // Update progress
          await this.updateProgress(userId, achievement.achievementId, currentProgress)
        }
      }
      
      // Check milestones
      const milestoneResults = await this.checkMilestones(userId, userStats)
      
      return {
        success: true,
        unlockedAchievements,
        newBadges,
        levelUps,
        milestones: milestoneResults
      }
      
    } catch (error) {
      console.error('Achievement Engine Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  /**
   * Calculate current progress for an achievement based on user stats
   */
  calculateProgress(achievement, userStats) {
    const { requirementType } = achievement
    
    switch (requirementType) {
      case 'games_completed':
        return (userStats.classicGamesPlayed || 0) + (userStats.timeTrialGamesPlayed || 0)
      
      case 'puzzles_completed':
        return userStats.puzzlesSolved || 0
      
      case 'queens_placed':
        return userStats.totalQueensPlaced || 0
      
      case 'total_moves':
        return userStats.totalMoves || 0
      
      case 'solve_time':
        return userStats.fastestTime || 999999
      
      case 'puzzle_stars':
        return userStats.totalStars || 0
      
      case 'zero_hints':
        return userStats.zeroHintSolves || 0
      
      case 'streak_days':
        return userStats.currentStreak || 0
      
      case 'level_reached':
        return userStats.level || 1
      
      case 'perfect_solve':
        return userStats.perfectSolves || 0
      
      case 'efficiency':
        return userStats.averageEfficiency || 0
      
      default:
        return 0
    }
  }
  
  /**
   * Evaluate if requirement is met
   */
  evaluateRequirement(current, target, operator) {
    switch (operator) {
      case 'gte':
        return current >= target
      case 'lte':
        return current <= target
      case 'gt':
        return current > target
      case 'lt':
        return current < target
      case 'eq':
        return current === target
      default:
        return false
    }
  }
  
  /**
   * Unlock an achievement for a user
   */
  async unlockAchievement(userId, achievement, progress) {
    try {
      const userAchievement = await UserAchievement.findOneAndUpdate(
        { userId, achievementId: achievement.achievementId },
        {
          userId,
          achievementId: achievement.achievementId,
          progress,
          isCompleted: true,
          unlockedAt: new Date(),
          notificationShown: false
        },
        { upsert: true, new: true }
      )
      
      console.log(`✅ Achievement Unlocked: ${achievement.name} for user ${userId}`)
      return userAchievement
      
    } catch (error) {
      console.error('Error unlocking achievement:', error)
      throw error
    }
  }
  
  /**
   * Update achievement progress
   */
  async updateProgress(userId, achievementId, progress) {
    try {
      await UserAchievement.findOneAndUpdate(
        { userId, achievementId },
        { progress },
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }
  
  /**
   * Award XP to user and handle level ups
   */
  async awardXP(userId, xpAmount) {
    try {
      let userXP = await UserXP.findOne({ userId })
      
      if (!userXP) {
        userXP = new UserXP({ userId })
      }
      
      const result = userXP.addXP(xpAmount)
      await userXP.save()
      
      console.log(`💰 Awarded ${xpAmount} XP to user ${userId}`)
      
      if (result.levelsGained > 0) {
        console.log(`🎉 Level Up! User ${userId} reached level ${result.newLevel}`)
      }
      
      return result
      
    } catch (error) {
      console.error('Error awarding XP:', error)
      throw error
    }
  }
  
  /**
   * Award a badge to user
   */
  async awardBadge(userId, badgeId) {
    try {
      const badge = await Badge.findOne({ badgeId, isActive: true })
      if (!badge) {
        console.warn(`Badge ${badgeId} not found or inactive`)
        return null
      }
      
      // Check if user already has this badge
      const existingBadge = await UserBadge.findOne({ userId, badgeId })
      if (existingBadge) {
        return null
      }
      
      const userBadge = await UserBadge.create({
        userId,
        badgeId,
        earnedAt: new Date(),
        notificationShown: false
      })
      
      console.log(`🛡️ Badge Awarded: ${badge.name} to user ${userId}`)
      return { badge, userBadge }
      
    } catch (error) {
      console.error('Error awarding badge:', error)
      return null
    }
  }
  
  /**
   * Check and unlock milestones
   */
  async checkMilestones(userId, userStats) {
    try {
      const milestones = await Milestone.find({ isActive: true })
      const userMilestones = await UserMilestone.find({ userId })
      const achievedIds = new Set(userMilestones.map(um => um.milestoneId))
      
      const unlockedMilestones = []
      
      for (const milestone of milestones) {
        if (achievedIds.has(milestone.milestoneId)) continue
        
        let currentValue = 0
        
        switch (milestone.triggerType) {
          case 'level':
            currentValue = userStats.level || 1
            break
          case 'puzzles_solved':
            currentValue = userStats.puzzlesSolved || 0
            break
          case 'queens_placed':
            currentValue = userStats.totalQueensPlaced || 0
            break
          case 'total_moves':
            currentValue = userStats.totalMoves || 0
            break
          case 'achievements_unlocked':
            const completedCount = await UserAchievement.countDocuments({ userId, isCompleted: true })
            currentValue = completedCount
            break
        }
        
        if (currentValue >= milestone.triggerValue) {
          // Unlock milestone
          await UserMilestone.create({
            userId,
            milestoneId: milestone.milestoneId,
            achievedAt: new Date()
          })
          
          // Award rewards
          if (milestone.rewardValue.xp > 0) {
            await this.awardXP(userId, milestone.rewardValue.xp)
          }
          
          if (milestone.rewardValue.badgeId) {
            await this.awardBadge(userId, milestone.rewardValue.badgeId)
          }
          
          unlockedMilestones.push(milestone)
          console.log(`🎖️ Milestone Achieved: ${milestone.name} for user ${userId}`)
        }
      }
      
      return unlockedMilestones
      
    } catch (error) {
      console.error('Error checking milestones:', error)
      return []
    }
  }
  
  /**
   * Get user's aggregated stats for achievement checking
   */
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId)
      if (!user) throw new Error('User not found')
      
      const userXP = await UserXP.findOne({ userId })
      const completedAchievements = await UserAchievement.countDocuments({ userId, isCompleted: true })
      
      // Aggregate stats from user profile and statistics
      return {
        // Games
        classicGamesPlayed: user.statistics?.classicGamesPlayed || 0,
        timeTrialGamesPlayed: user.statistics?.timeTrialGamesPlayed || 0,
        
        // Puzzles
        puzzlesSolved: user.statistics?.puzzlesSolved || 0,
        totalStars: user.statistics?.totalStars || 0,
        
        // Performance
        totalQueensPlaced: user.statistics?.totalQueensPlaced || 0,
        totalMoves: user.statistics?.totalMoves || 0,
        fastestTime: user.statistics?.fastestTime || 999999,
        
        // Efficiency
        zeroHintSolves: user.statistics?.zeroHintSolves || 0,
        perfectSolves: user.statistics?.perfectSolves || 0,
        averageEfficiency: user.statistics?.averageEfficiency || 0,
        
        // Streaks
        currentStreak: user.statistics?.currentStreak || 0,
        
        // XP & Level
        level: userXP?.level || 1,
        totalXP: userXP?.totalXP || 0,
        
        // Achievements
        achievementsUnlocked: completedAchievements
      }
      
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  }
  
  /**
   * Trigger achievement check after specific game event
   */
  async triggerFromGameEvent(userId, eventType, eventData) {
    try {
      const userStats = await this.getUserStats(userId)
      
      // Update stats based on event
      switch (eventType) {
        case 'puzzle_completed':
          userStats.puzzlesSolved += 1
          if (eventData.stars) userStats.totalStars += eventData.stars
          if (eventData.hintsUsed === 0) userStats.zeroHintSolves += 1
          break
        
        case 'classic_completed':
          userStats.classicGamesPlayed += 1
          break
        
        case 'time_trial_completed':
          userStats.timeTrialGamesPlayed += 1
          if (eventData.time < userStats.fastestTime) {
            userStats.fastestTime = eventData.time
          }
          break
        
        case 'queen_placed':
          userStats.totalQueensPlaced += 1
          break
        
        case 'move_made':
          userStats.totalMoves += 1
          break
      }
      
      // Check achievements
      return await this.checkAchievements(userId, userStats)
      
    } catch (error) {
      console.error('Error triggering from game event:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
const achievementEngine = new AchievementEngine()
export default achievementEngine
