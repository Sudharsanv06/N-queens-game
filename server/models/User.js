import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must be less than 30 characters']
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must be less than 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  mobile: { 
    type: String, 
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Profile fields
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio must be less than 200 characters'],
    default: ''
  },
  
  // Game Statistics
  stats: {
    totalGames: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // in seconds
    bestTime: { type: Number, default: null },
    fastestSolveTime: { type: Number, default: null }, // fastest solve in seconds
    totalScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    dailyChallengesCompleted: { type: Number, default: 0 },
    multiplayerWins: { type: Number, default: 0 },
    multiplayerGames: { type: Number, default: 0 },
    highestBoardSizeSolved: { type: Number, default: 0 },
    averageSolveTime: { type: Number, default: 0 }, // in seconds
    gamesPlayedByDay: { type: Map, of: Number, default: {} } // Date string -> count
  },
  
  // Ranking & Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  rank: { type: String, default: 'Novice' },
  
  // Achievements/Badges
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }],
  
  // Preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
    dailyChallengeNotifications: { type: Boolean, default: true },
    gameInviteNotifications: { type: Boolean, default: true },
    achievementNotifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'hard', 'expert'], default: 'beginner' }
  },
  
  // Push Notification Subscriptions
  pushSubscriptions: [{
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: Date.now }
  }],
  
  // Account status
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  refreshTokens: [{ 
    token: String, 
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date 
  }]
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Calculate user rank based on total score
userSchema.methods.updateRank = function() {
  const totalScore = this.stats.totalScore
  if (totalScore >= 50000) this.rank = 'Grandmaster'
  else if (totalScore >= 25000) this.rank = 'Master'
  else if (totalScore >= 10000) this.rank = 'Expert'
  else if (totalScore >= 5000) this.rank = 'Advanced'
  else if (totalScore >= 1000) this.rank = 'Intermediate'
  else this.rank = 'Novice'
}

// Update experience and level
userSchema.methods.addExperience = function(points) {
  this.experience += points
  const newLevel = Math.floor(this.experience / 1000) + 1
  if (newLevel > this.level) {
    this.level = newLevel
    // Could trigger achievement unlock here
  }
}

// Create indexes for better performance (email, mobile, and username are automatically indexed due to unique: true)
userSchema.index({ 'stats.totalScore': -1 })
userSchema.index({ 'stats.fastestSolveTime': 1 })
userSchema.index({ 'stats.highestBoardSizeSolved': -1 })
userSchema.index({ level: -1 })
userSchema.index({ createdAt: -1 })

// Method to get safe user object (without password)
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokens
  delete obj.pushSubscriptions
  return obj
}

export default mongoose.model('User', userSchema)
