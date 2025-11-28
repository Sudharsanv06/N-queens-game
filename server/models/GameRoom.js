import mongoose from 'mongoose'

const gameRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  // Match Configuration
  matchType: {
    type: String,
    enum: ['standard', 'speed', 'puzzle-duel'],
    required: true
  },
  boardSize: {
    type: Number,
    required: true,
    default: 8
  },
  timeLimit: {
    type: Number, // seconds
    default: null
  },
  puzzleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPuzzle',
    default: null
  },
  // Players
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: String,
    username: String,
    avatarUrl: String,
    elo: { type: Number, default: 1200 },
    isReady: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true },
    moves: { type: Number, default: 0 },
    timeRemaining: Number, // milliseconds
    board: [[Number]], // Current board state
    queensPlaced: { type: Number, default: 0 },
    lastMoveAt: Date
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: String,
    username: String,
    avatarUrl: String,
    elo: { type: Number, default: 1200 },
    isReady: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true },
    moves: { type: Number, default: 0 },
    timeRemaining: Number, // milliseconds
    board: [[Number]], // Current board state
    queensPlaced: { type: Number, default: 0 },
    lastMoveAt: Date
  },
  // Spectators
  spectators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    socketId: String,
    username: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  spectatorCount: {
    type: Number,
    default: 0
  },
  // Game State
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in-progress', 'paused', 'finished', 'abandoned'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winnerSide: {
    type: String,
    enum: ['player1', 'player2', 'draw'],
    default: null
  },
  winReason: {
    type: String,
    enum: ['completion', 'time', 'resignation', 'disconnect', 'draw-agreement'],
    default: null
  },
  // Timing
  startedAt: {
    type: Date,
    default: null
  },
  finishedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // seconds
    default: null
  },
  // Chat Messages
  chatMessages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    isSpectator: { type: Boolean, default: false }
  }],
  // Rematch
  rematchRequested: {
    player1: { type: Boolean, default: false },
    player2: { type: Boolean, default: false }
  },
  rematchRoomId: {
    type: String,
    default: null
  },
  // Move History
  moveHistory: [{
    player: { type: String, enum: ['player1', 'player2'] },
    row: Number,
    col: Number,
    queensPlaced: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  // Game Settings
  settings: {
    allowChat: { type: Boolean, default: true },
    allowSpectators: { type: Boolean, default: true },
    allowRematch: { type: Boolean, default: true }
  }
}, { timestamps: true })

// Indexes
gameRoomSchema.index({ roomId: 1 })
gameRoomSchema.index({ status: 1 })
gameRoomSchema.index({ 'player1.userId': 1 })
gameRoomSchema.index({ 'player2.userId': 1 })
gameRoomSchema.index({ createdAt: -1 })
gameRoomSchema.index({ matchType: 1, status: 1 })

// Initialize empty boards
gameRoomSchema.methods.initializeBoards = function() {
  const emptyBoard = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0))
  
  if (!this.player1.board || this.player1.board.length === 0) {
    this.player1.board = JSON.parse(JSON.stringify(emptyBoard))
  }
  if (!this.player2.board || this.player2.board.length === 0) {
    this.player2.board = JSON.parse(JSON.stringify(emptyBoard))
  }
  
  // Initialize time remaining
  if (this.timeLimit) {
    this.player1.timeRemaining = this.timeLimit * 1000
    this.player2.timeRemaining = this.timeLimit * 1000
  }
}

// Start game
gameRoomSchema.methods.startGame = function() {
  this.status = 'in-progress'
  this.startedAt = new Date()
  this.initializeBoards()
  return this.save()
}

// Make move (server-side validation)
gameRoomSchema.methods.makeMove = function(playerSide, row, col) {
  const player = playerSide === 'player1' ? this.player1 : this.player2
  
  // Validate move
  if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
    return { success: false, error: 'Move out of bounds' }
  }
  
  if (player.board[row][col] !== 0) {
    return { success: false, error: 'Square already occupied' }
  }
  
  // Check if move is valid (no conflicts)
  if (!this.isValidQueenPlacement(player.board, row, col)) {
    return { success: false, error: 'Invalid queen placement - conflicts detected' }
  }
  
  // Place queen
  player.board[row][col] = 1
  player.queensPlaced += 1
  player.moves += 1
  player.lastMoveAt = new Date()
  
  // Add to move history
  this.moveHistory.push({
    player: playerSide,
    row,
    col,
    queensPlaced: player.queensPlaced,
    timestamp: new Date()
  })
  
  // Check for win
  if (player.queensPlaced === this.boardSize) {
    this.finishGame(playerSide === 'player1' ? this.player1.userId : this.player2.userId, playerSide, 'completion')
  }
  
  return { success: true, queensPlaced: player.queensPlaced }
}

// Validate queen placement (no conflicts)
gameRoomSchema.methods.isValidQueenPlacement = function(board, row, col) {
  const n = board.length
  
  // Check row
  for (let c = 0; c < n; c++) {
    if (board[row][c] === 1 && c !== col) return false
  }
  
  // Check column
  for (let r = 0; r < n; r++) {
    if (board[r][col] === 1 && r !== row) return false
  }
  
  // Check diagonals
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === 1 && i !== row && j !== col) {
        if (Math.abs(i - row) === Math.abs(j - col)) {
          return false
        }
      }
    }
  }
  
  return true
}

// Finish game
gameRoomSchema.methods.finishGame = function(winnerId, winnerSide, reason) {
  this.status = 'finished'
  this.winner = winnerId
  this.winnerSide = winnerSide
  this.winReason = reason
  this.finishedAt = new Date()
  
  if (this.startedAt) {
    this.duration = Math.floor((this.finishedAt - this.startedAt) / 1000)
  }
  
  return this.save()
}

// Add spectator
gameRoomSchema.methods.addSpectator = function(userId, socketId, username) {
  if (!this.settings.allowSpectators) {
    return { success: false, error: 'Spectators not allowed' }
  }
  
  // Check if already spectating
  const existing = this.spectators.find(s => s.userId?.toString() === userId?.toString())
  if (existing) {
    existing.socketId = socketId
  } else {
    this.spectators.push({ userId, socketId, username, joinedAt: new Date() })
  }
  
  this.spectatorCount = this.spectators.length
  return { success: true }
}

// Remove spectator
gameRoomSchema.methods.removeSpectator = function(socketId) {
  this.spectators = this.spectators.filter(s => s.socketId !== socketId)
  this.spectatorCount = this.spectators.length
  return this.save()
}

// Add chat message
gameRoomSchema.methods.addChatMessage = function(userId, username, message, isSpectator = false) {
  if (!this.settings.allowChat) {
    return { success: false, error: 'Chat disabled' }
  }
  
  // Basic profanity filter (simple regex)
  const profanityPattern = /\b(fuck|shit|damn|bitch|ass|crap|hell)\b/gi
  const cleanMessage = message.replace(profanityPattern, '****')
  
  this.chatMessages.push({
    userId,
    username,
    message: cleanMessage,
    timestamp: new Date(),
    isSpectator
  })
  
  // Keep only last 100 messages
  if (this.chatMessages.length > 100) {
    this.chatMessages = this.chatMessages.slice(-100)
  }
  
  return { success: true, cleanMessage }
}

// Handle player disconnect
gameRoomSchema.methods.handleDisconnect = function(playerSide) {
  const player = playerSide === 'player1' ? this.player1 : this.player2
  player.isConnected = false
  
  return this.save()
}

// Handle player reconnect
gameRoomSchema.methods.handleReconnect = function(playerSide, socketId) {
  const player = playerSide === 'player1' ? this.player1 : this.player2
  player.isConnected = true
  player.socketId = socketId
  
  return this.save()
}

// Static method to create room
gameRoomSchema.statics.createRoom = async function(player1Data, player2Data, matchType, options = {}) {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const room = await this.create({
    roomId,
    matchType,
    boardSize: options.boardSize || 8,
    timeLimit: options.timeLimit || null,
    puzzleId: options.puzzleId || null,
    player1: {
      userId: player1Data.userId,
      username: player1Data.username,
      avatarUrl: player1Data.avatarUrl,
      elo: player1Data.elo || 1200
    },
    player2: {
      userId: player2Data.userId,
      username: player2Data.username,
      avatarUrl: player2Data.avatarUrl,
      elo: player2Data.elo || 1200
    },
    settings: options.settings || {}
  })
  
  room.initializeBoards()
  await room.save()
  
  return room
}

// Static method to find active rooms
gameRoomSchema.statics.findActiveRooms = async function() {
  return this.find({
    status: { $in: ['waiting', 'ready', 'in-progress'] }
  }).sort({ createdAt: -1 })
}

const GameRoom = mongoose.model('GameRoom', gameRoomSchema)

export default GameRoom
