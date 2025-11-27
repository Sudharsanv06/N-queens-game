import mongoose from 'mongoose'

const userStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  lastCheckedDate: {
    type: Date,
    default: null
  },
  totalChallengesCompleted: {
    type: Number,
    default: 0
  },
  streakFreezes: {
    type: Number,
    default: 0 // Feature for future: allow users to freeze streak
  },
  milestones: [{
    days: Number,
    achievedAt: Date
  }]
}, {
  timestamps: true
});

// Index for leaderboard queries
userStreakSchema.index({ currentStreak: -1 });
userStreakSchema.index({ longestStreak: -1 });

// Static method to get or create user streak
userStreakSchema.statics.getOrCreate = async function(userId) {
  let streak = await this.findOne({ userId });
  if (!streak) {
    streak = await this.create({ 
      userId,
      currentStreak: 0,
      longestStreak: 0
    });
  }
  return streak;
};

// Static method to get top streaks (leaderboard)
userStreakSchema.statics.getTopStreaks = async function(limit = 10) {
  return this.find()
    .populate('userId', 'username avatar')
    .sort({ currentStreak: -1 })
    .limit(limit);
};

// Instance method to check if streak should continue
userStreakSchema.methods.shouldContinueStreak = function() {
  if (!this.lastCompletedDate) return true; // First time
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompleted = new Date(this.lastCompletedDate);
  lastCompleted.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
  
  return daysDiff === 1; // Completed yesterday
};

// Instance method to check if streak should break
userStreakSchema.methods.shouldBreakStreak = function() {
  if (!this.lastCompletedDate) return false; // First time, no break
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompleted = new Date(this.lastCompletedDate);
  lastCompleted.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
  
  return daysDiff > 1; // Missed a day
};

// Instance method to check if already completed today
userStreakSchema.methods.hasCompletedToday = function() {
  if (!this.lastCompletedDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompleted = new Date(this.lastCompletedDate);
  lastCompleted.setHours(0, 0, 0, 0);
  
  return today.getTime() === lastCompleted.getTime();
};

// Instance method to update streak on completion
userStreakSchema.methods.updateOnCompletion = async function() {
  const today = new Date();
  
  // Check if already completed today
  if (this.hasCompletedToday()) {
    return { continued: false, broken: false, message: 'Already completed today' };
  }
  
  let continued = false;
  let broken = false;
  
  // Check if streak should break
  if (this.shouldBreakStreak()) {
    this.currentStreak = 0;
    broken = true;
  }
  
  // Check if streak should continue
  if (this.shouldContinueStreak()) {
    this.currentStreak += 1;
    continued = true;
  } else if (!broken) {
    // First completion or same day
    this.currentStreak += 1;
  }
  
  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  // Check for milestones
  const milestones = [7, 14, 30, 50, 100, 200, 365];
  if (milestones.includes(this.currentStreak)) {
    const existingMilestone = this.milestones.find(m => m.days === this.currentStreak);
    if (!existingMilestone) {
      this.milestones.push({
        days: this.currentStreak,
        achievedAt: today
      });
    }
  }
  
  this.lastCompletedDate = today;
  this.totalChallengesCompleted += 1;
  
  await this.save();
  
  return {
    continued,
    broken,
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    milestoneAchieved: milestones.includes(this.currentStreak)
  };
};

// Instance method to calculate streak bonus XP
userStreakSchema.methods.getStreakBonus = function(baseXP) {
  if (this.currentStreak <= 0) return 0;
  
  // Bonus formula: streak × 5 XP
  const streakBonus = this.currentStreak * 5;
  
  // Cap at 50% of base XP
  const maxBonus = baseXP * 0.5;
  
  return Math.min(streakBonus, maxBonus);
};

// Instance method to get streak status
userStreakSchema.methods.getStatus = function() {
  return {
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    lastCompletedDate: this.lastCompletedDate,
    totalChallengesCompleted: this.totalChallengesCompleted,
    shouldBreak: this.shouldBreakStreak(),
    completedToday: this.hasCompletedToday(),
    milestones: this.milestones
  };
};

export default mongoose.model('UserStreak', userStreakSchema)
