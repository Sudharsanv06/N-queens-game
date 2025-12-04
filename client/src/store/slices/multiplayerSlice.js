import { createSlice } from '@reduxjs/toolkit'

const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState: {
    gameId: null,
    players: [],
    currentTurn: null,
    gameState: 'waiting', // waiting, playing, finished
    winner: null,
    isHost: false,
    connected: false,
    currentRoom: null,
    playerSide: null,
    opponentInfo: null,
    gameStatus: 'idle',
    playerBoard: [],
    opponentBoard: [],
    playerMoves: [],
    opponentMoves: [],
    playerTime: 0,
    opponentTime: 0,
    chatMessages: [],
    spectatorCount: 0,
    spectators: [],
    connectionStatus: 'disconnected',
    reconnecting: false,
    opponentConnected: false,
    gameResult: null,
    rematchRequested: null,
    error: null,
    resultModalOpen: false,
    rematchPromptOpen: false,
  },
  reducers: {
    setGameId: (state, action) => {
      state.gameId = action.payload
    },
    setPlayers: (state, action) => {
      state.players = action.payload
    },
    setCurrentTurn: (state, action) => {
      state.currentTurn = action.payload
    },
    setGameState: (state, action) => {
      state.gameState = action.payload
    },
    setWinner: (state, action) => {
      state.winner = action.payload
    },
    setIsHost: (state, action) => {
      state.isHost = action.payload
    },
    setConnected: (state, action) => {
      state.connected = action.payload
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload
    },
    leaveRoom: (state) => {
      state.currentRoom = null
      state.gameStatus = 'idle'
    },
    setPlayerSide: (state, action) => {
      state.playerSide = action.payload
    },
    setOpponentInfo: (state, action) => {
      state.opponentInfo = action.payload
    },
    updateGameStatus: (state, action) => {
      state.gameStatus = action.payload
    },
    initializeBoard: (state, action) => {
      state.playerBoard = action.payload
      state.opponentBoard = action.payload
    },
    updatePlayerBoard: (state, action) => {
      state.playerBoard = action.payload
    },
    updateOpponentBoard: (state, action) => {
      state.opponentBoard = action.payload
    },
    addPlayerMove: (state, action) => {
      state.playerMoves.push(action.payload)
    },
    addOpponentMove: (state, action) => {
      state.opponentMoves.push(action.payload)
    },
    setPlayerTime: (state, action) => {
      state.playerTime = action.payload
    },
    setOpponentTime: (state, action) => {
      state.opponentTime = action.payload
    },
    decrementPlayerTime: (state) => {
      if (state.playerTime > 0) state.playerTime -= 1
    },
    decrementOpponentTime: (state) => {
      if (state.opponentTime > 0) state.opponentTime -= 1
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload)
    },
    updateSpectatorCount: (state, action) => {
      state.spectatorCount = action.payload
    },
    addSpectator: (state, action) => {
      state.spectators.push(action.payload)
    },
    removeSpectator: (state, action) => {
      state.spectators = state.spectators.filter(s => s.id !== action.payload)
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload
    },
    setReconnecting: (state, action) => {
      state.reconnecting = action.payload
    },
    setOpponentConnected: (state, action) => {
      state.opponentConnected = action.payload
    },
    setGameResult: (state, action) => {
      state.gameResult = action.payload
      state.resultModalOpen = true
    },
    setRematchRequested: (state, action) => {
      state.rematchRequested = action.payload
      state.rematchPromptOpen = action.payload?.requestedBy ? true : false
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    closeResultModal: (state) => {
      state.resultModalOpen = false
    },
    closeRematchPrompt: (state) => {
      state.rematchPromptOpen = false
    },
    rejectRematch: (state) => {
      state.rematchRequested = null
      state.rematchPromptOpen = false
    },
    resetMultiplayer: (state) => {
      state.gameId = null
      state.players = []
      state.currentTurn = null
      state.gameState = 'waiting'
      state.winner = null
      state.isHost = false
      state.connected = false
      state.currentRoom = null
      state.playerSide = null
      state.opponentInfo = null
      state.gameStatus = 'idle'
      state.playerBoard = []
      state.opponentBoard = []
      state.playerMoves = []
      state.opponentMoves = []
      state.playerTime = 0
      state.opponentTime = 0
      state.chatMessages = []
      state.spectatorCount = 0
      state.spectators = []
      state.connectionStatus = 'disconnected'
      state.reconnecting = false
      state.opponentConnected = false
      state.gameResult = null
      state.rematchRequested = null
      state.error = null
      state.resultModalOpen = false
      state.rematchPromptOpen = false
    },
  },
})

export const {
  setGameId,
  setPlayers,
  setCurrentTurn,
  setGameState,
  setWinner,
  setIsHost,
  setConnected,
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
  updateSpectatorCount,
  addSpectator,
  removeSpectator,
  setConnectionStatus,
  setReconnecting,
  setOpponentConnected,
  setGameResult,
  setRematchRequested,
  setError,
  closeResultModal,
  closeRematchPrompt,
  rejectRematch,
  resetMultiplayer,
} = multiplayerSlice.actions

export default multiplayerSlice.reducer
