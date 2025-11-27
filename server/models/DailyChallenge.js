import mongoose from 'mongoose'

const dailyChallengeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['classic', 'puzzle', 'speedrun', 'no-hint', 'hardcore'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  rewardXP: {
    type: Number,
    required: true,
    default: 100
  },
  rewardBadgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    default: null
  },
  bonusMultiplier: {
    type: Number,
    default: 1.5 // Streak bonus multiplier
  },
  boardSize: {
    type: Number,
    min: 4,
    max: 12,
    default: 8
  },
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
    default: null // Used for puzzle challenges
  },
  timeLimit: {
    type: Number, // In seconds
    default: null // null means no time limit
  },
  moveLimit: {
    type: Number,
    default: null // null means no move limit
  },
  hintsAllowed: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    totalAttempts: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    averageMoves: { type: Number, default: 0 },
    noHintCompletions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// Index for finding active challenges
dailyChallengeSchema.index({ date: 1, isActive: 1 })

// Index for finding challenges by type
dailyChallengeSchema.index({ type: 1, date: -1 })

// Static method to get current challenge
dailyChallengeSchema.statics.getCurrentChallenge = async function() {
  const now = new Date()
  return this.findOne({
    date: { $lte: now },
    expiresAt: { $gt: now },
    isActive: true
  }).sort({ date: -1 })
}

// Static method to get challenge for specific date
dailyChallengeSchema.statics.getChallengeForDate = async function(date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return this.findOne({
    date: { $gte: startOfDay, $lte: endOfDay },
    isActive: true
  })
}

// Instance method to check if challenge is expired
dailyChallengeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt
}

// Instance method to calculate time remaining
dailyChallengeSchema.methods.getTimeRemaining = function() {
  const now = new Date()
  const remaining = this.expiresAt - now
  return remaining > 0 ? remaining : 0
}

export default mongoose.model('DailyChallenge', dailyChallengeSchema)
