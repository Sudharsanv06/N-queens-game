/**
 * achievementSlice.js
 * Merged from: achievementSlice + badgeSlice + xpSlice + rewardSlice
 *
 * Store key: achievements → state.achievements.*  (unchanged — root fields unbroken)
 *
 * State path changes (components must update selectors):
 *   state.badges.*   → state.achievements.badges.*
 *   state.xp.*       → state.achievements.xp.*
 *   state.rewards.*  → state.achievements.rewards.*
 *
 * Export renames (resolved name conflicts):
 *   achievementSlice.addLocalNotification  → addAchievementNotification
 *   achievementSlice.removeNotification    → removeAchievementNotification
 *   achievementSlice.clearAllNotifications → clearAllAchievementNotifications
 *   rewardSlice.addLocalNotification       → addRewardNotification
 *   rewardSlice.removeLocalNotification    → removeRewardNotification
 *   rewardSlice.fetchAllNotifications      → fetchRewardNotifications  (avoided clash with notificationsSlice concept)
 *
 * Reset scope (each reset only touches its own domain):
 *   resetAchievements → root achievement fields only
 *   resetBadges       → state.achievements.badges only
 *   resetXP           → state.achievements.xp only
 *   resetRewards      → state.achievements.rewards only
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─────────────────────────────────────────────────────────────────────────────
// Achievement Thunks  (from achievementSlice — prefix: achievements/)
// ─────────────────────────────────────────────────────────────────────────────

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
        headers: { Authorization: `Bearer ${auth.token}` },
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
        headers: { Authorization: `Bearer ${auth.token}` },
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
        headers: { Authorization: `Bearer ${auth.token}` },
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
        headers: { Authorization: `Bearer ${auth.token}` },
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
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Badge Thunks  (from badgeSlice — prefix: achievements/badges/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAllBadges = createAsyncThunk(
  'achievements/badges/fetchAll',
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
  'achievements/badges/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/user`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchBadgeById = createAsyncThunk(
  'achievements/badges/fetchById',
  async (badgeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/${badgeId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const equipBadge = createAsyncThunk(
  'achievements/badges/equip',
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
  'achievements/badges/fetchEquipped',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/user/equipped`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchBadgeNotifications = createAsyncThunk(
  'achievements/badges/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/badges/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markBadgeNotificationShown = createAsyncThunk(
  'achievements/badges/markNotificationShown',
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

// ─────────────────────────────────────────────────────────────────────────────
// XP Thunks  (from xpSlice — prefix: achievements/xp/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchUserXP = createAsyncThunk(
  'achievements/xp/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/xp`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchXPLeaderboard = createAsyncThunk(
  'achievements/xp/fetchLeaderboard',
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
  'achievements/xp/fetchProgress',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/progress`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Reward Thunks  (from rewardSlice — prefix: achievements/rewards/)
// fetchAllNotifications renamed → fetchRewardNotifications (avoids concept clash with notificationsSlice)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchRewardNotifications = createAsyncThunk(
  'achievements/rewards/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/api/rewards/notifications`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const markAllNotificationsShown = createAsyncThunk(
  'achievements/rewards/markAllNotifications',
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
  'achievements/rewards/fetchHistory',
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

// ─────────────────────────────────────────────────────────────────────────────
// Initial sub-states  (defined separately so scoped resets work correctly)
// ─────────────────────────────────────────────────────────────────────────────

const initialBadgesState = {
  badges: [],
  userBadges: [],
  groupedBadges: {
    bronze: [],
    silver: [],
    gold: [],
    platinum: [],
    diamond: [],
  },
  currentBadge: null,
  equippedBadge: null,
  notifications: [],
  total: 0,
  earned: 0,
  loading: false,
  error: null,
}

const initialXPState = {
  xp: {
    currentXP: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 50,
    levelProgress: 0,
    lastLevelUp: null,
    achievementPoints: 0,
  },
  leaderboard: [],
  progress: null,
  levelUpQueue: [],
  loading: false,
  error: null,
}

const initialRewardsState = {
  notifications: [],
  history: [],
  toastQueue: [],
  loading: false,
  error: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Root achievement state (state.achievements.*) — all paths preserved ────
  achievements: [],
  userAchievements: [],
  groupedAchievements: {
    progress: [],
    performance: [],
    puzzle: [],
  },
  currentAchievement: null,
  notifications: [],   // achievement-specific notifications
  stats: {
    total: 0,
    completed: 0,
    remaining: 0,
    completionPercentage: 0,
    byCategory: {
      progress: 0,
      performance: 0,
      puzzle: 0,
    },
  },
  loading: false,
  error: null,
  checkingAchievements: false,

  // ── Badges (state.achievements.badges.*) ──────────────────────────────────
  badges: { ...initialBadgesState },

  // ── XP / Levels (state.achievements.xp.*) ────────────────────────────────
  xp: { ...initialXPState },

  // ── Rewards (state.achievements.rewards.*) ────────────────────────────────
  rewards: { ...initialRewardsState },
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    // ── Root achievement reducers ─────────────────────────────────────────────
    clearAchievementError: (state) => {
      state.error = null
    },
    // Renamed: addLocalNotification → addAchievementNotification
    addAchievementNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    // Renamed: removeNotification → removeAchievementNotification
    removeAchievementNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.achievementId !== action.payload
      )
    },
    // Renamed: clearAllNotifications → clearAllAchievementNotifications
    clearAllAchievementNotifications: (state) => {
      state.notifications = []
    },
    // Resets root achievement fields only
    resetAchievements: (state) => {
      Object.assign(state, {
        achievements: [], userAchievements: [],
        groupedAchievements: { progress: [], performance: [], puzzle: [] },
        currentAchievement: null, notifications: [],
        stats: { total: 0, completed: 0, remaining: 0, completionPercentage: 0,
          byCategory: { progress: 0, performance: 0, puzzle: 0 } },
        loading: false, error: null, checkingAchievements: false,
      })
    },

    // ── Badge reducers ────────────────────────────────────────────────────────
    clearBadgeError: (state) => {
      state.badges.error = null
    },
    addBadgeNotification: (state, action) => {
      state.badges.notifications.push(action.payload)
    },
    removeBadgeNotification: (state, action) => {
      state.badges.notifications = state.badges.notifications.filter(
        (n) => n.badgeId !== action.payload
      )
    },
    clearAllBadgeNotifications: (state) => {
      state.badges.notifications = []
    },
    // Resets only badges sub-object
    resetBadges: (state) => {
      state.badges = { ...initialBadgesState }
    },

    // ── XP reducers ───────────────────────────────────────────────────────────
    clearXPError: (state) => {
      state.xp.error = null
    },
    addLevelUp: (state, action) => {
      state.xp.levelUpQueue.push(action.payload)
    },
    removeLevelUp: (state) => {
      state.xp.levelUpQueue.shift()
    },
    clearLevelUpQueue: (state) => {
      state.xp.levelUpQueue = []
    },
    updateLocalXP: (state, action) => {
      state.xp.xp = { ...state.xp.xp, ...action.payload }
    },
    // Resets only xp sub-object
    resetXP: (state) => {
      state.xp = { ...initialXPState }
    },

    // ── Reward reducers ───────────────────────────────────────────────────────
    clearRewardError: (state) => {
      state.rewards.error = null
    },
    addToastNotification: (state, action) => {
      state.rewards.toastQueue.push(action.payload)
    },
    removeToastNotification: (state) => {
      state.rewards.toastQueue.shift()
    },
    clearToastQueue: (state) => {
      state.rewards.toastQueue = []
    },
    // Renamed: addLocalNotification → addRewardNotification
    addRewardNotification: (state, action) => {
      state.rewards.notifications.push(action.payload)
    },
    // Renamed: removeLocalNotification → removeRewardNotification
    removeRewardNotification: (state, action) => {
      state.rewards.notifications = state.rewards.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
    // Resets only rewards sub-object
    resetRewards: (state) => {
      state.rewards = { ...initialRewardsState }
    },
  },

  extraReducers: (builder) => {
    builder

      // ── fetchAllAchievements ───────────────────────────────────────────────
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

      // ── fetchUserAchievements ──────────────────────────────────────────────
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
          completionPercentage: action.payload.completionPercentage,
        }
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── fetchAchievementById ───────────────────────────────────────────────
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

      // ── checkAchievements ─────────────────────────────────────────────────
      .addCase(checkAchievements.pending, (state) => {
        state.checkingAchievements = true
        state.error = null
      })
      .addCase(checkAchievements.fulfilled, (state, action) => {
        state.checkingAchievements = false
        if (action.payload.results?.unlockedAchievements) {
          action.payload.results.unlockedAchievements.forEach((unlock) => {
            state.notifications.push(unlock.achievement)
          })
        }
      })
      .addCase(checkAchievements.rejected, (state, action) => {
        state.checkingAchievements = false
        state.error = action.payload
      })

      // ── fetchAchievementNotifications ─────────────────────────────────────
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

      // ── markAchievementNotificationShown ──────────────────────────────────
      .addCase(markAchievementNotificationShown.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.achievementId !== action.payload
        )
      })

      // ── fetchAchievementStats ─────────────────────────────────────────────
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

      // ── fetchAllBadges ────────────────────────────────────────────────────
      .addCase(fetchAllBadges.pending, (state) => {
        state.badges.loading = true
        state.badges.error = null
      })
      .addCase(fetchAllBadges.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.badges = action.payload.badges
      })
      .addCase(fetchAllBadges.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── fetchUserBadges ───────────────────────────────────────────────────
      .addCase(fetchUserBadges.pending, (state) => {
        state.badges.loading = true
        state.badges.error = null
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.userBadges = action.payload.badges
        state.badges.groupedBadges = action.payload.grouped
        state.badges.total = action.payload.total
        state.badges.earned = action.payload.earned
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── fetchBadgeById ────────────────────────────────────────────────────
      .addCase(fetchBadgeById.pending, (state) => {
        state.badges.loading = true
        state.badges.error = null
      })
      .addCase(fetchBadgeById.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.currentBadge = action.payload.badge
      })
      .addCase(fetchBadgeById.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── equipBadge ────────────────────────────────────────────────────────
      .addCase(equipBadge.pending, (state) => {
        state.badges.loading = true
      })
      .addCase(equipBadge.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.userBadges = state.badges.userBadges.map((badge) => ({
          ...badge,
          isEquipped: badge.badgeId === action.payload.userBadge.badgeId,
        }))
      })
      .addCase(equipBadge.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── fetchEquippedBadge ────────────────────────────────────────────────
      .addCase(fetchEquippedBadge.pending, (state) => {
        state.badges.loading = true
      })
      .addCase(fetchEquippedBadge.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.equippedBadge = action.payload.badge
      })
      .addCase(fetchEquippedBadge.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── fetchBadgeNotifications ───────────────────────────────────────────
      .addCase(fetchBadgeNotifications.pending, (state) => {
        state.badges.loading = true
      })
      .addCase(fetchBadgeNotifications.fulfilled, (state, action) => {
        state.badges.loading = false
        state.badges.notifications = action.payload.notifications
      })
      .addCase(fetchBadgeNotifications.rejected, (state, action) => {
        state.badges.loading = false
        state.badges.error = action.payload
      })

      // ── markBadgeNotificationShown ────────────────────────────────────────
      .addCase(markBadgeNotificationShown.fulfilled, (state, action) => {
        state.badges.notifications = state.badges.notifications.filter(
          (n) => n.badgeId !== action.payload
        )
      })

      // ── fetchUserXP ───────────────────────────────────────────────────────
      .addCase(fetchUserXP.pending, (state) => {
        state.xp.loading = true
        state.xp.error = null
      })
      .addCase(fetchUserXP.fulfilled, (state, action) => {
        state.xp.loading = false
        state.xp.xp = action.payload.xp
      })
      .addCase(fetchUserXP.rejected, (state, action) => {
        state.xp.loading = false
        state.xp.error = action.payload
      })

      // ── fetchXPLeaderboard ────────────────────────────────────────────────
      .addCase(fetchXPLeaderboard.pending, (state) => {
        state.xp.loading = true
        state.xp.error = null
      })
      .addCase(fetchXPLeaderboard.fulfilled, (state, action) => {
        state.xp.loading = false
        state.xp.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchXPLeaderboard.rejected, (state, action) => {
        state.xp.loading = false
        state.xp.error = action.payload
      })

      // ── fetchUserProgress ─────────────────────────────────────────────────
      .addCase(fetchUserProgress.pending, (state) => {
        state.xp.loading = true
        state.xp.error = null
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.xp.loading = false
        state.xp.progress = action.payload.progress
        state.xp.xp = action.payload.progress.xp
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.xp.loading = false
        state.xp.error = action.payload
      })

      // ── fetchRewardNotifications ──────────────────────────────────────────
      .addCase(fetchRewardNotifications.pending, (state) => {
        state.rewards.loading = true
        state.rewards.error = null
      })
      .addCase(fetchRewardNotifications.fulfilled, (state, action) => {
        state.rewards.loading = false
        state.rewards.notifications = action.payload.notifications
        // Push incoming notifications into toast queue so they surface in UI
        action.payload.notifications.forEach((notif) => {
          state.rewards.toastQueue.push(notif)
        })
      })
      .addCase(fetchRewardNotifications.rejected, (state, action) => {
        state.rewards.loading = false
        state.rewards.error = action.payload
      })

      // ── markAllNotificationsShown ─────────────────────────────────────────
      .addCase(markAllNotificationsShown.fulfilled, (state) => {
        state.rewards.notifications = []
      })

      // ── fetchRewardHistory ────────────────────────────────────────────────
      .addCase(fetchRewardHistory.pending, (state) => {
        state.rewards.loading = true
        state.rewards.error = null
      })
      .addCase(fetchRewardHistory.fulfilled, (state, action) => {
        state.rewards.loading = false
        state.rewards.history = action.payload.rewards
      })
      .addCase(fetchRewardHistory.rejected, (state, action) => {
        state.rewards.loading = false
        state.rewards.error = action.payload
      })
  },
})

export const {
  // Achievement
  clearAchievementError,
  addAchievementNotification,
  removeAchievementNotification,
  clearAllAchievementNotifications,
  resetAchievements,
  // Badges
  clearBadgeError,
  addBadgeNotification,
  removeBadgeNotification,
  clearAllBadgeNotifications,
  resetBadges,
  // XP
  clearXPError,
  addLevelUp,
  removeLevelUp,
  clearLevelUpQueue,
  updateLocalXP,
  resetXP,
  // Rewards
  clearRewardError,
  addToastNotification,
  removeToastNotification,
  clearToastQueue,
  addRewardNotification,
  removeRewardNotification,
  resetRewards,
} = achievementSlice.actions

export default achievementSlice.reducer