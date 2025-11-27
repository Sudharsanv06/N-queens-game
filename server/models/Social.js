import mongoose from 'mongoose'

const friendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Prevent duplicate friendships
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true })

const gameReplaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameData: {
    boardSize: { type: Number, required: true },
    timeElapsed: { type: Number, required: true },
    moves: { type: Number, required: true },
    hintsUsed: { type: Number, default: 0 },
    score: { type: Number, required: true },
    mode: { type: String, required: true },
    solution: [{ row: Number, col: Number }]
  },
  title: { type: String, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  isPublic: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true })

gameReplaySchema.index({ user: 1, createdAt: -1 })
gameReplaySchema.index({ isPublic: 1, createdAt: -1 })
gameReplaySchema.index({ 'gameData.score': -1 })

const socialAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['first_friend', 'social_butterfly', 'replay_master', 'viral_share', 'helpful_friend'],
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  shareData: {
    shared: { type: Boolean, default: false },
    sharedAt: Date,
    platform: String
  }
}, { timestamps: true })

export const Friendship = mongoose.model('Friendship', friendshipSchema)
export const GameReplay = mongoose.model('GameReplay', gameReplaySchema)
export const SocialAchievement = mongoose.model('SocialAchievement', socialAchievementSchema)