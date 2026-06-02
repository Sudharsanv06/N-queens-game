/**
 * multiplayerSlice.js
 * Merged from: multiplayerSlice + matchmakingSlice + eloSlice
 *
 * Store key: multiplayer → state.multiplayer.*  (unchanged — no breakage for core fields)
 *
 * State path changes (components must update):
 *   state.matchmaking.*   → state.multiplayer.matchmaking.*
 *   state.elo.*           → state.multiplayer.elo.*
 *   state.elo.elo         → state.multiplayer.elo.rating  (renamed: elo.elo was redundant)
 *
 * Export renames (resolved name conflicts):
 *   eloSlice.updateStats        → updateEloStats
 *   matchmakingSlice.updateStats → updateMatchmakingStats
 *
 * Reset scope (each reset only touches its own domain):
 *   resetMultiplayer  → resets only core room state
 *   resetMatchmaking  → resets only state.multiplayer.matchmaking
 *   resetEloState     → resets only state.multiplayer.elo
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─────────────────────────────────────────────────────────────────────────────
// ELO Thunks  (from eloSlice — prefix: elo/ → multiplayer/elo/)
// ─────────────────────────────────────────────────────────────────────────────

// Fetches /api/multiplayer/profile — ELO + game stats for any user
export const fetchEloProfile = createAsyncThunk(
  'multiplayer/elo/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const url = userId
        ? `${API_URL}/api/multiplayer/profile/${userId}`
        : `${API_URL}/api/multiplayer/profile`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ELO profile')
    }
  }
)

// ELO-ranked leaderboard — separate from general game leaderboard in uiSlice
export const fetchEloLeaderboard = createAsyncThunk(
  'multiplayer/elo/fetchLeaderboard',
  async ({ matchType = 'all', limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/multiplayer/leaderboard`, {
        params: { matchType, limit },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ELO leaderboard')
    }
  }
)

export const fetchMatchHistory = createAsyncThunk(
  'multiplayer/elo/fetchMatchHistory',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const url = userId
        ? `${API_URL}/api/multiplayer/match-history/${userId}`
        : `${API_URL}/api/multiplayer/match-history`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch match history')
    }
  }
)

export const fetchEloPreview = createAsyncThunk(
  'multiplayer/elo/fetchEloPreview',
  async (opponentElo, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/multiplayer/elo-preview`, {
        params: { opponentElo },
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ELO preview')
    }
  }
)

export const fetchRankInfo = createAsyncThunk(
  'multiplayer/elo/fetchRankInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/multiplayer/rank-info`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rank info')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Initial sub-states  (defined separately so resets can reference them)
// ─────────────────────────────────────────────────────────────────────────────

const initialMatchmakingState = {
  isInQueue: false,
  queueStartTime: null,
  waitTime: 0,
  estimatedWaitTime: null,
  selectedMatchType: 'standard', // standard | speed | puzzle-duel
  preferences: {
    eloRange: 200,
    allowBots: false,
    preferredBoardSize: 8,
  },
  queuePosition: null,
  playersInQueue: 0,
  matchFound: false,
  matchData: null,
  isSearching: false,
  isLeavingQueue: false,
  error: null,
  stats: {
    averageWaitTime: null,
    activeMatches: 0,
    totalPlayersOnline: 0,
  },
}

const initialEloState = {
  profile: null,
  rating: 1200,                  // renamed from 'elo' — was state.elo.elo, now state.multiplayer.elo.rating
  rank: 'bronze',
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  totalMatches: 0,
  currentStreak: 0,
  bestStreak: 0,
  leaderboard: [],
  userLeaderboardPosition: null,
  matchHistory: [],
  eloPreview: null,
  rankInfo: null,
  rankThresholds: {
    bronze: 0,
    silver: 1000,
    gold: 1200,
    platinum: 1400,
    diamond: 1600,
    master: 1800,
    grandmaster: 2000,
    challenger: 2200,
  },
  isLoadingProfile: false,
  isLoadingLeaderboard: false,
  isLoadingHistory: false,
  isLoadingPreview: false,
  isLoadingRankInfo: false,
  profileError: null,
  leaderboardError: null,
  historyError: null,
  previewError: null,
  rankInfoError: null,
  showEloChange: false,
  eloChangeAmount: 0,
  lastMatchResult: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Core room state (from multiplayerSlice) — state.multiplayer.* preserved ─
  gameId: null,
  players: [],
  currentTurn: null,
  gameState: 'waiting',       // waiting | playing | finished
  winner: null,
  isHost: false,
  connected: false,
  currentRoom: null,
  playerSide: null,
  opponentInfo: null,
  gameStatus: 'idle',
  playerBoard: [],
  opponentBoard: [],
  playerMoves: [],
  opponentMoves: [],
  playerTime: 0,
  opponentTime: 0,
  chatMessages: [],
  spectatorCount: 0,
  spectators: [],
  connectionStatus: 'disconnected',
  reconnecting: false,
  opponentConnected: false,
  gameResult: null,
  rematchRequested: null,
  error: null,
  resultModalOpen: false,
  rematchPromptOpen: false,

  // ── Matchmaking (from matchmakingSlice) — state.multiplayer.matchmaking.* ──
  matchmaking: { ...initialMatchmakingState },

  // ── ELO / Rankings (from eloSlice) — state.multiplayer.elo.* ──────────────
  elo: { ...initialEloState },
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState,
  reducers: {
    // ── Core room reducers (from multiplayerSlice — unchanged logic) ──────────
    setGameId: (state, action) => { state.gameId = action.payload },
    setPlayers: (state, action) => { state.players = action.payload },
    setCurrentTurn: (state, action) => { state.currentTurn = action.payload },
    setGameState: (state, action) => { state.gameState = action.payload },
    setWinner: (state, action) => { state.winner = action.payload },
    setIsHost: (state, action) => { state.isHost = action.payload },
    setConnected: (state, action) => { state.connected = action.payload },
    setCurrentRoom: (state, action) => { state.currentRoom = action.payload },
    leaveRoom: (state) => {
      state.currentRoom = null
      state.gameStatus = 'idle'
    },
    setPlayerSide: (state, action) => { state.playerSide = action.payload },
    setOpponentInfo: (state, action) => { state.opponentInfo = action.payload },
    updateGameStatus: (state, action) => { state.gameStatus = action.payload },
    initializeBoard: (state, action) => {
      state.playerBoard = action.payload
      state.opponentBoard = action.payload
    },
    updatePlayerBoard: (state, action) => { state.playerBoard = action.payload },
    updateOpponentBoard: (state, action) => { state.opponentBoard = action.payload },
    addPlayerMove: (state, action) => { state.playerMoves.push(action.payload) },
    addOpponentMove: (state, action) => { state.opponentMoves.push(action.payload) },
    setPlayerTime: (state, action) => { state.playerTime = action.payload },
    setOpponentTime: (state, action) => { state.opponentTime = action.payload },
    decrementPlayerTime: (state) => {
      if (state.playerTime > 0) state.playerTime -= 1
    },
    decrementOpponentTime: (state) => {
      if (state.opponentTime > 0) state.opponentTime -= 1
    },
    addChatMessage: (state, action) => { state.chatMessages.push(action.payload) },
    updateSpectatorCount: (state, action) => { state.spectatorCount = action.payload },
    addSpectator: (state, action) => { state.spectators.push(action.payload) },
    removeSpectator: (state, action) => {
      state.spectators = state.spectators.filter((s) => s.id !== action.payload)
    },
    setConnectionStatus: (state, action) => { state.connectionStatus = action.payload },
    setReconnecting: (state, action) => { state.reconnecting = action.payload },
    setOpponentConnected: (state, action) => { state.opponentConnected = action.payload },
    setGameResult: (state, action) => {
      state.gameResult = action.payload
      state.resultModalOpen = true
    },
    setRematchRequested: (state, action) => {
      state.rematchRequested = action.payload
      state.rematchPromptOpen = !!action.payload?.requestedBy
    },
    setError: (state, action) => { state.error = action.payload },
    closeResultModal: (state) => { state.resultModalOpen = false },
    closeRematchPrompt: (state) => { state.rematchPromptOpen = false },
    rejectRematch: (state) => {
      state.rematchRequested = null
      state.rematchPromptOpen = false
    },
    // Resets only the core room fields — matchmaking and elo are untouched
    resetMultiplayer: (state) => {
      Object.assign(state, {
        gameId: null, players: [], currentTurn: null, gameState: 'waiting',
        winner: null, isHost: false, connected: false, currentRoom: null,
        playerSide: null, opponentInfo: null, gameStatus: 'idle',
        playerBoard: [], opponentBoard: [], playerMoves: [], opponentMoves: [],
        playerTime: 0, opponentTime: 0, chatMessages: [], spectatorCount: 0,
        spectators: [], connectionStatus: 'disconnected', reconnecting: false,
        opponentConnected: false, gameResult: null, rematchRequested: null,
        error: null, resultModalOpen: false, rematchPromptOpen: false,
      })
    },

    // ── Matchmaking reducers (from matchmakingSlice) ───────────────────────────
    joinQueue: (state, action) => {
      state.matchmaking.isInQueue = true
      state.matchmaking.queueStartTime = Date.now()
      state.matchmaking.selectedMatchType = action.payload.matchType
      state.matchmaking.preferences = {
        ...state.matchmaking.preferences,
        ...action.payload.preferences,
      }
      state.matchmaking.isSearching = true
      state.matchmaking.error = null
    },
    leaveQueue: (state) => {
      state.matchmaking.isInQueue = false
      state.matchmaking.queueStartTime = null
      state.matchmaking.waitTime = 0
      state.matchmaking.isSearching = false
      state.matchmaking.matchFound = false
      state.matchmaking.matchData = null
      state.matchmaking.queuePosition = null
    },
    updateQueueStatus: (state, action) => {
      const { position, playersInQueue, estimatedWaitTime } = action.payload
      state.matchmaking.queuePosition = position
      state.matchmaking.playersInQueue = playersInQueue
      state.matchmaking.estimatedWaitTime = estimatedWaitTime
    },
    incrementWaitTime: (state) => {
      if (state.matchmaking.isInQueue && state.matchmaking.queueStartTime) {
        state.matchmaking.waitTime = Math.floor(
          (Date.now() - state.matchmaking.queueStartTime) / 1000
        )
      }
    },
    setMatchFound: (state, action) => {
      state.matchmaking.matchFound = true
      state.matchmaking.matchData = action.payload
      state.matchmaking.isSearching = false
    },
    clearMatchData: (state) => {
      state.matchmaking.matchFound = false
      state.matchmaking.matchData = null
    },
    setMatchType: (state, action) => {
      if (!state.matchmaking.isInQueue) {
        state.matchmaking.selectedMatchType = action.payload
      }
    },
    updatePreferences: (state, action) => {
      state.matchmaking.preferences = { ...state.matchmaking.preferences, ...action.payload }
    },
    setEloRange: (state, action) => {
      state.matchmaking.preferences.eloRange = action.payload
    },
    toggleAllowBots: (state) => {
      state.matchmaking.preferences.allowBots = !state.matchmaking.preferences.allowBots
    },
    setSearching: (state, action) => { state.matchmaking.isSearching = action.payload },
    setLeavingQueue: (state, action) => { state.matchmaking.isLeavingQueue = action.payload },
    // Renamed from updateStats to avoid conflict with eloSlice's updateStats
    updateMatchmakingStats: (state, action) => {
      state.matchmaking.stats = { ...state.matchmaking.stats, ...action.payload }
    },
    setMatchmakingError: (state, action) => {
      state.matchmaking.error = action.payload
      state.matchmaking.isSearching = false
    },
    clearMatchmakingError: (state) => { state.matchmaking.error = null },
    // Resets only the matchmaking sub-object
    resetMatchmaking: (state) => {
      state.matchmaking = { ...initialMatchmakingState }
    },

    // ── ELO reducers (from eloSlice) ──────────────────────────────────────────
    updateElo: (state, action) => {
      const { elo, change, result } = action.payload
      state.elo.rating = elo
      state.elo.eloChangeAmount = change
      state.elo.lastMatchResult = result
      state.elo.showEloChange = true
    },
    updateRank: (state, action) => { state.elo.rank = action.payload },
    // Renamed from updateStats to avoid conflict with matchmakingSlice's updateStats
    updateEloStats: (state, action) => {
      state.elo.profile = { ...state.elo.profile, ...action.payload }
      if (action.payload.wins !== undefined)          state.elo.wins = action.payload.wins
      if (action.payload.losses !== undefined)        state.elo.losses = action.payload.losses
      if (action.payload.draws !== undefined)         state.elo.draws = action.payload.draws
      if (action.payload.totalMatches !== undefined)  state.elo.totalMatches = action.payload.totalMatches
      if (action.payload.winRate !== undefined)       state.elo.winRate = action.payload.winRate
      if (action.payload.currentStreak !== undefined) state.elo.currentStreak = action.payload.currentStreak
      if (action.payload.bestStreak !== undefined)    state.elo.bestStreak = action.payload.bestStreak
    },
    hideEloChange: (state) => {
      state.elo.showEloChange = false
      state.elo.eloChangeAmount = 0
    },
    setLeaderboardPosition: (state, action) => {
      state.elo.userLeaderboardPosition = action.payload
    },
    addMatchToHistory: (state, action) => {
      state.elo.matchHistory.unshift(action.payload)
      if (state.elo.matchHistory.length > 20) state.elo.matchHistory.pop()
    },
    clearProfileError:     (state) => { state.elo.profileError = null },
    clearLeaderboardError: (state) => { state.elo.leaderboardError = null },
    clearHistoryError:     (state) => { state.elo.historyError = null },
    clearPreviewError:     (state) => { state.elo.previewError = null },
    clearRankInfoError:    (state) => { state.elo.rankInfoError = null },
    // Resets only the elo sub-object
    resetEloState: (state) => {
      state.elo = { ...initialEloState }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── fetchEloProfile ────────────────────────────────────────────────────
      .addCase(fetchEloProfile.pending, (state) => {
        state.elo.isLoadingProfile = true
        state.elo.profileError = null
      })
      .addCase(fetchEloProfile.fulfilled, (state, action) => {
        const stats = action.payload.stats
        state.elo.isLoadingProfile = false
        state.elo.profile = stats
        state.elo.rating = stats.elo           // server still returns field as 'elo'
        state.elo.rank = stats.rank
        state.elo.wins = stats.wins
        state.elo.losses = stats.losses
        state.elo.draws = stats.draws
        state.elo.winRate = stats.winRate
        state.elo.totalMatches = stats.totalMatches
        state.elo.currentStreak = stats.winStreak?.current || 0
        state.elo.bestStreak = stats.winStreak?.best || 0
        state.elo.userLeaderboardPosition = action.payload.leaderboardPosition
      })
      .addCase(fetchEloProfile.rejected, (state, action) => {
        state.elo.isLoadingProfile = false
        state.elo.profileError = action.payload
      })

      // ── fetchEloLeaderboard ────────────────────────────────────────────────
      .addCase(fetchEloLeaderboard.pending, (state) => {
        state.elo.isLoadingLeaderboard = true
        state.elo.leaderboardError = null
      })
      .addCase(fetchEloLeaderboard.fulfilled, (state, action) => {
        state.elo.isLoadingLeaderboard = false
        state.elo.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchEloLeaderboard.rejected, (state, action) => {
        state.elo.isLoadingLeaderboard = false
        state.elo.leaderboardError = action.payload
      })

      // ── fetchMatchHistory ──────────────────────────────────────────────────
      .addCase(fetchMatchHistory.pending, (state) => {
        state.elo.isLoadingHistory = true
        state.elo.historyError = null
      })
      .addCase(fetchMatchHistory.fulfilled, (state, action) => {
        state.elo.isLoadingHistory = false
        state.elo.matchHistory = action.payload.matches
      })
      .addCase(fetchMatchHistory.rejected, (state, action) => {
        state.elo.isLoadingHistory = false
        state.elo.historyError = action.payload
      })

      // ── fetchEloPreview ────────────────────────────────────────────────────
      .addCase(fetchEloPreview.pending, (state) => {
        state.elo.isLoadingPreview = true
        state.elo.previewError = null
      })
      .addCase(fetchEloPreview.fulfilled, (state, action) => {
        state.elo.isLoadingPreview = false
        state.elo.eloPreview = action.payload
      })
      .addCase(fetchEloPreview.rejected, (state, action) => {
        state.elo.isLoadingPreview = false
        state.elo.previewError = action.payload
      })

      // ── fetchRankInfo ──────────────────────────────────────────────────────
      .addCase(fetchRankInfo.pending, (state) => {
        state.elo.isLoadingRankInfo = true
        state.elo.rankInfoError = null
      })
      .addCase(fetchRankInfo.fulfilled, (state, action) => {
        state.elo.isLoadingRankInfo = false
        state.elo.rankInfo = action.payload
        if (action.payload.thresholds) {
          state.elo.rankThresholds = action.payload.thresholds
        }
      })
      .addCase(fetchRankInfo.rejected, (state, action) => {
        state.elo.isLoadingRankInfo = false
        state.elo.rankInfoError = action.payload
      })
  },
})

export const {
  // Core room
  setGameId, setPlayers, setCurrentTurn, setGameState, setWinner, setIsHost,
  setConnected, setCurrentRoom, leaveRoom, setPlayerSide, setOpponentInfo,
  updateGameStatus, initializeBoard, updatePlayerBoard, updateOpponentBoard,
  addPlayerMove, addOpponentMove, setPlayerTime, setOpponentTime,
  decrementPlayerTime, decrementOpponentTime, addChatMessage,
  updateSpectatorCount, addSpectator, removeSpectator,
  setConnectionStatus, setReconnecting, setOpponentConnected,
  setGameResult, setRematchRequested, setError,
  closeResultModal, closeRematchPrompt, rejectRematch, resetMultiplayer,
  // Matchmaking
  joinQueue, leaveQueue, updateQueueStatus, incrementWaitTime,
  setMatchFound, clearMatchData, setMatchType, updatePreferences,
  setEloRange, toggleAllowBots, setSearching, setLeavingQueue,
  updateMatchmakingStats, setMatchmakingError, clearMatchmakingError, resetMatchmaking,
  // ELO
  updateElo, updateRank, updateEloStats, hideEloChange,
  setLeaderboardPosition, addMatchToHistory,
  clearProfileError, clearLeaderboardError, clearHistoryError,
  clearPreviewError, clearRankInfoError, resetEloState,
} = multiplayerSlice.actions

export default multiplayerSlice.reducer