import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Queue state
  isInQueue: false,
  queueStartTime: null,
  waitTime: 0,
  estimatedWaitTime: null,
  
  // Match type selection
  selectedMatchType: 'standard', // standard | speed | puzzle-duel
  
  // Preferences
  preferences: {
    eloRange: 200, // ±200 ELO range
    allowBots: false,
    preferredBoardSize: 8
  },
  
  // Queue status
  queuePosition: null,
  playersInQueue: 0,
  
  // Match found state
  matchFound: false,
  matchData: null,
  
  // Loading states
  isSearching: false,
  isLeavingQueue: false,
  
  // Error state
  error: null,
  
  // Statistics
  stats: {
    averageWaitTime: null,
    activeMatches: 0,
    totalPlayersOnline: 0
  }
}

const matchmakingSlice = createSlice({
  name: 'matchmaking',
  initialState,
  reducers: {
    // Queue management
    joinQueue: (state, action) => {
      state.isInQueue = true
      state.queueStartTime = Date.now()
      state.selectedMatchType = action.payload.matchType
      state.preferences = { ...state.preferences, ...action.payload.preferences }
      state.isSearching = true
      state.error = null
    },
    
    leaveQueue: (state) => {
      state.isInQueue = false
      state.queueStartTime = null
      state.waitTime = 0
      state.isSearching = false
      state.matchFound = false
      state.matchData = null
      state.queuePosition = null
    },
    
    updateQueueStatus: (state, action) => {
      const { position, playersInQueue, estimatedWaitTime } = action.payload
      state.queuePosition = position
      state.playersInQueue = playersInQueue
      state.estimatedWaitTime = estimatedWaitTime
    },
    
    incrementWaitTime: (state) => {
      if (state.isInQueue && state.queueStartTime) {
        state.waitTime = Math.floor((Date.now() - state.queueStartTime) / 1000)
      }
    },
    
    // Match found
    setMatchFound: (state, action) => {
      state.matchFound = true
      state.matchData = action.payload
      state.isSearching = false
    },
    
    clearMatchData: (state) => {
      state.matchFound = false
      state.matchData = null
    },
    
    // Match type selection
    setMatchType: (state, action) => {
      if (!state.isInQueue) {
        state.selectedMatchType = action.payload
      }
    },
    
    // Preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    
    setEloRange: (state, action) => {
      state.preferences.eloRange = action.payload
    },
    
    toggleAllowBots: (state) => {
      state.preferences.allowBots = !state.preferences.allowBots
    },
    
    // Loading states
    setSearching: (state, action) => {
      state.isSearching = action.payload
    },
    
    setLeavingQueue: (state, action) => {
      state.isLeavingQueue = action.payload
    },
    
    // Statistics
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
    
    // Error handling
    setMatchmakingError: (state, action) => {
      state.error = action.payload
      state.isSearching = false
    },
    
    clearMatchmakingError: (state) => {
      state.error = null
    },
    
    // Reset
    resetMatchmaking: () => initialState
  }
})

export const {
  joinQueue,
  leaveQueue,
  updateQueueStatus,
  incrementWaitTime,
  setMatchFound,
  clearMatchData,
  setMatchType,
  updatePreferences,
  setEloRange,
  toggleAllowBots,
  setSearching,
  setLeavingQueue,
  updateStats,
  setMatchmakingError,
  clearMatchmakingError,
  resetMatchmaking
} = matchmakingSlice.actions

export default matchmakingSlice.reducer
