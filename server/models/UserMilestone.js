import mongoose from 'mongoose'

const userMilestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milestoneId: {
    type: String,
    required: true
  },
  achievedAt: {
    type: Date,
    default: Date.now
  },
  notificationShown: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userMilestoneSchema.index({ userId: 1, milestoneId: 1 }, { unique: true });
userMilestoneSchema.index({ userId: 1, achievedAt: -1 });

const UserMilestone = mongoose.model('UserMilestone', userMilestoneSchema)

export default UserMilestone
