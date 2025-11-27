import Achievement from '../models/Achievement.js'
import UserAchievement from '../models/UserAchievement.js'
import User from '../models/User.js'
import PushNotificationService from './pushNotificationService.js'

export class AchievementService {
  
  // Initialize default achievements
  static async initializeDefaultAchievements() {
    try {
      const defaultAchievements = [
        // Game Completion Achievements
        {
          id: 'first_win',
          name: 'First Victory',
          description: 'Complete your first N-Queens puzzle',
          icon: '🏆',
          category: 'game',
          difficulty: 'bronze',
          points: 100,
          requirements: { type: 'games_won', value: 1, condition: 'gte' },
          unlockMessage: 'Congratulations on your first victory! The journey begins!'
        },
        {
          id: 'novice_solver',
          name: 'Novice Solver',
          description: 'Complete 10 N-Queens puzzles',
          icon: '🥉',
          category: 'game',
          difficulty: 'bronze',
          points: 250,
          requirements: { type: 'games_won', value: 10, condition: 'gte' }
        },
        {
          id: 'puzzle_master',
          name: 'Puzzle Master',
          description: 'Complete 50 N-Queens puzzles',
          icon: '🥈',
          category: 'game',
          difficulty: 'silver',
          points: 500,
          requirements: { type: 'games_won', value: 50, condition: 'gte' }
        },
        {
          id: 'grand_master',
          name: 'Grand Master',
          description: 'Complete 200 N-Queens puzzles',
          icon: '🥇',
          category: 'game',
          difficulty: 'gold',
          points: 1000,
          requirements: { type: 'games_won', value: 200, condition: 'gte' }
        },

        // Daily Challenge Achievements
        {
          id: 'daily_challenger',
          name: 'Daily Challenger',
          description: 'Complete 3 daily challenges in a row',
          icon: '📅',
          category: 'challenge',
          difficulty: 'bronze',
          points: 200,
          requirements: { type: 'daily_streak', value: 3, condition: 'gte' }
        },
        {
          id: 'streak_warrior',
          name: 'Streak Warrior',
          description: 'Maintain a 7-day daily challenge streak',
          icon: '🔥',
          category: 'challenge',
          difficulty: 'silver',
          points: 400,
          requirements: { type: 'daily_streak', value: 7, condition: 'gte' }
        },
        {
          id: 'unstoppable',
          name: 'Unstoppable',
          description: 'Maintain a 30-day daily challenge streak',
          icon: '⚡',
          category: 'challenge',
          difficulty: 'gold',
          points: 800,
          requirements: { type: 'daily_streak', value: 30, condition: 'gte' }
        },

        // Speed Achievements
        {
          id: 'speed_demon',
          name: 'Speed Demon',
          description: 'Solve an 8x8 puzzle in under 2 minutes',
          icon: '💨',
          category: 'speed',
          difficulty: 'silver',
          points: 300,
          requirements: { type: 'speed_solve', value: 120, condition: 'lte' }
        },
        {
          id: 'lightning_fast',
          name: 'Lightning Fast',
          description: 'Solve an 8x8 puzzle in under 1 minute',
          icon: '⚡',
          category: 'speed',
          difficulty: 'gold',
          points: 600,
          requirements: { type: 'speed_solve', value: 60, condition: 'lte' }
        },

        // Skill Achievements
        {
          id: 'perfectionist',
          name: 'Perfectionist',
          description: 'Complete a puzzle without using any hints',
          icon: '💎',
          category: 'skill',
          difficulty: 'silver',
          points: 400,
          requirements: { type: 'hints_avoided', value: 1, condition: 'gte' }
        },
        {
          id: 'big_board_master',
          name: 'Big Board Master',
          description: 'Complete a 12x12 puzzle',
          icon: '🎯',
          category: 'skill',
          difficulty: 'gold',
          points: 800,
          requirements: { type: 'board_size', value: 12, condition: 'gte' }
        },

        // Score Achievements
        {
          id: 'high_scorer',
          name: 'High Scorer',
          description: 'Reach a total score of 10,000 points',
          icon: '📈',
          category: 'milestone',
          difficulty: 'silver',
          points: 500,
          requirements: { type: 'total_score', value: 10000, condition: 'gte' }
        },
        {
          id: 'score_legend',
          name: 'Score Legend',
          description: 'Reach a total score of 100,000 points',
          icon: '👑',
          category: 'milestone',
          difficulty: 'platinum',
          points: 2000,
          requirements: { type: 'total_score', value: 100000, condition: 'gte' }
        },

        // Multiplayer Achievements
        {
          id: 'multiplayer_champion',
          name: 'Multiplayer Champion',
          description: 'Win 10 multiplayer games',
          icon: '🏅',
          category: 'social',
          difficulty: 'silver',
          points: 600,
          requirements: { type: 'multiplayer_wins', value: 10, condition: 'gte' }
        },

        // Secret Achievement
        {
          id: 'easter_egg',
          name: 'Easter Egg Hunter',
          description: 'Found the hidden easter egg!',
          icon: '🥚',
          category: 'milestone',
          difficulty: 'diamond',
          points: 1000,
          requirements: { type: 'easter_egg', value: 1, condition: 'gte' },
          isSecret: true,
          unlockMessage: 'You found the secret! Your curiosity has been rewarded!'
        }
      ]

      for (const achievementData of defaultAchievements) {
        await Achievement.findOneAndUpdate(
          { id: achievementData.id },
          achievementData,
          { upsert: true, new: true }
        )
      }

      console.log('Default achievements initialized')
      return { success: true, count: defaultAchievements.length }
    } catch (error) {
      console.error('Error initializing achievements:', error)
      throw error
    }
  }

  // Check and unlock achievements for a user
  static async checkAndUnlockAchievements(userId, gameData = {}) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const allAchievements = await Achievement.find({ isActive: true })
      const newUnlocks = []

      for (const achievement of allAchievements) {
        // Check if user already has this achievement
        const existingProgress = await UserAchievement.findOne({
          userId,
          achievementId: achievement.id
        })

        if (existingProgress && existingProgress.isCompleted) {
          continue // Already unlocked
        }

        // Check if user meets requirements
        const meetsRequirements = await this.checkRequirements(user, achievement, gameData)
        
        if (meetsRequirements.unlocked) {
          // Create or update achievement progress
          const progress = await UserAchievement.findOneAndUpdate(
            { userId, achievementId: achievement.id },
            {
              userId,
              achievementId: achievement.id,
              progress: {
                current: meetsRequirements.progress,
                target: achievement.requirements.value,
                percentage: 100
              },
              isCompleted: true,
              unlockedAt: new Date(),
              metadata: meetsRequirements.metadata || {}
            },
            { upsert: true, new: true }
          )

          // Add to user's achievements array (legacy support)
          if (!user.achievements.some(a => a.name === achievement.name)) {
            user.achievements.push({
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              unlockedAt: new Date()
            })
          }

          // Add points to user
          user.addExperience(achievement.points)
          user.stats.totalScore += achievement.points

          newUnlocks.push({
            achievement,
            progress,
            points: achievement.points
          })

          // Send push notification
          try {
            await PushNotificationService.sendAchievementNotification(userId, achievement)
          } catch (notificationError) {
            console.warn('Failed to send achievement notification:', notificationError)
          }
        } else if (meetsRequirements.progress > 0) {
          // Update progress for incomplete achievement
          await UserAchievement.findOneAndUpdate(
            { userId, achievementId: achievement.id },
            {
              userId,
              achievementId: achievement.id,
              progress: {
                current: meetsRequirements.progress,
                target: achievement.requirements.value
              },
              metadata: meetsRequirements.metadata || {}
            },
            { upsert: true, new: true }
          )
        }
      }

      // Save user changes
      await user.save()

      return {
        success: true,
        newUnlocks,
        totalUnlocked: newUnlocks.length
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
      throw error
    }
  }

  // Check if user meets achievement requirements
  static async checkRequirements(user, achievement, gameData = {}) {
    const { type, value, condition } = achievement.requirements
    let currentValue = 0
    let metadata = {}

    switch (type) {
      case 'games_won':
        currentValue = user.stats.gamesWon
        break

      case 'daily_streak':
        currentValue = user.stats.currentStreak
        break

      case 'speed_solve':
        if (gameData.timeElapsed && gameData.boardSize >= 8) {
          currentValue = gameData.timeElapsed
          metadata = { boardSize: gameData.boardSize, time: gameData.timeElapsed }
        } else {
          return { unlocked: false, progress: 0 }
        }
        break

      case 'total_score':
        currentValue = user.stats.totalScore
        break

      case 'board_size':
        if (gameData.boardSize) {
          currentValue = gameData.boardSize
          metadata = { boardSize: gameData.boardSize }
        } else {
          return { unlocked: false, progress: 0 }
        }
        break

      case 'perfect_games':
        if (gameData.hintsUsed === 0 && gameData.solved) {
          currentValue = 1
          metadata = { perfectGame: true }
        } else {
          return { unlocked: false, progress: 0 }
        }
        break

      case 'multiplayer_wins':
        currentValue = user.stats.multiplayerWins
        break

      case 'hints_avoided':
        if (gameData.hintsUsed === 0 && gameData.solved) {
          currentValue = 1
          metadata = { hintsAvoided: true }
        } else {
          return { unlocked: false, progress: 0 }
        }
        break

      case 'time_played':
        currentValue = user.stats.totalTime
        break

      case 'consecutive_wins':
        currentValue = user.stats.currentStreak
        break

      default:
        return { unlocked: false, progress: 0 }
    }

    // Check condition
    let unlocked = false
    switch (condition) {
      case 'gte':
        unlocked = currentValue >= value
        break
      case 'lte':
        unlocked = currentValue <= value
        break
      case 'eq':
        unlocked = currentValue === value
        break
    }

    return {
      unlocked,
      progress: currentValue,
      metadata
    }
  }

  // Get user's achievements and progress
  static async getUserAchievements(userId) {
    try {
      const userAchievements = await UserAchievement.find({ userId })
        .populate('achievementId')
        .sort({ unlockedAt: -1 })

      const allAchievements = await Achievement.find({ isActive: true })
        .sort({ difficulty: 1, category: 1 })

      const achievementsWithProgress = allAchievements.map(achievement => {
        const userProgress = userAchievements.find(
          ua => ua.achievementId === achievement.id
        )

        return {
          ...achievement.toObject(),
          progress: userProgress ? userProgress.progress : { current: 0, target: achievement.requirements.value, percentage: 0 },
          isCompleted: userProgress ? userProgress.isCompleted : false,
          unlockedAt: userProgress ? userProgress.unlockedAt : null,
          metadata: userProgress ? userProgress.metadata : {}
        }
      })

      const stats = {
        total: allAchievements.length,
        completed: userAchievements.filter(ua => ua.isCompleted).length,
        inProgress: userAchievements.filter(ua => !ua.isCompleted && ua.progress.current > 0).length,
        points: userAchievements
          .filter(ua => ua.isCompleted)
          .reduce((sum, ua) => {
            const achievement = allAchievements.find(a => a.id === ua.achievementId)
            return sum + (achievement ? achievement.points : 0)
          }, 0)
      }

      return {
        achievements: achievementsWithProgress,
        stats
      }
    } catch (error) {
      console.error('Error getting user achievements:', error)
      throw error
    }
  }

  // Get achievement leaderboard
  static async getAchievementLeaderboard(limit = 10) {
    try {
      const leaderboard = await User.aggregate([
        {
          $addFields: {
            achievementCount: { $size: '$achievements' }
          }
        },
        {
          $sort: { achievementCount: -1, 'stats.totalScore': -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            name: 1,
            achievementCount: 1,
            'stats.totalScore': 1,
            'stats.gamesWon': 1,
            level: 1,
            rank: 1
          }
        }
      ])

      return leaderboard
    } catch (error) {
      console.error('Error getting achievement leaderboard:', error)
      throw error
    }
  }

  // Unlock secret achievement
  static async unlockSecretAchievement(userId, achievementId) {
    try {
      const achievement = await Achievement.findOne({ id: achievementId, isSecret: true })
      if (!achievement) {
        throw new Error('Secret achievement not found')
      }

      const result = await this.checkAndUnlockAchievements(userId, { easter_egg: 1 })
      return result
    } catch (error) {
      console.error('Error unlocking secret achievement:', error)
      throw error
    }
  }
}

export default AchievementService