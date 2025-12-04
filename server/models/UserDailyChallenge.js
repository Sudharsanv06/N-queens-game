import mongoose from 'mongoose'

const userDailyChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyChallenge',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // In seconds
    default: null
  },
  movesUsed: {
    type: Number,
    default: null
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  rewardXP: {
    type: Number,
    default: 0
  },
  streakBonus: {
    type: Number,
    default: 0
  },
  totalReward: {
    type: Number,
    default: 0
  },
  rewardGranted: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  solution: {
    type: [[Number]], // Board state when completed
    default: null
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for user + challenge
userDailyChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Index for querying user's challenge history
userDailyChallengeSchema.index({ userId: 1, createdAt: -1 });

// Index for finding completed challenges
userDailyChallengeSchema.index({ userId: 1, status: 1, completedAt: -1 });

// Static method to get user's current challenge
userDailyChallengeSchema.statics.getUserCurrentChallenge = async function(userId, challengeId) {
  return this.findOne({ userId, challengeId });
};

// Static method to get user's challenge history
userDailyChallengeSchema.statics.getUserHistory = async function(userId, limit = 30) {
  return this.find({ userId })
    .populate('challengeId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get completion stats
userDailyChallengeSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgTime: { $avg: '$timeTaken' },
        avgMoves: { $avg: '$movesUsed' },
        totalXP: { $sum: '$totalReward' }
      }
    }
  ]);
  
  const completed = stats.find(s => s._id === 'completed') || { count: 0, avgTime: 0, avgMoves: 0, totalXP: 0 };
  const failed = stats.find(s => s._id === 'failed') || { count: 0 };
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  
  return {
    totalAttempts: total,
    completions: completed.count,
    failures: failed.count,
    completionRate: total > 0 ? (completed.count / total * 100).toFixed(1) : 0,
    averageTime: Math.round(completed.avgTime || 0),
    averageMoves: Math.round(completed.avgMoves || 0),
    totalXPEarned: completed.totalXP || 0
  };
};

// Instance method to calculate performance score
userDailyChallengeSchema.methods.calculatePerformanceScore = function(challenge) {
  if (this.status !== 'completed') return 0;
  
  let score = 100;
  
  // Time penalty (if time limit exists)
  if (challenge.timeLimit && this.timeTaken) {
    const timeRatio = this.timeTaken / challenge.timeLimit;
    if (timeRatio > 0.9) score -= 20;
    else if (timeRatio > 0.75) score -= 10;
    else if (timeRatio > 0.5) score -= 5;
  }
  
  // Move penalty (if move limit exists)
  if (challenge.moveLimit && this.movesUsed) {
    const moveRatio = this.movesUsed / challenge.moveLimit;
    if (moveRatio > 0.9) score -= 20;
    else if (moveRatio > 0.75) score -= 10;
    else if (moveRatio > 0.5) score -= 5;
  }
  
  // Hint penalty
  score -= (this.hintsUsed * 5);
  
  // Attempts penalty
  if (this.attempts > 1) {
    score -= ((this.attempts - 1) * 10);
  }
  
  return Math.max(0, Math.min(100, score));
};

// Instance method to start challenge
userDailyChallengeSchema.methods.start = async function() {
  this.status = 'in-progress';
  this.attempts += 1;
  this.startedAt = new Date();
  return this.save();
};

// Instance method to complete challenge
userDailyChallengeSchema.methods.complete = async function(data) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.timeTaken = data.timeTaken;
  this.movesUsed = data.movesUsed;
  this.hintsUsed = data.hintsUsed || 0;
  this.solution = data.solution;
  return this.save();
};

// Instance method to mark as failed
userDailyChallengeSchema.methods.markFailed = async function() {
  this.status = 'failed';
  return this.save();
};

export default mongoose.model('UserDailyChallenge', userDailyChallengeSchema)
