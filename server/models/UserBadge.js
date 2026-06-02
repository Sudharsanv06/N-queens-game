import mongoose from 'mongoose'

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: String,
    required: true
  },

  // Fixed: was Date.now (always set on doc creation, even before badge is earned).
  // Now null until the badge is actually awarded — same fix as UserAchievement.earnedAt.
  earnedAt: {
    type: Date,
    default: null
  },

  // Whether the user has this badge displayed on their profile
  isEquipped: {
    type: Boolean,
    default: false
  },

  // Whether the earned notification/toast has been shown to the user
  notificationShown: {
    type: Boolean,
    default: false
  },

  // Context about what triggered the badge (gameId, challengeDate, roomId, boardSize, etc.)
  // Mirrors UserAchievement.metadata — used for display ("Earned on daily challenge 2024-01-15")
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Unique constraint: one record per user+badge combination
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })

// Newest badges first for profile/collection display
userBadgeSchema.index({ userId: 1, earnedAt: -1 })

// Filter to currently equipped badges (profile display)
userBadgeSchema.index({ userId: 1, isEquipped: 1 })

// Notification queue: fetch all earned badges that haven't shown a notification yet
// Mirrors UserAchievement's notification index pattern
userBadgeSchema.index({ userId: 1, earnedAt: 1, notificationShown: 1 })

const UserBadge = mongoose.model('UserBadge', userBadgeSchema)

export default UserBadge