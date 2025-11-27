import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks for API calls
export const fetchProfile = createAsyncThunk(
  'elo/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const url = userId 
        ? `${API_URL}/api/multiplayer/profile/${userId}`
        : `${API_URL}/api/multiplayer/profile`
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'elo/fetchLeaderboard',
  async ({ matchType = 'all', limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/multiplayer/leaderboard`, {
        params: { matchType, limit }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard')
    }
  }
)

export const fetchMatchHistory = createAsyncThunk(
  'elo/fetchMatchHistory',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const url = userId 
        ? `${API_URL}/api/multiplayer/match-history/${userId}`
        : `${API_URL}/api/multiplayer/match-history`
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch match history')
    }
  }
)

export const fetchEloPreview = createAsyncThunk(
  'elo/fetchEloPreview',
  async (opponentElo, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/multiplayer/elo-preview`, {
        params: { opponentElo },
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ELO preview')
    }
  }
)

export const fetchRankInfo = createAsyncThunk(
  'elo/fetchRankInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/multiplayer/rank-info`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rank info')
    }
  }
)

const initialState = {
  // Current user stats
  profile: null,
  elo: 1200,
  rank: 'bronze',
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  totalMatches: 0,
  currentStreak: 0,
  bestStreak: 0,
  
  // Leaderboard
  leaderboard: [],
  userLeaderboardPosition: null,
  
  // Match history
  matchHistory: [],
  
  // ELO preview (for matchmaking)
  eloPreview: null,
  
  // Rank system info
  rankInfo: null,
  rankThresholds: {
    bronze: 0,
    silver: 1000,
    gold: 1200,
    platinum: 1400,
    diamond: 1600,
    master: 1800,
    grandmaster: 2000,
    challenger: 2200
  },
  
  // Loading states
  isLoadingProfile: false,
  isLoadingLeaderboard: false,
  isLoadingHistory: false,
  isLoadingPreview: false,
  isLoadingRankInfo: false,
  
  // Error states
  profileError: null,
  leaderboardError: null,
  historyError: null,
  previewError: null,
  rankInfoError: null,
  
  // UI state
  showEloChange: false,
  eloChangeAmount: 0,
  lastMatchResult: null
}

const eloSlice = createSlice({
  name: 'elo',
  initialState,
  reducers: {
    // Update current user stats
    updateElo: (state, action) => {
      const { elo, change, result } = action.payload
      state.elo = elo
      state.eloChangeAmount = change
      state.lastMatchResult = result
      state.showEloChange = true
    },
    
    updateRank: (state, action) => {
      state.rank = action.payload
    },
    
    updateStats: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
      state.wins = action.payload.wins || state.wins
      state.losses = action.payload.losses || state.losses
      state.draws = action.payload.draws || state.draws
      state.totalMatches = action.payload.totalMatches || state.totalMatches
      state.winRate = action.payload.winRate || state.winRate
      state.currentStreak = action.payload.currentStreak || state.currentStreak
      state.bestStreak = action.payload.bestStreak || state.bestStreak
    },
    
    hideEloChange: (state) => {
      state.showEloChange = false
      state.eloChangeAmount = 0
    },
    
    // Leaderboard position
    setLeaderboardPosition: (state, action) => {
      state.userLeaderboardPosition = action.payload
    },
    
    // Add match to history
    addMatchToHistory: (state, action) => {
      state.matchHistory.unshift(action.payload)
      if (state.matchHistory.length > 20) {
        state.matchHistory.pop()
      }
    },
    
    // Clear errors
    clearProfileError: (state) => {
      state.profileError = null
    },
    
    clearLeaderboardError: (state) => {
      state.leaderboardError = null
    },
    
    clearHistoryError: (state) => {
      state.historyError = null
    },
    
    clearPreviewError: (state) => {
      state.previewError = null
    },
    
    clearRankInfoError: (state) => {
      state.rankInfoError = null
    },
    
    // Reset
    resetEloState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoadingProfile = true
        state.profileError = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false
        state.profile = action.payload.stats
        state.elo = action.payload.stats.elo
        state.rank = action.payload.stats.rank
        state.wins = action.payload.stats.wins
        state.losses = action.payload.stats.losses
        state.draws = action.payload.stats.draws
        state.winRate = action.payload.stats.winRate
        state.totalMatches = action.payload.stats.totalMatches
        state.currentStreak = action.payload.stats.winStreak?.current || 0
        state.bestStreak = action.payload.stats.winStreak?.best || 0
        state.userLeaderboardPosition = action.payload.leaderboardPosition
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoadingProfile = false
        state.profileError = action.payload
      })
    
    // Fetch leaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoadingLeaderboard = true
        state.leaderboardError = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoadingLeaderboard = false
        state.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoadingLeaderboard = false
        state.leaderboardError = action.payload
      })
    
    // Fetch match history
    builder
      .addCase(fetchMatchHistory.pending, (state) => {
        state.isLoadingHistory = true
        state.historyError = null
      })
      .addCase(fetchMatchHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false
        state.matchHistory = action.payload.matches
      })
      .addCase(fetchMatchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false
        state.historyError = action.payload
      })
    
    // Fetch ELO preview
    builder
      .addCase(fetchEloPreview.pending, (state) => {
        state.isLoadingPreview = true
        state.previewError = null
      })
      .addCase(fetchEloPreview.fulfilled, (state, action) => {
        state.isLoadingPreview = false
        state.eloPreview = action.payload
      })
      .addCase(fetchEloPreview.rejected, (state, action) => {
        state.isLoadingPreview = false
        state.previewError = action.payload
      })
    
    // Fetch rank info
    builder
      .addCase(fetchRankInfo.pending, (state) => {
        state.isLoadingRankInfo = true
        state.rankInfoError = null
      })
      .addCase(fetchRankInfo.fulfilled, (state, action) => {
        state.isLoadingRankInfo = false
        state.rankInfo = action.payload
        if (action.payload.thresholds) {
          state.rankThresholds = action.payload.thresholds
        }
      })
      .addCase(fetchRankInfo.rejected, (state, action) => {
        state.isLoadingRankInfo = false
        state.rankInfoError = action.payload
      })
  }
})

export const {
  updateElo,
  updateRank,
  updateStats,
  hideEloChange,
  setLeaderboardPosition,
  addMatchToHistory,
  clearProfileError,
  clearLeaderboardError,
  clearHistoryError,
  clearPreviewError,
  clearRankInfoError,
  resetEloState
} = eloSlice.actions

export default eloSlice.reducer
