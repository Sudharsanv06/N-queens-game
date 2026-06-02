import mongoose from 'mongoose'

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: null   // null until actually completed
  },
  // Tracks numeric progress toward the requirementValue
  // e.g. 3 out of 5 multiplayer wins → currentValue: 3
  currentValue: {
    type: Number,
    default: 0
  },
  // Legacy field kept for backward compatibility — mirrors currentValue / requirementValue ratio
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  notificationShown: {
    type: Boolean,
    default: false
  },
  // Stores context about what triggered the unlock or last progress update
  // e.g. { gameId, boardSize, solveTimeSeconds, challengeDate, roomId }
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Compound index for unique user-achievement pairs
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })
userAchievementSchema.index({ userId: 1, isCompleted: 1 })
userAchievementSchema.index({ userId: 1, unlockedAt: -1 })
// For finding users who haven't been notified yet (notification queue)
userAchievementSchema.index({ userId: 1, isCompleted: 1, notificationShown: 1 })

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema)

export default UserAchievement