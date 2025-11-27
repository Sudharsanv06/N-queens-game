import mongoose from 'mongoose'

const userXPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentXP: {
    type: Number,
    default: 0,
    min: 0
  },
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  xpToNextLevel: {
    type: Number,
    default: 50 // Level 1 → 2
  },
  lastLevelUp: {
    type: Date,
    default: null
  },
  achievementPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate XP needed for next level: level² × 50
userXPSchema.methods.calculateXPForNextLevel = function() {
  const nextLevel = this.level + 1;
  return Math.pow(nextLevel, 2) * 50;
};

// Add XP and handle level ups
userXPSchema.methods.addXP = function(xpAmount) {
  this.currentXP += xpAmount;
  this.totalXP += xpAmount;
  
  let levelsGained = 0;
  
  // Check for level ups
  while (this.currentXP >= this.xpToNextLevel) {
    this.currentXP -= this.xpToNextLevel;
    this.level += 1;
    levelsGained++;
    this.xpToNextLevel = this.calculateXPForNextLevel();
    this.lastLevelUp = new Date();
  }
  
  return {
    levelsGained,
    newLevel: this.level,
    currentXP: this.currentXP,
    xpToNextLevel: this.xpToNextLevel
  };
};

// Get level progress percentage
userXPSchema.methods.getLevelProgress = function() {
  return Math.floor((this.currentXP / this.xpToNextLevel) * 100);
};

// Index for leaderboard
userXPSchema.index({ level: -1, currentXP: -1 });
userXPSchema.index({ totalXP: -1 });

const UserXP = mongoose.model('UserXP', userXPSchema)

export default UserXP
