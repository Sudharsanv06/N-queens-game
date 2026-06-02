import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  achievementId: {
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
  category: {
    type: String,
    enum: ['progress', 'performance', 'puzzle', 'daily_challenge', 'multiplayer', 'social'],
    required: true,
    index: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  requirementType: {
    type: String,
    enum: [
      // Original types
      'games_completed',
      'puzzles_completed',
      'queens_placed',
      'total_moves',
      'solve_time',
      'puzzle_stars',
      'zero_hints',
      'streak_days',
      'level_reached',
      'perfect_solve',
      'efficiency',
      // Daily challenge types (used by dailyChallengeController)
      'daily_challenge_complete',
      'daily_challenge_streak',
      'daily_challenge_perfect',   // completed with no hints
      'daily_challenge_fast',      // completed under time threshold
      // Multiplayer types
      'multiplayer_win',
      'multiplayer_games_played',
      'multiplayer_win_streak',
      // Puzzle creation types
      'puzzle_created',
      'puzzle_solved',
      'puzzle_rated'
    ],
    required: true
  },
  requirementValue: {
    type: Number,
    required: true
  },
  comparisonOperator: {
    type: String,
    enum: ['gte', 'lte', 'eq', 'gt', 'lt'],
    default: 'gte'
  },
  rewardPoints: {
    type: Number,
    default: 100
  },
  rewardXP: {
    type: Number,
    default: 50
  },
  rewardBadgeId: {
    type: String,
    default: null
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  }
}, {
  timestamps: true
})

// Index for efficient querying
achievementSchema.index({ category: 1, sortOrder: 1 })
achievementSchema.index({ isActive: 1, category: 1 })
achievementSchema.index({ requirementType: 1, isActive: 1 })

const Achievement = mongoose.model('Achievement', achievementSchema)

export default Achievement