import mongoose from 'mongoose'

const customPuzzleSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  boardSize: {
    type: Number,
    required: true,
    min: 4,
    max: 20
  },
  solution: [{
    row: { type: Number, required: true },
    col: { type: Number, required: true }
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  category: {
    type: String,
    enum: ['classic', 'themed', 'challenge', 'educational'],
    default: 'classic'
  },
  theme: {
    name: String,
    description: String,
    constraints: [{
      type: String, // 'forbidden_squares', 'required_squares', 'symmetric'
      data: mongoose.Schema.Types.Mixed
    }]
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'featured', 'archived'],
    default: 'draft'
  },
  tags: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  stats: {
    attempts: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    bestTime: Number,
    likes: { type: Number, default: 0 }
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

const puzzleCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  puzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPuzzle'
  }],
  theme: {
    name: String,
    color: String,
    icon: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['mixed', 'easy', 'medium', 'hard', 'expert'],
    default: 'mixed'
  },
  tags: [String],
  stats: {
    totalPuzzles: { type: Number, default: 0 },
    completedBy: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  }
}, { timestamps: true })

const userPuzzleProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  puzzle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPuzzle',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'gave_up'],
    default: 'not_started'
  },
  attempts: { type: Number, default: 0 },
  bestTime: Number,
  lastAttempt: Date,
  currentBoard: [[Number]], // Save current state
  hintsUsed: { type: Number, default: 0 },
  moves: { type: Number, default: 0 }
}, { timestamps: true })

// Indexes
customPuzzleSchema.index({ creator: 1, createdAt: -1 })
customPuzzleSchema.index({ isPublic: 1, status: 1, createdAt: -1 })
customPuzzleSchema.index({ difficulty: 1, boardSize: 1 })
customPuzzleSchema.index({ 'rating.average': -1 })
customPuzzleSchema.index({ tags: 1 })

puzzleCollectionSchema.index({ creator: 1, createdAt: -1 })
puzzleCollectionSchema.index({ isPublic: 1, createdAt: -1 })

userPuzzleProgressSchema.index({ user: 1, puzzle: 1 }, { unique: true })
userPuzzleProgressSchema.index({ user: 1, status: 1 })

// Methods
customPuzzleSchema.methods.addRating = function(userId, score) {
  const existingRating = this.rating.ratings.find(r => r.user.toString() === userId.toString())
  
  if (existingRating) {
    existingRating.score = score
  } else {
    this.rating.ratings.push({ user: userId, score })
    this.rating.count += 1
  }
  
  // Recalculate average
  const sum = this.rating.ratings.reduce((acc, r) => acc + r.score, 0)
  this.rating.average = sum / this.rating.ratings.length
  
  return this.save()
}

customPuzzleSchema.methods.recordCompletion = function(timeElapsed) {
  this.stats.completions += 1
  
  if (!this.stats.bestTime || timeElapsed < this.stats.bestTime) {
    this.stats.bestTime = timeElapsed
  }
  
  // Update average time
  const totalTime = this.stats.averageTime * (this.stats.completions - 1) + timeElapsed
  this.stats.averageTime = Math.round(totalTime / this.stats.completions)
  
  return this.save()
}

export const CustomPuzzle = mongoose.model('CustomPuzzle', customPuzzleSchema)
export const PuzzleCollection = mongoose.model('PuzzleCollection', puzzleCollectionSchema)
export const UserPuzzleProgress = mongoose.model('UserPuzzleProgress', userPuzzleProgressSchema)