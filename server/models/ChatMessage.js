import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'emote'],
    default: 'text'
  },
  isSpectator: {
    type: Boolean,
    default: false
  },
  // Metadata
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

// Indexes
chatMessageSchema.index({ roomId: 1, createdAt: -1 })
chatMessageSchema.index({ userId: 1 })

// TTL index to auto-delete messages after 7 days
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }) // 7 days

// Static method to get room messages
chatMessageSchema.statics.getRoomMessages = async function(roomId, options = {}) {
  const { limit = 50, skip = 0 } = options
  
  return this.find({
    roomId,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username avatarUrl')
    .lean()
}

// Static method to create system message
chatMessageSchema.statics.createSystemMessage = async function(roomId, message) {
  return this.create({
    roomId,
    userId: null,
    username: 'System',
    message,
    messageType: 'system'
  })
}

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

export default ChatMessage
