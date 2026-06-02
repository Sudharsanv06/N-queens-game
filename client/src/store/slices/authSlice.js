/**
 * authSlice.js
 * Merged from: authSlice + userSlice + statsSlice + settingsSlice
 *
 * Store key:  auth   → state.auth.*  (unchanged — no component path breakage here)
 *
 * State additions vs old authSlice:
 *   state.auth.publicProfile    ← was state.user.profile
 *   state.auth.updateSuccess    ← was state.user.updateSuccess
 *   state.auth.passwordChangeSuccess ← was state.user.passwordChangeSuccess
 *   state.auth.accountDeleted   ← was state.user.accountDeleted
 *   state.auth.userStats        ← was state.stats.userStats
 *   state.auth.globalStats      ← was state.stats.globalStats
 *   state.auth.settings.*       ← was state.settings.*
 *
 * Thunk renames (to resolve conflicts):
 *   userSlice.updateProfile  → updateUserProfile  (hits /api/user/profile)
 *   userSlice.changePassword → changeUserPassword (hits /api/user/password)
 *   userSlice.getProfile     → fetchPublicProfile (any user by ID)
 *
 * Unchanged thunks (kept as-is):
 *   loginUser, signupUser, logoutUser, refreshAccessToken, fetchCurrentUser
 *   updateProfile, changePassword, uploadAvatar  (all from original authSlice)
 *   deleteAccount, getUserStats, getGlobalStats
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api'

// ─────────────────────────────────────────────────────────────────────────────
// Auth Thunks  (unchanged from original authSlice)
// ─────────────────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      localStorage.setItem('token', response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(response.data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, name, email, password, mobile }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        username, name, email, password, mobile,
      })
      localStorage.setItem('token', response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(response.data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken })
      }
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      return true
    } catch (error) {
      // Always clear locally even when the API call fails
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token available')
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      return response.data
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      return rejectWithValue(error.response?.data?.message || 'Session expired')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

// Hits /api/auth/profile — updates the authenticated user's own name/email
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password')
    }
  }
)

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE_URL}/auth/upload-avatar`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// User Profile Thunks  (from userSlice — renamed to avoid conflicts)
// ─────────────────────────────────────────────────────────────────────────────

// Hits /api/user/profile/:userId — fetch any user's public profile
// Renamed from userSlice's getProfile → fetchPublicProfile
export const fetchPublicProfile = createAsyncThunk(
  'auth/fetchPublicProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId
        ? `${API_BASE_URL}/user/profile/${userId}`
        : `${API_BASE_URL}/user/profile`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

// Hits /api/user/profile — broader profile update (richer payload than updateProfile)
// Renamed from userSlice's updateProfile → updateUserProfile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/user/profile`, profileData)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

// Hits /api/user/password — alternative password endpoint
// Renamed from userSlice's changePassword → changeUserPassword
export const changeUserPassword = createAsyncThunk(
  'auth/changeUserPassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/user/password`, {
        currentPassword, newPassword,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password')
    }
  }
)

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (password, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/user/account`, {
        data: { password },
      })
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Stats Thunks  (from statsSlice — unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const getUserStats = createAsyncThunk(
  'auth/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/user`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

export const getGlobalStats = createAsyncThunk(
  'auth/getGlobalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/global`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch global statistics')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Auth session (from authSlice) ──────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // ── User profile (from userSlice) ──────────────────────────────────────────
  publicProfile: null,        // any user's profile (was state.user.profile)
  updateSuccess: false,
  passwordChangeSuccess: false,
  accountDeleted: false,

  // ── Stats (from statsSlice) ────────────────────────────────────────────────
  userStats: null,            // was state.stats.userStats
  globalStats: null,          // was state.stats.globalStats

  // ── Settings (from settingsSlice) ──────────────────────────────────────────
  settings: {                 // was state.settings.*
    sound: true,
    music: true,
    haptics: true,
    notifications: true,
    theme: 'light',
    language: 'en',
  },

  // ── Shared ─────────────────────────────────────────────────────────────────
  loading: false,
  statsLoading: false,        // separate flag so stats fetch doesn't block auth UI
  error: null,
}

// Restore axios header on page load if token exists in localStorage
if (initialState.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ── Auth helpers ──────────────────────────────────────────────────────────
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },

    // ── User helpers (from userSlice) ─────────────────────────────────────────
    clearSuccess: (state) => {
      state.updateSuccess = false
      state.passwordChangeSuccess = false
    },

    // ── Stats helpers (from statsSlice) ───────────────────────────────────────
    clearStats: (state) => {
      state.userStats = null
      state.globalStats = null
    },

    // ── Settings reducers (from settingsSlice) ────────────────────────────────
    toggleSound: (state) => {
      state.settings.sound = !state.settings.sound
    },
    toggleMusic: (state) => {
      state.settings.music = !state.settings.music
    },
    toggleHaptics: (state) => {
      state.settings.haptics = !state.settings.haptics
    },
    toggleNotifications: (state) => {
      state.settings.notifications = !state.settings.notifications
    },
    // Named setSettingsTheme to avoid collision with uiSlice's setTheme
    setSettingsTheme: (state, action) => {
      state.settings.theme = action.payload
    },
    setLanguage: (state, action) => {
      state.settings.language = action.payload
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── Login ────────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // ── Signup ───────────────────────────────────────────────────────────────
      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // ── Logout ───────────────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
        // Clear derived state that belongs to this user session
        state.publicProfile = null
        state.userStats = null
        state.updateSuccess = false
        state.passwordChangeSuccess = false
      })

      // ── Refresh token ─────────────────────────────────────────────────────────
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
      })

      // ── Fetch current user ───────────────────────────────────────────────────
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── Update profile (auth endpoint) ────────────────────────────────────────
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
        state.updateSuccess = false
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.updateSuccess = true
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.updateSuccess = false
      })

      // ── Change password (auth endpoint) ──────────────────────────────────────
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.passwordChangeSuccess = false
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.passwordChangeSuccess = true
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.passwordChangeSuccess = false
      })

      // ── Upload avatar ─────────────────────────────────────────────────────────
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.error = null
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── Fetch public profile (user endpoint) ─────────────────────────────────
      .addCase(fetchPublicProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.loading = false
        state.publicProfile = action.payload.user
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── Update user profile (user endpoint) ──────────────────────────────────
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
        state.updateSuccess = false
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.updateSuccess = true
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.updateSuccess = false
      })

      // ── Change user password (user endpoint) ──────────────────────────────────
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.passwordChangeSuccess = false
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false
        state.passwordChangeSuccess = true
        state.error = null
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.passwordChangeSuccess = false
      })

      // ── Delete account ────────────────────────────────────────────────────────
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        // Full wipe — reset to empty session
        state.loading = false
        state.accountDeleted = true
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.publicProfile = null
        state.userStats = null
        state.error = null
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── User stats ────────────────────────────────────────────────────────────
      .addCase(getUserStats.pending, (state) => {
        state.statsLoading = true
        state.error = null
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.userStats = action.payload.stats
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })

      // ── Global stats ──────────────────────────────────────────────────────────
      .addCase(getGlobalStats.pending, (state) => {
        state.statsLoading = true
        state.error = null
      })
      .addCase(getGlobalStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.globalStats = action.payload.stats
      })
      .addCase(getGlobalStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })
  },
})

export const {
  // Auth helpers
  clearError,
  updateUser,
  // User helpers
  clearSuccess,
  // Stats helpers
  clearStats,
  // Settings reducers
  toggleSound,
  toggleMusic,
  toggleHaptics,
  toggleNotifications,
  setSettingsTheme,
  setLanguage,
  updateSettings,
} = authSlice.actions

export default authSlice.reducer