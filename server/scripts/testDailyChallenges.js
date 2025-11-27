import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { generateDailyChallenge, updateUserStreaks, expireOldChallenges } from '../cron/dailyChallengeCron.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/n-queens-game'

console.log('🧪 Daily Challenge Test Script')
console.log('================================')

async function runTest() {
  try {
    // Connect to database
    console.log('📡 Connecting to database...')
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      family: 4
    })
    console.log('✅ Connected to MongoDB')

    // Run daily challenge generation
    console.log('\n🎯 Generating daily challenge...')
    const challenge = await generateDailyChallenge()
    console.log('✅ Challenge generated:', {
      id: challenge._id,
      type: challenge.type,
      title: challenge.title,
      rewardXP: challenge.rewardXP,
      boardSize: challenge.boardSize
    })

    // Update streaks
    console.log('\n🔥 Updating user streaks...')
    await updateUserStreaks()
    console.log('✅ User streaks updated')

    // Expire old challenges
    console.log('\n⏰ Expiring old challenges...')
    await expireOldChallenges()
    console.log('✅ Old challenges expired')

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    // Disconnect
    console.log('\n📡 Disconnecting from database...')
    await mongoose.disconnect()
    console.log('✅ Disconnected')
    process.exit(0)
  }
}

runTest()
