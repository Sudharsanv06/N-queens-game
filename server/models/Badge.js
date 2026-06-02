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

  // Added: daily_challenge, multiplayer, social — mirrors Achievement.js categories
  category: {
    type: String,
    enum: [
      'progress',
      'performance',
      'puzzle',
      'special',
      'daily_challenge',
      'multiplayer',
      'social'
    ],
    required: true
  },

  // How this badge is unlocked — either tied to an achievement or a standalone requirement
  unlockCondition: {
    // If set, badge unlocks automatically when this achievement is earned
    achievementId: {
      type: String,
      default: null
    },
    // If achievementId is null, use these fields for standalone unlock logic
    requirementType: {
      type: String,
      enum: [
        // Games played
        'games_played',
        'games_won',
        'win_streak',
        // Puzzle
        'puzzles_solved',
        'puzzle_board_size',
        'puzzle_speed_solve',
        'puzzle_no_hints',
        // Daily challenge
        'daily_challenge_complete',
        'daily_challenge_streak',
        'daily_challenge_perfect',
        'daily_challenge_fast',
        // Multiplayer
        'multiplayer_win',
        'multiplayer_games_played',
        'multiplayer_win_streak',
        // Social / misc
        'puzzle_created',
        'puzzle_rated',
        'total_xp',
        'account_age_days'
      ],
      default: null
    },
    requirementValue: {
      type: Number,
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },

  // XP awarded when badge is earned (badges can give XP independently of achievements)
  xpReward: {
    type: Number,
    default: 0,
    min: 0
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
})

// Compound index for badge list queries (active badges by tier/category)
badgeSchema.index({ tier: 1, category: 1 })
badgeSchema.index({ isActive: 1, sortOrder: 1 })
// Index for standalone requirement lookups (same pattern as Achievement.js)
badgeSchema.index({ 'unlockCondition.requirementType': 1, isActive: 1 })

const Badge = mongoose.model('Badge', badgeSchema)

export default Badge