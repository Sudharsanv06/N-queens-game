import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchCurrentChallenge = createAsyncThunk(
  'dailyChallenge/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get(`${API_URL}/api/daily-challenges/current`, { headers })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current challenge')
    }
  }
)

export const startChallenge = createAsyncThunk(
  'dailyChallenge/start',
  async (challengeId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/daily-challenges/start`,
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start challenge')
    }
  }
)

export const completeChallenge = createAsyncThunk(
  'dailyChallenge/complete',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/daily-challenges/complete`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete challenge')
    }
  }
)

export const fetchChallengeHistory = createAsyncThunk(
  'dailyChallenge/fetchHistory',
  async ({ limit = 30, skip = 0 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/history?limit=${limit}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge history')
    }
  }
)

export const fetchChallengeStats = createAsyncThunk(
  'dailyChallenge/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge stats')
    }
  }
)

const dailyChallengeSlice = createSlice({
  name: 'dailyChallenge',
  initialState: {
    currentChallenge: null,
    userProgress: null,
    history: [],
    stats: null,
    rewards: null,
    loading: false,
    error: null,
    challengeStarted: false,
    challengeCompleted: false,
    pagination: {
      total: 0,
      limit: 30,
      skip: 0,
      hasMore: false
    }
  },
  reducers: {
    resetChallengeState: (state) => {
      state.challengeStarted = false
      state.challengeCompleted = false
      state.rewards = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateChallengeTimer: (state, action) => {
      if (state.userProgress) {
        state.userProgress.timeElapsed = action.payload
      }
    },
    incrementMoves: (state) => {
      if (state.userProgress) {
        state.userProgress.movesUsed = (state.userProgress.movesUsed || 0) + 1
      }
    },
    incrementHints: (state) => {
      if (state.userProgress) {
        state.userProgress.hintsUsed = (state.userProgress.hintsUsed || 0) + 1
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch current challenge
      .addCase(fetchCurrentChallenge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCurrentChallenge.fulfilled, (state, action) => {
        state.loading = false
        state.currentChallenge = action.payload.challenge
        state.userProgress = action.payload.userProgress
      })
      .addCase(fetchCurrentChallenge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Start challenge
      .addCase(startChallenge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startChallenge.fulfilled, (state, action) => {
        state.loading = false
        state.userProgress = action.payload.userChallenge
        state.challengeStarted = true
      })
      .addCase(startChallenge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Complete challenge
      .addCase(completeChallenge.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(completeChallenge.fulfilled, (state, action) => {
        state.loading = false
        state.userProgress = action.payload.userChallenge
        state.rewards = action.payload.rewards
        state.challengeCompleted = true
      })
      .addCase(completeChallenge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch history
      .addCase(fetchChallengeHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChallengeHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload.history
        state.pagination = action.payload.pagination
      })
      .addCase(fetchChallengeHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch stats
      .addCase(fetchChallengeStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChallengeStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(fetchChallengeStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  resetChallengeState,
  clearError,
  updateChallengeTimer,
  incrementMoves,
  incrementHints
} = dailyChallengeSlice.actions

export default dailyChallengeSlice.reducer
