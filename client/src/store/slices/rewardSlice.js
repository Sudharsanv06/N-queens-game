import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Async thunks
export const fetchAllNotifications = createAsyncThunk(
  'rewards/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markAllNotificationsShown = createAsyncThunk(
  'rewards/markAllNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.put(
        `${API_URL}/api/rewards/notifications/mark-all`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchRewardHistory = createAsyncThunk(
  'rewards/fetchHistory',
  async ({ limit = 50 } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(
        `${API_URL}/api/rewards/history?limit=${limit}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial state
const initialState = {
  notifications: [],
  history: [],
  toastQueue: [],
  loading: false,
  error: null
}

// Slice
const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearRewardError: (state) => {
      state.error = null
    },
    addToastNotification: (state, action) => {
      state.toastQueue.push(action.payload)
    },
    removeToastNotification: (state) => {
      state.toastQueue.shift()
    },
    clearToastQueue: (state) => {
      state.toastQueue = []
    },
    addLocalNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    removeLocalNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      )
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        // Add to toast queue
        action.payload.notifications.forEach(notif => {
          state.toastQueue.push(notif)
        })
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Mark all notifications shown
      .addCase(markAllNotificationsShown.fulfilled, (state) => {
        state.notifications = []
      })
      
      // Fetch reward history
      .addCase(fetchRewardHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRewardHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload.rewards
      })
      .addCase(fetchRewardHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  clearRewardError,
  addToastNotification,
  removeToastNotification,
  clearToastQueue,
  addLocalNotification,
  removeLocalNotification
} = rewardSlice.actions

export default rewardSlice.reducer
