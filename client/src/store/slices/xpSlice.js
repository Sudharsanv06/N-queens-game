import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchUserXP = createAsyncThunk(
  'xp/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/xp`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchXPLeaderboard = createAsyncThunk(
  'xp/fetchLeaderboard',
  async ({ limit = 100, sortBy = 'level' } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(
        `${API_URL}/api/rewards/xp/leaderboard?limit=${limit}&sortBy=${sortBy}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUserProgress = createAsyncThunk(
  'xp/fetchProgress',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/progress`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial state
const initialState = {
  xp: {
    currentXP: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 50,
    levelProgress: 0,
    lastLevelUp: null,
    achievementPoints: 0
  },
  leaderboard: [],
  progress: null,
  levelUpQueue: [],
  loading: false,
  error: null
}

// Slice
const xpSlice = createSlice({
  name: 'xp',
  initialState,
  reducers: {
    clearXPError: (state) => {
      state.error = null
    },
    addLevelUp: (state, action) => {
      state.levelUpQueue.push(action.payload)
    },
    removeLevelUp: (state) => {
      state.levelUpQueue.shift()
    },
    clearLevelUpQueue: (state) => {
      state.levelUpQueue = []
    },
    updateLocalXP: (state, action) => {
      // For optimistic UI updates
      state.xp = {
        ...state.xp,
        ...action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user XP
      .addCase(fetchUserXP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserXP.fulfilled, (state, action) => {
        state.loading = false
        state.xp = action.payload.xp
      })
      .addCase(fetchUserXP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch XP leaderboard
      .addCase(fetchXPLeaderboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchXPLeaderboard.fulfilled, (state, action) => {
        state.loading = false
        state.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchXPLeaderboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.loading = false
        state.progress = action.payload.progress
        state.xp = action.payload.progress.xp
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  clearXPError,
  addLevelUp,
  removeLevelUp,
  clearLevelUpQueue,
  updateLocalXP
} = xpSlice.actions

export default xpSlice.reducer
