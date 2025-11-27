import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchAllBadges = createAsyncThunk(
  'badges/fetchAll',
  async ({ tier, category } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (tier) params.append('tier', tier)
      if (category) params.append('category', category)
      
      const response = await axios.get(`${API_URL}/api/badges?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUserBadges = createAsyncThunk(
  'badges/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/user`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchBadgeById = createAsyncThunk(
  'badges/fetchById',
  async (badgeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/${badgeId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const equipBadge = createAsyncThunk(
  'badges/equip',
  async ({ badgeId, equip }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.put(
        `${API_URL}/api/badges/user/${badgeId}/equip`,
        { equip },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchEquippedBadge = createAsyncThunk(
  'badges/fetchEquipped',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/user/equipped`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchBadgeNotifications = createAsyncThunk(
  'badges/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markBadgeNotificationShown = createAsyncThunk(
  'badges/markNotificationShown',
  async (badgeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.put(
        `${API_URL}/api/badges/notifications/${badgeId}`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return badgeId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial state
const initialState = {
  badges: [],
  userBadges: [],
  groupedBadges: {
    bronze: [],
    silver: [],
    gold: [],
    platinum: [],
    diamond: []
  },
  currentBadge: null,
  equippedBadge: null,
  notifications: [],
  total: 0,
  earned: 0,
  loading: false,
  error: null
}

// Slice
const badgeSlice = createSlice({
  name: 'badges',
  initialState,
  reducers: {
    clearBadgeError: (state) => {
      state.error = null
    },
    addBadgeNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    removeBadgeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.badgeId !== action.payload
      )
    },
    clearAllBadgeNotifications: (state) => {
      state.notifications = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all badges
      .addCase(fetchAllBadges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllBadges.fulfilled, (state, action) => {
        state.loading = false
        state.badges = action.payload.badges
      })
      .addCase(fetchAllBadges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch user badges
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading = false
        state.userBadges = action.payload.badges
        state.groupedBadges = action.payload.grouped
        state.total = action.payload.total
        state.earned = action.payload.earned
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch badge by ID
      .addCase(fetchBadgeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBadgeById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBadge = action.payload.badge
      })
      .addCase(fetchBadgeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Equip badge
      .addCase(equipBadge.pending, (state) => {
        state.loading = true
      })
      .addCase(equipBadge.fulfilled, (state, action) => {
        state.loading = false
        // Update equipped status in userBadges
        state.userBadges = state.userBadges.map(badge => ({
          ...badge,
          isEquipped: badge.badgeId === action.payload.userBadge.badgeId
        }))
      })
      .addCase(equipBadge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch equipped badge
      .addCase(fetchEquippedBadge.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchEquippedBadge.fulfilled, (state, action) => {
        state.loading = false
        state.equippedBadge = action.payload.badge
      })
      .addCase(fetchEquippedBadge.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch notifications
      .addCase(fetchBadgeNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBadgeNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
      })
      .addCase(fetchBadgeNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark notification shown
      .addCase(markBadgeNotificationShown.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          n => n.badgeId !== action.payload
        )
      })
  }
})

export const {
  clearBadgeError,
  addBadgeNotification,
  removeBadgeNotification,
  clearAllBadgeNotifications
} = badgeSlice.actions

export default badgeSlice.reducer
