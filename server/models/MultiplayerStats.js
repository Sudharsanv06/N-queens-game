import mongoose from 'mongoose'

const multiplayerStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // ELO Rating System
  elo: {
    type: Number,
    default: 1200,
    min: 0
  },
  // Rank Tiers (Bronze → Challenger)
  rank: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger'],
    default: 'bronze'
  },
  // Match Statistics
  totalMatches: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  // Win Rate
  winRate: {
    type: Number,
    default: 0
  },
  // Current Streak
  currentWinStreak: {
    type: Number,
    default: 0
  },
  bestWinStreak: {
    type: Number,
    default: 0
  },
  // Match Type Stats
  standardMatches: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
  },
  speedMatches: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
  },
  puzzleDuelMatches: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 }
  },
  // Performance Metrics
  averageMatchTime: {
    type: Number,
    default: 0
  },
  averageMovesPerMatch: {
    type: Number,
    default: 0
  },
  fastestWin: {
    type: Number,
    default: null
  },
  // ELO History (last 20 matches)
  eloHistory: [{
    elo: Number,
    change: Number,
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    result: { type: String, enum: ['win', 'loss', 'draw'] },
    matchType: { type: String, enum: ['standard', 'speed', 'puzzle-duel'] },
    date: { type: Date, default: Date.now }
  }],
  // Recent Matches (last 10)
  recentMatches: [{
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    result: { type: String, enum: ['win', 'loss', 'draw'] },
    eloChange: Number,
    matchType: String,
    duration: Number,
    moves: Number,
    date: { type: Date, default: Date.now }
  }],
  // Peak Stats
  peakElo: {
    rating: { type: Number, default: 1200 },
    achievedAt: { type: Date, default: Date.now }
  },
  // Leaderboard Position
  leaderboardRank: {
    type: Number,
    default: null
  },
  // Special Achievements
  perfectGames: {
    type: Number,
    default: 0
  },
  comebacks: {
    type: Number,
    default: 0
  },
  // Activity
  lastMatchDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Indexes for performance
multiplayerStatsSchema.index({ userId: 1 })
multiplayerStatsSchema.index({ elo: -1 })
multiplayerStatsSchema.index({ rank: 1, elo: -1 })
multiplayerStatsSchema.index({ leaderboardRank: 1 })
multiplayerStatsSchema.index({ wins: -1 })
multiplayerStatsSchema.index({ winRate: -1 })

// Calculate win rate
multiplayerStatsSchema.methods.calculateWinRate = function() {
  if (this.totalMatches === 0) return 0
  this.winRate = ((this.wins / this.totalMatches) * 100).toFixed(2)
  return this.winRate
}

// Update rank based on ELO
multiplayerStatsSchema.methods.updateRank = function() {
  const elo = this.elo
  
  if (elo < 1200) this.rank = 'bronze'
  else if (elo < 1400) this.rank = 'silver'
  else if (elo < 1600) this.rank = 'gold'
  else if (elo < 1800) this.rank = 'platinum'
  else if (elo < 2000) this.rank = 'diamond'
  else if (elo < 2200) this.rank = 'master'
  else if (elo < 2400) this.rank = 'grandmaster'
  else this.rank = 'challenger'
  
  return this.rank
}

// Record match result
multiplayerStatsSchema.methods.recordMatch = function(result, opponent, eloChange, matchType, duration, moves) {
  this.totalMatches += 1
  this.lastMatchDate = new Date()
  
  // Update match result
  if (result === 'win') {
    this.wins += 1
    this.currentWinStreak += 1
    if (this.currentWinStreak > this.bestWinStreak) {
      this.bestWinStreak = this.currentWinStreak
    }
  } else if (result === 'loss') {
    this.losses += 1
    this.currentWinStreak = 0
  } else if (result === 'draw') {
    this.draws += 1
  }
  
  // Update match type stats
  const matchTypeStats = matchType === 'speed' ? this.speedMatches :
                         matchType === 'puzzle-duel' ? this.puzzleDuelMatches :
                         this.standardMatches
  
  if (result === 'win') matchTypeStats.wins += 1
  else if (result === 'loss') matchTypeStats.losses += 1
  else if (result === 'draw') matchTypeStats.draws += 1
  
  // Update ELO
  const oldElo = this.elo
  this.elo += eloChange
  
  // Update peak ELO
  if (this.elo > this.peakElo.rating) {
    this.peakElo.rating = this.elo
    this.peakElo.achievedAt = new Date()
  }
  
  // Update rank
  this.updateRank()
  
  // Update average stats
  const totalTime = (this.averageMatchTime * (this.totalMatches - 1)) + duration
  this.averageMatchTime = Math.round(totalTime / this.totalMatches)
  
  const totalMoves = (this.averageMovesPerMatch * (this.totalMatches - 1)) + moves
  this.averageMovesPerMatch = Math.round(totalMoves / this.totalMatches)
  
  // Update fastest win
  if (result === 'win' && (!this.fastestWin || duration < this.fastestWin)) {
    this.fastestWin = duration
  }
  
  // Calculate win rate
  this.calculateWinRate()
  
  // Add to ELO history (keep last 20)
  this.eloHistory.unshift({
    elo: this.elo,
    change: eloChange,
    opponent,
    result,
    matchType,
    date: new Date()
  })
  if (this.eloHistory.length > 20) {
    this.eloHistory = this.eloHistory.slice(0, 20)
  }
  
  // Add to recent matches (keep last 10)
  this.recentMatches.unshift({
    opponent,
    result,
    eloChange,
    matchType,
    duration,
    moves,
    date: new Date()
  })
  if (this.recentMatches.length > 10) {
    this.recentMatches = this.recentMatches.slice(0, 10)
  }
  
  return this.save()
}

// Get K-factor for ELO calculation (based on total matches)
multiplayerStatsSchema.methods.getKFactor = function() {
  if (this.totalMatches < 30) return 40 // New players
  if (this.elo >= 2400) return 16 // High rated players
  return 24 // Normal players
}

// Static method to get leaderboard
multiplayerStatsSchema.statics.getLeaderboard = async function(options = {}) {
  const { limit = 100, skip = 0, rank = null, minMatches = 5 } = options
  
  const query = {
    totalMatches: { $gte: minMatches },
    isActive: true
  }
  
  if (rank) {
    query.rank = rank
  }
  
  const leaderboard = await this.find(query)
    .populate('userId', 'username email avatarUrl')
    .sort({ elo: -1, wins: -1 })
    .limit(limit)
    .skip(skip)
    .lean()
  
  // Update leaderboard ranks
  leaderboard.forEach((stats, index) => {
    stats.position = skip + index + 1
  })
  
  return leaderboard
}

// Static method to get user rank position
multiplayerStatsSchema.statics.getUserRankPosition = async function(userId) {
  const userStats = await this.findOne({ userId })
  if (!userStats) return null
  
  const higherRanked = await this.countDocuments({
    elo: { $gt: userStats.elo },
    totalMatches: { $gte: 5 },
    isActive: true
  })
  
  return higherRanked + 1
}

// Static method to get or create stats
multiplayerStatsSchema.statics.getOrCreate = async function(userId) {
  let stats = await this.findOne({ userId })
  
  if (!stats) {
    stats = await this.create({ userId })
  }
  
  return stats
}

const MultiplayerStats = mongoose.model('MultiplayerStats', multiplayerStatsSchema)

export default MultiplayerStats
