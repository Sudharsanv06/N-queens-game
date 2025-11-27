import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const fixDatabaseIndexes = async () => {
  try {
    console.log('🔧 Starting database index fix...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nqueens')
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    
    // Fix achievements collection
    console.log('\n📋 Fixing achievements collection...')
    const achievementsCollection = db.collection('achievements')
    
    // Get all indexes
    const indexes = await achievementsCollection.indexes()
    console.log('Current indexes:', indexes.map(idx => idx.name))
    
    // Check for problematic 'id_1' index
    const hasIdIndex = indexes.some(idx => idx.name === 'id_1')
    if (hasIdIndex) {
      console.log('🗑️  Dropping problematic "id_1" index...')
      await achievementsCollection.dropIndex('id_1')
      console.log('✅ Dropped "id_1" index')
    } else {
      console.log('ℹ️  No "id_1" index found (already clean)')
    }
    
    // Remove documents with null id field
    console.log('🗑️  Removing documents with null "id" field...')
    const deleteResult = await achievementsCollection.deleteMany({ id: null })
    console.log(`✅ Removed ${deleteResult.deletedCount} document(s) with null id`)
    
    // Remove documents with null id field (case-insensitive check)
    const deleteResult2 = await achievementsCollection.deleteMany({ id: { $exists: true, $eq: null } })
    console.log(`✅ Removed ${deleteResult2.deletedCount} additional document(s)`)
    
    // Clear entire collection to start fresh (optional but recommended)
    console.log('\n🧹 Clearing achievements collection for fresh seed...')
    const clearResult = await achievementsCollection.deleteMany({})
    console.log(`✅ Cleared ${clearResult.deletedCount} achievement document(s)`)
    
    // Fix badges collection (same issue might exist)
    console.log('\n📋 Fixing badges collection...')
    const badgesCollection = db.collection('badges')
    
    const badgeIndexes = await badgesCollection.indexes()
    console.log('Current badge indexes:', badgeIndexes.map(idx => idx.name))
    
    const hasBadgeIdIndex = badgeIndexes.some(idx => idx.name === 'id_1')
    if (hasBadgeIdIndex) {
      console.log('🗑️  Dropping problematic badge "id_1" index...')
      await badgesCollection.dropIndex('id_1')
      console.log('✅ Dropped badge "id_1" index')
    }
    
    const badgeDeleteResult = await badgesCollection.deleteMany({ id: null })
    console.log(`✅ Removed ${badgeDeleteResult.deletedCount} badge document(s) with null id`)
    
    console.log('\n🧹 Clearing badges collection for fresh seed...')
    const clearBadgeResult = await badgesCollection.deleteMany({})
    console.log(`✅ Cleared ${clearBadgeResult.deletedCount} badge document(s)`)
    
    // Fix milestones collection
    console.log('\n📋 Fixing milestones collection...')
    const milestonesCollection = db.collection('milestones')
    
    const milestoneIndexes = await milestonesCollection.indexes()
    console.log('Current milestone indexes:', milestoneIndexes.map(idx => idx.name))
    
    const hasMilestoneIdIndex = milestoneIndexes.some(idx => idx.name === 'id_1')
    if (hasMilestoneIdIndex) {
      console.log('🗑️  Dropping problematic milestone "id_1" index...')
      await milestonesCollection.dropIndex('id_1')
      console.log('✅ Dropped milestone "id_1" index')
    }
    
    const milestoneDeleteResult = await milestonesCollection.deleteMany({ id: null })
    console.log(`✅ Removed ${milestoneDeleteResult.deletedCount} milestone document(s) with null id`)
    
    console.log('\n🧹 Clearing milestones collection for fresh seed...')
    const clearMilestoneResult = await milestonesCollection.deleteMany({})
    console.log(`✅ Cleared ${clearMilestoneResult.deletedCount} milestone document(s)`)
    
    console.log('\n🎉 Database index fix complete!')
    console.log('✅ All problematic indexes removed')
    console.log('✅ All null-id documents removed')
    console.log('✅ Collections cleared for fresh seeding')
    console.log('\n📝 Next step: Run the seed script')
    console.log('   node scripts/seedAchievements.js')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error fixing database indexes:', error)
    process.exit(1)
  }
}

// Run fix
fixDatabaseIndexes()
