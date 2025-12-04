import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchDailyChallenge = createAsyncThunk(
  'game/fetchDailyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.get(`${API_URL}/api/daily-challenges/current`, { headers })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily challenge')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'game/fetchLeaderboard',
  async (category = 'all', { rejectWithValue }) => {
    try {
      let endpoint = `${API_URL}/api/leaderboard/fastest`;
      
      // Map category to appropriate endpoint
      if (category === 'classic' || category === 'all') {
        endpoint = `${API_URL}/api/leaderboard/fastest`;
      } else if (category === 'modern') {
        endpoint = `${API_URL}/api/leaderboard/highest-board`;
      } else if (category === 'adventure' || category === 'expert') {
        endpoint = `${API_URL}/api/leaderboard/most-games`;
      }
      
      const response = await axios.get(endpoint, {
        params: { limit: 50 }
      })
      return response.data.leaderboard || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard')
    }
  }
)

export const submitScore = createAsyncThunk(
  'game/submitScore',
  async (scoreData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/games/submit`,
        scoreData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit score')
    }
  }
)

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    dailyChallenge: null,
    leaderboard: [],
    loading: {
      leaderboard: false,
      dailyChallenge: false,
      submitScore: false
    },
    error: null,
    currentGame: null,
  },
  reducers: {
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload
    },
    clearCurrentGame: (state) => {
      state.currentGame = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch daily challenge
      .addCase(fetchDailyChallenge.pending, (state) => {
        state.loading.dailyChallenge = true
        state.error = null
      })
      .addCase(fetchDailyChallenge.fulfilled, (state, action) => {
        state.loading.dailyChallenge = false
        state.dailyChallenge = action.payload
      })
      .addCase(fetchDailyChallenge.rejected, (state, action) => {
        state.loading.dailyChallenge = false
        state.error = action.payload
      })
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading.leaderboard = true
        state.error = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading.leaderboard = false
        state.leaderboard = action.payload
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading.leaderboard = false
        state.error = action.payload
      })
      // Submit score
      .addCase(submitScore.pending, (state) => {
        state.loading.submitScore = true
        state.error = null
      })
      .addCase(submitScore.fulfilled, (state, action) => {
        state.loading.submitScore = false
      })
      .addCase(submitScore.rejected, (state, action) => {
        state.loading.submitScore = false
        state.error = action.payload
      })
  },
})

export const { setCurrentGame, clearCurrentGame, clearError } = gameSlice.actions
export default gameSlice.reducer
