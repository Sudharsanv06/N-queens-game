import mongoose from 'mongoose'

const milestoneSchema = new mongoose.Schema({
  milestoneId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🎖️'
  },
  triggerType: {
    type: String,
    enum: ['level', 'puzzles_solved', 'queens_placed', 'total_moves', 'achievements_unlocked'],
    required: true
  },
  triggerValue: {
    type: Number,
    required: true
  },
  rewardType: {
    type: String,
    enum: ['xp', 'badge', 'points', 'multiple'],
    required: true
  },
  rewardValue: {
    xp: { type: Number, default: 0 },
    badgeId: { type: String, default: null },
    points: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

milestoneSchema.index({ isActive: 1, sortOrder: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema)

export default Milestone
