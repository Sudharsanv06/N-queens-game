import mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['upcoming', 'registration', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  type: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss'],
    default: 'single-elimination'
  },
  gameMode: {
    type: String,
    enum: ['classic', 'time-trial', 'puzzle-mode', 'blitz'],
    default: 'classic'
  },
  boardSize: {
    type: Number,
    min: 4,
    max: 20,
    default: 8
  },
  timeLimit: {
    type: Number, // in seconds
    min: 30,
    max: 3600,
    default: 300
  },
  maxParticipants: {
    type: Number,
    min: 2,
    max: 1000,
    default: 16
  },
  entryFee: {
    type: Number,
    min: 0,
    default: 0
  },
  prizePool: {
    total: {
      type: Number,
      default: 0
    },
    distribution: [{
      position: Number,
      amount: Number,
      percentage: Number
    }]
  },
  schedule: {
    registrationStart: {
      type: Date,
      required: true
    },
    registrationEnd: {
      type: Date,
      required: true
    },
    tournamentStart: {
      type: Date,
      required: true
    },
    tournamentEnd: Date
  },
  rules: {
    hintsAllowed: {
      type: Number,
      default: 3
    },
    timeLimit: Number,
    scoring: {
      type: String,
      enum: ['standard', 'time-based', 'moves-based', 'custom'],
      default: 'standard'
    },
    customScoringFormula: String
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    seed: Number,
    status: {
      type: String,
      enum: ['registered', 'checked-in', 'active', 'eliminated', 'winner'],
      default: 'registered'
    },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      bestTime: Number
    }
  }],
  bracket: {
    rounds: [{
      roundNumber: Number,
      matches: [{
        matchId: String,
        player1: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        player2: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        loser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed', 'bye'],
          default: 'pending'
        },
        scheduledTime: Date,
        startTime: Date,
        endTime: Date,
        gameResults: [{
          player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          score: Number,
          timeElapsed: Number,
          moves: Number,
          hintsUsed: Number,
          completed: Boolean
        }]
      }]
    }]
  },
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: Number,
    score: Number,
    gamesPlayed: Number,
    gamesWon: Number,
    winRate: Number,
    averageTime: Number,
    bestTime: Number
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    allowSpectators: {
      type: Boolean,
      default: true
    },
    autoStartMatches: {
      type: Boolean,
      default: false
    },
    sendNotifications: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalMatches: { type: Number, default: 0 },
    completedMatches: { type: Number, default: 0 },
    averageMatchTime: { type: Number, default: 0 },
    highestScore: Number,
    fastestCompletion: Number
  }
}, {
  timestamps: true
})

// Indexes for performance
tournamentSchema.index({ status: 1, 'schedule.registrationStart': 1 })
tournamentSchema.index({ status: 1, 'schedule.tournamentStart': 1 })
tournamentSchema.index({ organizer: 1 })
tournamentSchema.index({ 'participants.user': 1 })
tournamentSchema.index({ createdAt: -1 })

// Virtual for participant count
tournamentSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0
})

// Virtual for spots remaining
tournamentSchema.virtual('spotsRemaining').get(function() {
  return this.maxParticipants - this.participantCount
})

// Virtual for is registration open
tournamentSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date()
  return this.status === 'registration' && 
         now >= this.schedule.registrationStart && 
         now <= this.schedule.registrationEnd &&
         this.participantCount < this.maxParticipants
})

// Methods
tournamentSchema.methods.canUserRegister = function(userId) {
  if (!this.isRegistrationOpen) return { canRegister: false, reason: 'Registration not open' }
  
  const isAlreadyRegistered = this.participants.some(p => p.user.toString() === userId.toString())
  if (isAlreadyRegistered) return { canRegister: false, reason: 'Already registered' }
  
  if (this.participantCount >= this.maxParticipants) {
    return { canRegister: false, reason: 'Tournament full' }
  }
  
  return { canRegister: true }
}

tournamentSchema.methods.registerUser = function(userId) {
  const canRegister = this.canUserRegister(userId)
  if (!canRegister.canRegister) throw new Error(canRegister.reason)
  
  this.participants.push({
    user: userId,
    registeredAt: new Date(),
    seed: this.participants.length + 1
  })
  
  return this.save()
}

tournamentSchema.methods.generateBracket = function() {
  const participants = this.participants.filter(p => p.status !== 'eliminated')
  
  if (participants.length < 2) {
    throw new Error('Need at least 2 participants to generate bracket')
  }
  
  // Simple single elimination bracket generation
  const rounds = Math.ceil(Math.log2(participants.length))
  const bracket = { rounds: [] }
  
  // Shuffle participants for fairness (or use seeding)
  const shuffled = [...participants].sort(() => Math.random() - 0.5)
  
  // Generate first round
  const firstRound = {
    roundNumber: 1,
    matches: []
  }
  
  for (let i = 0; i < shuffled.length; i += 2) {
    const match = {
      matchId: `R1M${Math.floor(i/2) + 1}`,
      player1: shuffled[i].user,
      player2: shuffled[i + 1] || null, // Handle odd number of participants
      status: shuffled[i + 1] ? 'pending' : 'bye'
    }
    
    if (!shuffled[i + 1]) {
      // Bye - player1 automatically advances
      match.winner = shuffled[i].user
      match.status = 'completed'
    }
    
    firstRound.matches.push(match)
  }
  
  bracket.rounds.push(firstRound)
  
  // Generate subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const roundMatches = {
      roundNumber: round,
      matches: []
    }
    
    const previousMatches = bracket.rounds[round - 2].matches
    for (let i = 0; i < previousMatches.length; i += 2) {
      if (i + 1 < previousMatches.length) {
        roundMatches.matches.push({
          matchId: `R${round}M${Math.floor(i/2) + 1}`,
          player1: null, // Will be filled when previous matches complete
          player2: null,
          status: 'pending'
        })
      }
    }
    
    if (roundMatches.matches.length > 0) {
      bracket.rounds.push(roundMatches)
    }
  }
  
  this.bracket = bracket
  return this.save()
}

tournamentSchema.methods.advanceWinner = function(matchId, winnerId) {
  // Find the match and mark winner
  for (const round of this.bracket.rounds) {
    const match = round.matches.find(m => m.matchId === matchId)
    if (match) {
      match.winner = winnerId
      match.loser = match.player1.toString() === winnerId.toString() ? match.player2 : match.player1
      match.status = 'completed'
      match.endTime = new Date()
      
      // Find next round match and set player
      const nextRoundNumber = round.roundNumber + 1
      const nextRound = this.bracket.rounds.find(r => r.roundNumber === nextRoundNumber)
      
      if (nextRound) {
        const matchIndex = round.matches.findIndex(m => m.matchId === matchId)
        const nextMatchIndex = Math.floor(matchIndex / 2)
        const nextMatch = nextRound.matches[nextMatchIndex]
        
        if (nextMatch) {
          if (!nextMatch.player1) {
            nextMatch.player1 = winnerId
          } else {
            nextMatch.player2 = winnerId
          }
        }
      }
      
      break
    }
  }
  
  return this.save()
}

tournamentSchema.methods.updateLeaderboard = function() {
  const leaderboard = this.participants.map(participant => {
    const winRate = participant.stats.gamesPlayed > 0 ? 
      (participant.stats.gamesWon / participant.stats.gamesPlayed * 100) : 0
    
    return {
      user: participant.user,
      score: participant.stats.totalScore,
      gamesPlayed: participant.stats.gamesPlayed,
      gamesWon: participant.stats.gamesWon,
      winRate: Math.round(winRate * 100) / 100,
      averageTime: participant.stats.averageTime,
      bestTime: participant.stats.bestTime
    }
  }).sort((a, b) => {
    // Primary sort by score, secondary by win rate, tertiary by best time
    if (b.score !== a.score) return b.score - a.score
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    return (a.bestTime || Infinity) - (b.bestTime || Infinity)
  }).map((entry, index) => ({
    ...entry,
    position: index + 1
  }))
  
  this.leaderboard = leaderboard
  return this.save()
}

export default mongoose.model('Tournament', tournamentSchema)