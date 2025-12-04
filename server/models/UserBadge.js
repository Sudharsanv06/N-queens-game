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
  earnedAt: {
    type: Date,
    default: Date.now
  },
  isEquipped: {
    type: Boolean,
    default: false
  },
  notificationShown: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
userBadgeSchema.index({ userId: 1, earnedAt: -1 });
userBadgeSchema.index({ userId: 1, isEquipped: 1 });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema)

export default UserBadge
