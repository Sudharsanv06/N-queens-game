import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Current game room state
  currentRoom: null,
  roomId: null,
  isInRoom: false,
  
  // Player state
  playerSide: null, // 'player1' or 'player2'
  opponentInfo: null,
  
  // Game state
  gameStatus: 'waiting', // waiting | ready | in-progress | finished | abandoned
  playerBoard: null, // Player's N×N board
  opponentBoard: null, // Opponent's board (hidden queens)
  playerQueens: 0,
  opponentQueens: 0,
  playerMoves: [],
  opponentMoves: [],
  
  // Timer state
  playerTimeRemaining: null,
  opponentTimeRemaining: null,
  timerInterval: null,
  
  // Match settings
  matchType: null, // standard | speed | puzzle-duel
  boardSize: 8,
  timeLimit: null,
  
  // Chat state
  messages: [],
  unreadCount: 0,
  
  // Spectator state
  isSpectating: false,
  spectatorCount: 0,
  spectators: [],
  
  // Connection state
  isConnected: false,
  isReconnecting: false,
  opponentConnected: true,
  
  // Result state
  winner: null,
  loser: null,
  winReason: null,
  matchDuration: null,
  eloChange: null,
  
  // Rematch state
  rematchRequested: false,
  rematchBy: null,
  
  // UI state
  showResultModal: false,
  showRematchPrompt: false,
  
  // Error state
  error: null,
  
  // Loading states
  isJoiningRoom: false,
  isMakingMove: false
}

const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState,
  reducers: {
    // Room management
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload
      state.roomId = action.payload.roomId
      state.isInRoom = true
      state.matchType = action.payload.matchType
      state.boardSize = action.payload.boardSize || 8
      state.timeLimit = action.payload.timeLimit
      state.error = null
    },
    
    leaveRoom: (state) => {
      return {
        ...initialState,
        isConnected: state.isConnected
      }
    },
    
    setPlayerSide: (state, action) => {
      state.playerSide = action.payload
    },
    
    setOpponentInfo: (state, action) => {
      state.opponentInfo = action.payload
    },
    
    // Game state updates
    updateGameStatus: (state, action) => {
      state.gameStatus = action.payload
    },
    
    initializeBoard: (state, action) => {
      const { boardSize } = action.payload
      state.boardSize = boardSize
      state.playerBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))
      state.opponentBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))
      state.playerQueens = 0
      state.opponentQueens = 0
      state.playerMoves = []
      state.opponentMoves = []
    },
    
    updatePlayerBoard: (state, action) => {
      state.playerBoard = action.payload.board
      state.playerQueens = action.payload.queensPlaced
    },
    
    updateOpponentBoard: (state, action) => {
      const { row, col, queensPlaced } = action.payload
      // Don't show exact queen positions, just mark as occupied
      if (state.opponentBoard && state.opponentBoard[row]) {
        state.opponentBoard[row][col] = 1
      }
      state.opponentQueens = queensPlaced
    },
    
    addPlayerMove: (state, action) => {
      state.playerMoves.push(action.payload)
    },
    
    addOpponentMove: (state, action) => {
      state.opponentMoves.push(action.payload)
    },
    
    // Timer updates
    setPlayerTime: (state, action) => {
      state.playerTimeRemaining = action.payload
    },
    
    setOpponentTime: (state, action) => {
      state.opponentTimeRemaining = action.payload
    },
    
    decrementPlayerTime: (state) => {
      if (state.playerTimeRemaining > 0) {
        state.playerTimeRemaining -= 1
      }
    },
    
    decrementOpponentTime: (state) => {
      if (state.opponentTimeRemaining > 0) {
        state.opponentTimeRemaining -= 1
      }
    },
    
    // Chat management
    addChatMessage: (state, action) => {
      state.messages.push({
        ...action.payload,
        timestamp: action.payload.timestamp || Date.now()
      })
      
      // Increment unread if not focused
      if (!action.payload.isOwnMessage) {
        state.unreadCount += 1
      }
    },
    
    clearChatMessages: (state) => {
      state.messages = []
      state.unreadCount = 0
    },
    
    markChatAsRead: (state) => {
      state.unreadCount = 0
    },
    
    // Spectator management
    setSpectating: (state, action) => {
      state.isSpectating = action.payload
    },
    
    updateSpectatorCount: (state, action) => {
      state.spectatorCount = action.payload
    },
    
    addSpectator: (state, action) => {
      if (!state.spectators.find(s => s.userId === action.payload.userId)) {
        state.spectators.push(action.payload)
        state.spectatorCount = state.spectators.length
      }
    },
    
    removeSpectator: (state, action) => {
      state.spectators = state.spectators.filter(s => s.userId !== action.payload)
      state.spectatorCount = state.spectators.length
    },
    
    // Connection state
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
      if (!action.payload) {
        state.isReconnecting = true
      }
    },
    
    setReconnecting: (state, action) => {
      state.isReconnecting = action.payload
    },
    
    setOpponentConnected: (state, action) => {
      state.opponentConnected = action.payload
    },
    
    // Game results
    setGameResult: (state, action) => {
      const { winner, winnerSide, reason, duration, eloChange } = action.payload
      state.gameStatus = 'finished'
      state.winner = winner
      state.winReason = reason
      state.matchDuration = duration
      state.eloChange = eloChange
      state.showResultModal = true
      
      // Determine if player won
      if (winnerSide === state.playerSide) {
        state.loser = state.opponentInfo
      } else {
        state.loser = { userId: state.playerSide }
      }
    },
    
    closeResultModal: (state) => {
      state.showResultModal = false
    },
    
    // Rematch management
    setRematchRequested: (state, action) => {
      state.rematchRequested = true
      state.rematchBy = action.payload.requestedBy
      if (action.payload.requestedBy !== state.playerSide) {
        state.showRematchPrompt = true
      }
    },
    
    acceptRematch: (state) => {
      state.showRematchPrompt = false
      state.rematchRequested = false
    },
    
    rejectRematch: (state) => {
      state.showRematchPrompt = false
      state.rematchRequested = false
      state.rematchBy = null
    },
    
    closeRematchPrompt: (state) => {
      state.showRematchPrompt = false
    },
    
    // Loading states
    setJoiningRoom: (state, action) => {
      state.isJoiningRoom = action.payload
    },
    
    setMakingMove: (state, action) => {
      state.isMakingMove = action.payload
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    }
  }
})

export const {
  setCurrentRoom,
  leaveRoom,
  setPlayerSide,
  setOpponentInfo,
  updateGameStatus,
  initializeBoard,
  updatePlayerBoard,
  updateOpponentBoard,
  addPlayerMove,
  addOpponentMove,
  setPlayerTime,
  setOpponentTime,
  decrementPlayerTime,
  decrementOpponentTime,
  addChatMessage,
  clearChatMessages,
  markChatAsRead,
  setSpectating,
  updateSpectatorCount,
  addSpectator,
  removeSpectator,
  setConnectionStatus,
  setReconnecting,
  setOpponentConnected,
  setGameResult,
  closeResultModal,
  setRematchRequested,
  acceptRematch,
  rejectRematch,
  closeRematchPrompt,
  setJoiningRoom,
  setMakingMove,
  setError,
  clearError
} = multiplayerSlice.actions

export default multiplayerSlice.reducer
