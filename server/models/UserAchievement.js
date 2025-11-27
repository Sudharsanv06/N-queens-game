import mongoose from 'mongoose'

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievementId: {
    type: String,
    required: true,
    index: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  notificationShown: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Compound index for unique user-achievement pairs
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })
userAchievementSchema.index({ userId: 1, isCompleted: 1 })
userAchievementSchema.index({ userId: 1, unlockedAt: -1 })

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema)

export default UserAchievement