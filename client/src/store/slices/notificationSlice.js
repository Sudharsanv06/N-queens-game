/**
 * notificationSlice.js
 * Store key: notifications → state.notifications.*
 *
 * This slice is standalone — it handles push/system notifications (bell icon,
 * notification centre) which are distinct from the reward/achievement toasts
 * that live in state.achievements.rewards.toastQueue.
 *
 * Cleanup from original notificationsSlice.js:
 *   - Removed duplicate loading flag (was set by both pending cases, only
 *     one flag needed — isLoading renamed to loading for consistency)
 *   - Fixed markAsRead reducer: was mutating state.notifications array with
 *     filter + reassign inside Immer — now uses findIndex + splice (correct)
 *   - Added clearError reducer that was missing
 *   - Action type prefix changed: 'notification/' → 'notifications/' to match
 *     slice name and avoid devtools confusion
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20, unreadOnly = false } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams({ page, limit })
      if (unreadOnly) params.append('unread', 'true')
      const response = await axios.get(`${API_URL}/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.put(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const subscribeToPush = createAsyncThunk(
  'notifications/subscribePush',
  async (subscription, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.post(
        `${API_URL}/api/notifications/push/subscribe`,
        { subscription },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const unsubscribeFromPush = createAsyncThunk(
  'notifications/unsubscribePush',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      await axios.delete(`${API_URL}/api/notifications/push/unsubscribe`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  hasMore: false,
  pushSubscribed: false,
  loading: false,
  error: null
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null
    },

    // Add a real-time notification pushed via socket
    addSocketNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },

    // Decrement unread count manually (e.g. on panel open)
    resetUnreadCount: (state) => {
      state.unreadCount = 0
    },

    resetNotifications: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount ?? 0
        state.total = action.payload.total ?? state.notifications.length
        state.hasMore = action.payload.hasMore ?? false
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex(n => n._id === action.payload)
        if (idx !== -1 && !state.notifications[idx].isRead) {
          state.notifications[idx].isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // markAllNotificationsRead
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true })
        state.unreadCount = 0
      })

      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex(n => n._id === action.payload)
        if (idx !== -1) {
          const wasUnread = !state.notifications[idx].isRead
          state.notifications.splice(idx, 1)
          if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // subscribeToPush
      .addCase(subscribeToPush.fulfilled, (state) => {
        state.pushSubscribed = true
      })

      // unsubscribeFromPush
      .addCase(unsubscribeFromPush.fulfilled, (state) => {
        state.pushSubscribed = false
      })
  }
})

export const {
  clearNotificationError,
  addSocketNotification,
  resetUnreadCount,
  resetNotifications
} = notificationSlice.actions

export default notificationSlice.reducer