import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema({
  badgeId: {
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
    default: '🛡️'
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['progress', 'performance', 'puzzle', 'special'],
    required: true
  },
  unlockCondition: {
    achievementId: String,
    description: String
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
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

badgeSchema.index({ tier: 1, category: 1 });
badgeSchema.index({ isActive: 1 });

const Badge = mongoose.model('Badge', badgeSchema)

export default Badge
