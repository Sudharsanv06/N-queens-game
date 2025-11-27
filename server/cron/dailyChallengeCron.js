import cron from 'node-cron'
import DailyChallenge from '../models/DailyChallenge.js'
import UserDailyChallenge from '../models/UserDailyChallenge.js'
import UserStreak from '../models/UserStreak.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { CustomPuzzle } from '../models/Puzzle.js'
import { sendPushNotification } from '../controllers/notificationController.js'

// Challenge type configurations
const challengeTypes = {
  classic: {
    title: 'Classic Challenge',
    description: 'Solve an 8×8 board within the time limit',
    boardSize: 8,
    timeLimit: 300, // 5 minutes
    rewardXP: 100,
    hintsAllowed: true,
    difficulty: 'medium'
  },
  puzzle: {
    title: 'Puzzle Challenge',
    description: 'Solve a predefined puzzle from our library',
    boardSize: 8,
    rewardXP: 120,
    hintsAllowed: true,
    difficulty: 'medium'
  },
  speedrun: {
    title: 'Speed Run',
    description: 'Complete a 6×6 board in under 90 seconds',
    boardSize: 6,
    timeLimit: 90,
    rewardXP: 150,
    hintsAllowed: true,
    difficulty: 'hard'
  },
  'no-hint': {
    title: 'No-Hint Challenge',
    description: 'Complete an 8×8 board without using any hints',
    boardSize: 8,
    timeLimit: 300,
    rewardXP: 200,
    hintsAllowed: false,
    difficulty: 'hard'
  },
  hardcore: {
    title: 'Hardcore Challenge',
    description: 'Complete an 8×8 board with a strict move limit',
    boardSize: 8,
    moveLimit: 50,
    rewardXP: 250,
    hintsAllowed: false,
    difficulty: 'expert'
  }
}

// Generate daily challenge
export const generateDailyChallenge = async () => {
  try {
    console.log('🎯 Generating daily challenge...')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if challenge already exists for today
    const existingChallenge = await DailyChallenge.getChallengeForDate(today)
    if (existingChallenge) {
      console.log('⚠️ Daily challenge already exists for today')
      return existingChallenge
    }
    
    // Determine challenge type (rotate through types)
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    const typeKeys = Object.keys(challengeTypes)
    const typeIndex = dayOfYear % typeKeys.length
    const type = typeKeys[typeIndex]
    
    const config = challengeTypes[type]
    
    // Set expiration to end of day
    const expiresAt = new Date(today)
    expiresAt.setHours(23, 59, 59, 999)
    
    // For puzzle challenges, select a random puzzle
    let puzzleId = null
    if (type === 'puzzle') {
      const puzzles = await CustomPuzzle.find({ difficulty: config.difficulty })
      if (puzzles.length > 0) {
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)]
        puzzleId = randomPuzzle._id
        config.boardSize = randomPuzzle.boardSize
      }
    }
    
    // Create challenge
    const challenge = await DailyChallenge.create({
      type,
      title: config.title,
      description: config.description,
      difficulty: config.difficulty,
      rewardXP: config.rewardXP,
      bonusMultiplier: 1.5,
      boardSize: config.boardSize,
      puzzleId,
      timeLimit: config.timeLimit || null,
      moveLimit: config.moveLimit || null,
      hintsAllowed: config.hintsAllowed,
      date: today,
      expiresAt,
      isActive: true
    })
    
    console.log(`✅ Daily challenge generated: ${challenge.title} (${challenge.type})`)
    
    // Archive previous day's challenges
    await archivePreviousChallenges(today)
    
    // Send notifications to all users
    await sendDailyChallengeNotifications(challenge)
    
    return challenge
  } catch (error) {
    console.error('❌ Error generating daily challenge:', error)
    throw error
  }
}

// Archive previous challenges
const archivePreviousChallenges = async (currentDate) => {
  try {
    const result = await DailyChallenge.updateMany(
      {
        date: { $lt: currentDate },
        isActive: true
      },
      {
        isActive: false
      }
    )
    
    console.log(`📦 Archived ${result.modifiedCount} previous challenges`)
  } catch (error) {
    console.error('Error archiving previous challenges:', error)
  }
}

// Send notifications to all users about new challenge
const sendDailyChallengeNotifications = async (challenge) => {
  try {
    // Get all users with active accounts
    const users = await User.find({ isActive: true }).select('_id')
    
    console.log(`📢 Sending notifications to ${users.length} users...`)
    
    let sentCount = 0
    
    for (const user of users) {
      try {
        // Create in-app notification
        await Notification.createNotification({
          userId: user._id,
          type: 'daily-challenge-new',
          title: '🎯 New Daily Challenge!',
          message: `${challenge.title} is now available. Earn ${challenge.rewardXP} XP!`,
          data: {
            challengeId: challenge._id,
            type: challenge.type,
            rewardXP: challenge.rewardXP
          },
          actionUrl: '/daily-challenge',
          priority: 'high'
        })
        
        // Send push notification
        await sendPushNotification(user._id, {
          title: '🎯 New Daily Challenge!',
          body: `${challenge.title} is now available`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            type: 'daily-challenge-new',
            challengeId: challenge._id.toString(),
            url: '/daily-challenge'
          }
        })
        
        sentCount++
      } catch (error) {
        console.error(`Failed to send notification to user ${user._id}:`, error.message)
      }
    }
    
    console.log(`✅ Sent ${sentCount} notifications`)
  } catch (error) {
    console.error('Error sending daily challenge notifications:', error)
  }
}

// Check and update user streaks
export const updateUserStreaks = async () => {
  try {
    console.log('🔥 Updating user streaks...')
    
    // Get all user streaks
    const streaks = await UserStreak.find({})
    
    let brokenCount = 0
    
    for (const streak of streaks) {
      if (streak.shouldBreakStreak()) {
        const oldStreak = streak.currentStreak
        streak.currentStreak = 0
        await streak.save()
        
        // Send notification about broken streak
        await Notification.createNotification({
          userId: streak.userId,
          type: 'streak-broken',
          title: '💔 Streak Broken',
          message: `Your ${oldStreak} day streak has ended. Start a new one today!`,
          data: {
            oldStreak
          },
          actionUrl: '/daily-challenge',
          priority: 'medium'
        })
        
        brokenCount++
      }
    }
    
    console.log(`⚠️ Broke ${brokenCount} streaks`)
  } catch (error) {
    console.error('Error updating user streaks:', error)
  }
}

// Expire old user challenges
export const expireOldChallenges = async () => {
  try {
    console.log('⏰ Expiring old challenges...')
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(23, 59, 59, 999)
    
    const result = await UserDailyChallenge.updateMany(
      {
        status: { $in: ['pending', 'in-progress'] },
        createdAt: { $lt: yesterday }
      },
      {
        status: 'expired'
      }
    )
    
    console.log(`⏰ Expired ${result.modifiedCount} old challenges`)
  } catch (error) {
    console.error('Error expiring old challenges:', error)
  }
}

// Initialize cron jobs
export const initializeCronJobs = () => {
  console.log('⏰ Initializing daily challenge cron jobs...')
  
  // Generate new daily challenge every day at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running daily challenge cron job at 00:00')
    
    try {
      await generateDailyChallenge()
      await updateUserStreaks()
      await expireOldChallenges()
    } catch (error) {
      console.error('Error in daily challenge cron job:', error)
    }
  }, {
    timezone: 'UTC' // Use UTC timezone, adjust as needed
  })
  
  console.log('✅ Daily challenge cron jobs initialized')
  
  // Optional: Check and update streaks every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Checking user streaks (hourly)')
    
    try {
      await updateUserStreaks()
    } catch (error) {
      console.error('Error in streak check cron job:', error)
    }
  }, {
    timezone: 'UTC'
  })
  
  console.log('✅ Streak check cron job initialized (hourly)')
}

// Manual trigger for testing
export const triggerDailyChallengeGeneration = async () => {
  console.log('🧪 Manually triggering daily challenge generation...')
  
  try {
    await generateDailyChallenge()
    await updateUserStreaks()
    await expireOldChallenges()
    
    return { success: true, message: 'Daily challenge generation completed' }
  } catch (error) {
    console.error('Error in manual trigger:', error)
    return { success: false, message: error.message }
  }
}

export default {
  initializeCronJobs,
  generateDailyChallenge,
  updateUserStreaks,
  expireOldChallenges,
  triggerDailyChallengeGeneration
}
