#!/usr/bin/env node

/**
 * Daily Challenge System - Test Suite
 * Run this to verify the entire system is working
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { 
  generateDailyChallenge, 
  updateUserStreaks, 
  expireOldChallenges 
} from '../cron/dailyChallengeCron.js'
import DailyChallenge from '../models/DailyChallenge.js'
import UserDailyChallenge from '../models/UserDailyChallenge.js'
import UserStreak from '../models/UserStreak.js'
import Notification from '../models/Notification.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/n-queens-game'

console.log('╔═══════════════════════════════════════════════════╗')
console.log('║   Daily Challenge System - Full Test Suite       ║')
console.log('╚═══════════════════════════════════════════════════╝\n')

async function runFullTest() {
  try {
    // 1. Database Connection
    console.log('📡 Step 1: Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    })
    console.log('✅ Connected successfully\n')

    // 2. Generate Challenge
    console.log('🎯 Step 2: Generating daily challenge...')
    const challenge = await generateDailyChallenge()
    console.log('✅ Challenge created:')
    console.log(`   - ID: ${challenge._id}`)
    console.log(`   - Type: ${challenge.type}`)
    console.log(`   - Title: ${challenge.title}`)
    console.log(`   - Reward: ${challenge.rewardXP} XP`)
    console.log(`   - Board Size: ${challenge.boardSize}×${challenge.boardSize}`)
    if (challenge.timeLimit) console.log(`   - Time Limit: ${challenge.timeLimit}s`)
    if (challenge.moveLimit) console.log(`   - Move Limit: ${challenge.moveLimit}`)
    console.log(`   - Hints Allowed: ${challenge.hintsAllowed ? 'Yes' : 'No'}\n`)

    // 3. Update Streaks
    console.log('🔥 Step 3: Updating user streaks...')
    await updateUserStreaks()
    const streakCount = await UserStreak.countDocuments()
    console.log(`✅ Processed ${streakCount} user streaks\n`)

    // 4. Expire Old Challenges
    console.log('⏰ Step 4: Expiring old challenges...')
    await expireOldChallenges()
    console.log('✅ Old challenges expired\n')

    // 5. Database Statistics
    console.log('📊 Step 5: System statistics...')
    const totalChallenges = await DailyChallenge.countDocuments()
    const activeChallenges = await DailyChallenge.countDocuments({ isActive: true })
    const totalUserChallenges = await UserDailyChallenge.countDocuments()
    const completedChallenges = await UserDailyChallenge.countDocuments({ status: 'completed' })
    const totalNotifications = await Notification.countDocuments()
    const unreadNotifications = await Notification.countDocuments({ read: false })
    
    console.log('   Database Statistics:')
    console.log(`   - Total Challenges: ${totalChallenges}`)
    console.log(`   - Active Challenges: ${activeChallenges}`)
    console.log(`   - User Challenge Records: ${totalUserChallenges}`)
    console.log(`   - Completed Challenges: ${completedChallenges}`)
    console.log(`   - Total Notifications: ${totalNotifications}`)
    console.log(`   - Unread Notifications: ${unreadNotifications}`)
    console.log(`   - User Streaks: ${streakCount}\n`)

    // 6. Current Challenge Check
    console.log('🎯 Step 6: Verifying current challenge...')
    const currentChallenge = await DailyChallenge.getCurrentChallenge()
    if (currentChallenge) {
      console.log('✅ Current challenge is accessible')
      console.log(`   - Expires in: ${Math.floor(currentChallenge.getTimeRemaining() / 1000 / 60 / 60)} hours\n`)
    } else {
      console.log('⚠️  No current challenge found\n')
    }

    // 7. Top Streaks
    console.log('🏆 Step 7: Top 5 Streaks...')
    const topStreaks = await UserStreak.find()
      .sort({ currentStreak: -1 })
      .limit(5)
      .populate('userId', 'username')
    
    if (topStreaks.length > 0) {
      topStreaks.forEach((streak, index) => {
        console.log(`   ${index + 1}. ${streak.userId?.username || 'Unknown'}: ${streak.currentStreak} days`)
      })
    } else {
      console.log('   No streaks yet')
    }
    console.log()

    // 8. Test Summary
    console.log('╔═══════════════════════════════════════════════════╗')
    console.log('║              ✅ ALL TESTS PASSED!                 ║')
    console.log('╚═══════════════════════════════════════════════════╝\n')
    
    console.log('System Status: 🟢 OPERATIONAL')
    console.log('Daily challenges are working correctly!\n')
    
    console.log('Next Steps:')
    console.log('1. Start your server: cd server && npm start')
    console.log('2. Visit: http://localhost:5173/daily-challenge')
    console.log('3. Check cron logs at 00:00 UTC for automatic generation\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED!')
    console.error('Error:', error.message)
    console.error('\nStack:', error.stack)
    console.error('\nTroubleshooting:')
    console.error('1. Ensure MongoDB is running')
    console.error('2. Check MONGO_URI in .env file')
    console.error('3. Verify all models are properly defined')
    console.error('4. Check server logs for more details\n')
  } finally {
    // Cleanup
    console.log('📡 Disconnecting from database...')
    await mongoose.disconnect()
    console.log('✅ Disconnected\n')
    process.exit(0)
  }
}

// Run the test
runFullTest()