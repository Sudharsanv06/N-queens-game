import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchAllAchievements = createAsyncThunk(
  'achievements/fetchAll',
  async ({ category, tier } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (tier) params.append('tier', tier)
      
      const response = await axios.get(`${API_URL}/api/achievements?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUserAchievements = createAsyncThunk(
  'achievements/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/achievements/user`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchAchievementById = createAsyncThunk(
  'achievements/fetchById',
  async (achievementId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/achievements/${achievementId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const checkAchievements = createAsyncThunk(
  'achievements/check',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/achievements/user/check`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchAchievementNotifications = createAsyncThunk(
  'achievements/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/achievements/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markAchievementNotificationShown = createAsyncThunk(
  'achievements/markNotificationShown',
  async (achievementId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.put(
        `${API_URL}/api/achievements/notifications/${achievementId}`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return achievementId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchAchievementStats = createAsyncThunk(
  'achievements/fetchStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/achievements/user/stats`, {
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
  achievements: [],
  userAchievements: [],
  groupedAchievements: {
    progress: [],
    performance: [],
    puzzle: []
  },
  currentAchievement: null,
  notifications: [],
  stats: {
    total: 0,
    completed: 0,
    remaining: 0,
    completionPercentage: 0,
    byCategory: {
      progress: 0,
      performance: 0,
      puzzle: 0
    }
  },
  loading: false,
  error: null,
  checkingAchievements: false
}

// Slice
const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearAchievementError: (state) => {
      state.error = null
    },
    addLocalNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.achievementId !== action.payload
      )
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all achievements
      .addCase(fetchAllAchievements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllAchievements.fulfilled, (state, action) => {
        state.loading = false
        state.achievements = action.payload.achievements
      })
      .addCase(fetchAllAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch user achievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.loading = false
        state.userAchievements = action.payload.achievements
        state.groupedAchievements = action.payload.grouped
        state.stats = {
          ...state.stats,
          total: action.payload.total,
          completed: action.payload.completed,
          completionPercentage: action.payload.completionPercentage
        }
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch achievement by ID
      .addCase(fetchAchievementById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAchievementById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAchievement = action.payload.achievement
      })
      .addCase(fetchAchievementById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Check achievements
      .addCase(checkAchievements.pending, (state) => {
        state.checkingAchievements = true
        state.error = null
      })
      .addCase(checkAchievements.fulfilled, (state, action) => {
        state.checkingAchievements = false
        // Add newly unlocked achievements to notifications
        if (action.payload.results?.unlockedAchievements) {
          action.payload.results.unlockedAchievements.forEach(unlock => {
            state.notifications.push(unlock.achievement)
          })
        }
      })
      .addCase(checkAchievements.rejected, (state, action) => {
        state.checkingAchievements = false
        state.error = action.payload
      })
      
      // Fetch notifications
      .addCase(fetchAchievementNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAchievementNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
      })
      .addCase(fetchAchievementNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark notification shown
      .addCase(markAchievementNotificationShown.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          n => n.achievementId !== action.payload
        )
      })
      
      // Fetch stats
      .addCase(fetchAchievementStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAchievementStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(fetchAchievementStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  clearAchievementError,
  addLocalNotification,
  removeNotification,
  clearAllNotifications
} = achievementSlice.actions

export default achievementSlice.reducer
