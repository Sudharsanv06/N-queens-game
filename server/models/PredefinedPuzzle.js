import mongoose from 'mongoose';

/**
 * Predefined Puzzle Schema
 * Pre-created puzzles with specific configurations
 */
const predefinedPuzzleSchema = new mongoose.Schema({
  puzzleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  puzzleName: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  n: {
    type: Number,
    required: true,
    min: 4,
    max: 20
  },
  initialQueens: [{
    row: { type: Number, required: true },
    col: { type: Number, required: true }
  }],
  solution: [{
    row: { type: Number, required: true },
    col: { type: Number, required: true }
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  expectedMinTime: {
    type: Number, // in seconds
    required: true
  },
  maxHints: {
    type: Number,
    default: 3
  },
  tags: [String],
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'master', 'daily'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  stats: {
    totalAttempts: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    fastestTime: { type: Number, default: null },
    averageStars: { type: Number, default: 0 }
  }
}, { timestamps: true });

/**
 * Puzzle Attempt Schema
 * Tracks user attempts at puzzles
 */
const puzzleAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  puzzleId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  attempts: {
    type: Number,
    default: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  solved: {
    type: Boolean,
    default: false
  },
  movesUsed: {
    type: Number,
    default: 0
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  boardState: {
    queens: [{
      row: Number,
      col: Number
    }],
    lockedQueens: [{
      row: Number,
      col: Number
    }]
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'gave_up'],
    default: 'in_progress'
  },
  performance: {
    type: String,
    enum: ['excellent', 'good', 'average', 'needs_improvement'],
    default: 'average'
  }
}, { timestamps: true });

// Indexes
predefinedPuzzleSchema.index({ difficulty: 1, n: 1 });
predefinedPuzzleSchema.index({ category: 1, order: 1 });
predefinedPuzzleSchema.index({ isActive: 1, order: 1 });

puzzleAttemptSchema.index({ userId: 1, puzzleId: 1 });
puzzleAttemptSchema.index({ userId: 1, solved: 1 });
puzzleAttemptSchema.index({ userId: 1, createdAt: -1 });
puzzleAttemptSchema.index({ puzzleId: 1, solved: 1, timeTaken: 1 });

// Methods
predefinedPuzzleSchema.methods.recordAttempt = function(completed, timeTaken, stars) {
  this.stats.totalAttempts += 1;
  
  if (completed) {
    this.stats.completions += 1;
    
    // Update fastest time
    if (!this.stats.fastestTime || timeTaken < this.stats.fastestTime) {
      this.stats.fastestTime = timeTaken;
    }
    
    // Update average time
    const totalTime = this.stats.averageTime * (this.stats.completions - 1) + timeTaken;
    this.stats.averageTime = Math.round(totalTime / this.stats.completions);
    
    // Update average stars
    const totalStars = this.stats.averageStars * (this.stats.completions - 1) + stars;
    this.stats.averageStars = (totalStars / this.stats.completions).toFixed(2);
  }
  
  return this.save();
};

puzzleAttemptSchema.methods.calculateStars = function(expectedMinTime) {
  if (!this.solved || !this.timeTaken) return 0;
  
  if (this.timeTaken <= expectedMinTime) {
    return 3; // Excellent - met or beat expected time
  } else if (this.timeTaken <= expectedMinTime * 1.5) {
    return 2; // Good - within 50% of expected time
  } else if (this.timeTaken <= expectedMinTime * 2) {
    return 1; // Average - within 100% of expected time
  } else {
    return 1; // At least they completed it
  }
};

puzzleAttemptSchema.methods.calculatePerformance = function() {
  if (this.stars === 3) return 'excellent';
  if (this.stars === 2) return 'good';
  if (this.stars === 1) return 'average';
  return 'needs_improvement';
};

export const PredefinedPuzzle = mongoose.model('PredefinedPuzzle', predefinedPuzzleSchema);
export const PuzzleAttempt = mongoose.model('PuzzleAttempt', puzzleAttemptSchema);
