/**
 * uiSlice.js
 * Merged from: uiSlice + leaderboardSlice
 * Store key: ui → state.ui.*
 *
 * State path changes (components must update selectors):
 *   state.leaderboard.*  → state.ui.leaderboard.*
 *
 * Export renames (resolved conflicts):
 *   leaderboardSlice.setTheme   → does not conflict (leaderboard had no setTheme)
 *   leaderboardSlice.clearError → renamed clearLeaderboardError
 *
 * Reset scope:
 *   resetUI          → root ui fields only
 *   resetLeaderboard → state.ui.leaderboard only
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Thunks  (from leaderboardSlice — prefix: ui/leaderboard/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchLeaderboard = createAsyncThunk(
  'ui/leaderboard/fetch',
  async ({ boardSize = 'all', timeRange = 'all', page = 1, limit = 50 } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams({ boardSize, timeRange, page, limit })
      const response = await axios.get(`${API_URL}/api/leaderboard?${params}`, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUserRank = createAsyncThunk(
  'ui/leaderboard/fetchUserRank',
  async ({ boardSize = 'all', timeRange = 'all' } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams({ boardSize, timeRange })
      const response = await axios.get(`${API_URL}/api/leaderboard/user-rank?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchMultiplayerLeaderboard = createAsyncThunk(
  'ui/leaderboard/fetchMultiplayer',
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams({ page, limit })
      const response = await axios.get(`${API_URL}/api/leaderboard/multiplayer?${params}`, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Initial Sub-States
// ─────────────────────────────────────────────────────────────────────────────

const initialLeaderboardState = {
  entries: [],
  multiplayerEntries: [],
  userRank: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  filters: {
    boardSize: 'all',
    timeRange: 'all'
  },
  loading: false,
  error: null
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Root UI state ─────────────────────────────────────────────────────────
  theme: 'dark',                // 'dark' | 'light'
  sidebarOpen: false,
  mobileMenuOpen: false,
  activeModal: null,            // string key of currently open modal, or null
  globalLoading: false,
  toastMessages: [],            // short-lived UI messages (distinct from reward toasts)

  // ── Leaderboard (state.ui.leaderboard.*) ─────────────────────────────────
  leaderboard: { ...initialLeaderboardState }
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ── Root UI reducers ──────────────────────────────────────────────────────
    setTheme: (state, action) => {
      state.theme = action.payload  // 'dark' | 'light'
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload
    },
    openModal: (state, action) => {
      state.activeModal = action.payload  // modal key string
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
    addToastMessage: (state, action) => {
      state.toastMessages.push({ id: Date.now(), ...action.payload })
    },
    removeToastMessage: (state, action) => {
      state.toastMessages = state.toastMessages.filter(t => t.id !== action.payload)
    },
    resetUI: (state) => {
      Object.assign(state, {
        sidebarOpen: false,
        mobileMenuOpen: false,
        activeModal: null,
        globalLoading: false,
        toastMessages: []
        // theme intentionally preserved across resets
      })
    },

    // ── Leaderboard reducers ──────────────────────────────────────────────────
    setLeaderboardFilters: (state, action) => {
      state.leaderboard.filters = { ...state.leaderboard.filters, ...action.payload }
    },
    clearLeaderboardError: (state) => {
      state.leaderboard.error = null
    },
    resetLeaderboard: (state) => {
      state.leaderboard = { ...initialLeaderboardState }
    }
  },
  extraReducers: (builder) => {
    builder
      // ── fetchLeaderboard ──────────────────────────────────────────────────
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboard.loading = true
        state.leaderboard.error = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.entries = action.payload.entries
        state.leaderboard.total = action.payload.total ?? action.payload.entries.length
        state.leaderboard.currentPage = action.payload.page ?? 1
        state.leaderboard.totalPages = action.payload.totalPages ?? 1
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.error = action.payload
      })

      // ── fetchUserRank ─────────────────────────────────────────────────────
      .addCase(fetchUserRank.pending, (state) => {
        state.leaderboard.loading = true
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.userRank = action.payload.rank
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.error = action.payload
      })

      // ── fetchMultiplayerLeaderboard ───────────────────────────────────────
      .addCase(fetchMultiplayerLeaderboard.pending, (state) => {
        state.leaderboard.loading = true
        state.leaderboard.error = null
      })
      .addCase(fetchMultiplayerLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.multiplayerEntries = action.payload.entries
      })
      .addCase(fetchMultiplayerLeaderboard.rejected, (state, action) => {
        state.leaderboard.loading = false
        state.leaderboard.error = action.payload
      })
  }
})

export const {
  // UI
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  openModal,
  closeModal,
  setGlobalLoading,
  addToastMessage,
  removeToastMessage,
  resetUI,
  // Leaderboard
  setLeaderboardFilters,
  clearLeaderboardError,
  resetLeaderboard
} = uiSlice.actions

export default uiSlice.reducer