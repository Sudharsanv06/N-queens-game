import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchUserStreak = createAsyncThunk(
  'streak/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/streak`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak')
    }
  }
)

export const fetchStreakLeaderboard = createAsyncThunk(
  'streak/fetchLeaderboard',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/leaderboard/streak?limit=${limit}`
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard')
    }
  }
)

const streakSlice = createSlice({
  name: 'streak',
  initialState: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalChallengesCompleted: 0,
    milestones: [],
    leaderboard: [],
    loading: false,
    error: null,
    streakUpdate: null, // For showing streak continuation/break animations
    shouldBreak: false,
    completedToday: false
  },
  reducers: {
    setStreakUpdate: (state, action) => {
      state.streakUpdate = action.payload
    },
    clearStreakUpdate: (state) => {
      state.streakUpdate = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user streak
      .addCase(fetchUserStreak.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserStreak.fulfilled, (state, action) => {
        state.loading = false
        const streak = action.payload.streak
        state.currentStreak = streak.currentStreak
        state.longestStreak = streak.longestStreak
        state.lastCompletedDate = streak.lastCompletedDate
        state.totalChallengesCompleted = streak.totalChallengesCompleted
        state.milestones = streak.milestones
        state.shouldBreak = streak.shouldBreak
        state.completedToday = streak.completedToday
      })
      .addCase(fetchUserStreak.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch leaderboard
      .addCase(fetchStreakLeaderboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStreakLeaderboard.fulfilled, (state, action) => {
        state.loading = false
        state.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchStreakLeaderboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setStreakUpdate,
  clearStreakUpdate,
  clearError
} = streakSlice.actions

export default streakSlice.reducer
