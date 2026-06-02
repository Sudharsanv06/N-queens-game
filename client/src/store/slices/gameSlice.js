/**
 * gameSlice.js
 * Merged from: gameSlice + saveSlice + puzzleSlice + dailyChallengeSlice + streakSlice
 *
 * Store key: game → state.game.*  (unchanged — no breakage for state.game.currentGame etc.)
 *
 * State path changes (components must update):
 *   state.save.*                       → state.game.save.*
 *   state.puzzle.*                     → state.game.puzzle.*
 *   state.dailyChallenge.*             → state.game.dailyChallenge.*
 *   state.streak.*                     → state.game.streak.*
 *
 * Thunks dropped (were duplicates):
 *   gameSlice.fetchDailyChallenge  → use fetchCurrentChallenge instead
 *   gameSlice.fetchLeaderboard     → moved to uiSlice
 *
 * clearError renames (to avoid a single export that masks the domain):
 *   clearError          → clears state.game.error  (top-level)
 *   clearSaveError      → clears state.game.save.error
 *   clearPuzzleErrors   → clears all state.game.puzzle error fields
 *   clearChallengeError → clears state.game.dailyChallenge.error
 *   clearStreakError    → clears state.game.streak.error
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import * as puzzleApi from '../../api/puzzleApi'
import * as gameApi from '../../api/gameApi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─────────────────────────────────────────────────────────────────────────────
// Save — retry helpers  (from saveSlice)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 3
const INITIAL_RETRY_DELAY = 1000
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const retryWithBackoff = async (fn, attempts = MAX_RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error
      await sleep(INITIAL_RETRY_DELAY * Math.pow(2, i))
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Game Thunks  (from gameSlice — fetchDailyChallenge & fetchLeaderboard removed)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Save Thunks  (from saveSlice — action type prefix changed: save/ → game/save/)
// ─────────────────────────────────────────────────────────────────────────────

export const saveGameAsync = createAsyncThunk(
  'game/save/saveGame',
  async (saveData, { rejectWithValue }) => {
    try {
      const result = await retryWithBackoff(() => gameApi.saveGame(saveData))
      return result
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save game')
    }
  }
)

export const loadGameAsync = createAsyncThunk(
  'game/save/loadGame',
  async (saveId, { rejectWithValue }) => {
    try {
      return await gameApi.loadGame(saveId)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load game')
    }
  }
)

export const loadLatestGameAsync = createAsyncThunk(
  'game/save/loadLatest',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await gameApi.loadLatestGame(sessionId)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load latest game')
    }
  }
)

export const listGamesAsync = createAsyncThunk(
  'game/save/listGames',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await gameApi.listGames(page, limit)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to list games')
    }
  }
)

export const deleteGameAsync = createAsyncThunk(
  'game/save/deleteGame',
  async (saveId, { rejectWithValue }) => {
    try {
      const result = await gameApi.deleteGame(saveId)
      return { saveId, ...result }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete game')
    }
  }
)

export const requestHintAsync = createAsyncThunk(
  'game/save/requestHint',
  async ({ sessionId, boardState, n }, { rejectWithValue }) => {
    try {
      return await gameApi.requestHint(sessionId, boardState, n)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get hint')
    }
  }
)

export const mergeSaveAsync = createAsyncThunk(
  'game/save/mergeSave',
  async (mergedData, { rejectWithValue }) => {
    try {
      return await gameApi.mergeSave(mergedData)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to merge save')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Puzzle Thunks  (from puzzleSlice — action type prefix changed: puzzle/ → game/puzzle/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchPuzzleList = createAsyncThunk(
  'game/puzzle/fetchList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await puzzleApi.getPuzzleList(filters)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch puzzles')
    }
  }
)

export const fetchPuzzle = createAsyncThunk(
  'game/puzzle/fetchSingle',
  async (puzzleId, { rejectWithValue }) => {
    try {
      return await puzzleApi.getPuzzle(puzzleId)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch puzzle')
    }
  }
)

export const startPuzzleAttempt = createAsyncThunk(
  'game/puzzle/startAttempt',
  async (puzzleId, { rejectWithValue }) => {
    try {
      return await puzzleApi.startAttempt(puzzleId)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start puzzle')
    }
  }
)

export const completePuzzleAttempt = createAsyncThunk(
  'game/puzzle/completeAttempt',
  async ({ puzzleId, attemptData }, { rejectWithValue }) => {
    try {
      return await puzzleApi.completeAttempt(puzzleId, attemptData)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete puzzle')
    }
  }
)

export const fetchUserPuzzleProgress = createAsyncThunk(
  'game/puzzle/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      return await puzzleApi.getProgress()
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch progress')
    }
  }
)

export const fetchUserAttempts = createAsyncThunk(
  'game/puzzle/fetchAttempts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await puzzleApi.getUserAttempts(filters)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attempts')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Daily Challenge Thunks  (from dailyChallengeSlice — prefix: dailyChallenge/ → game/challenge/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchCurrentChallenge = createAsyncThunk(
  'game/challenge/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.get(`${API_URL}/api/daily-challenges/current`, { headers })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current challenge')
    }
  }
)

export const startChallenge = createAsyncThunk(
  'game/challenge/start',
  async (challengeId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/daily-challenges/start`,
        { challengeId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start challenge')
    }
  }
)

export const completeChallenge = createAsyncThunk(
  'game/challenge/complete',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/daily-challenges/complete`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete challenge')
    }
  }
)

export const fetchChallengeHistory = createAsyncThunk(
  'game/challenge/fetchHistory',
  async ({ limit = 30, skip = 0 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/history?limit=${limit}&skip=${skip}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge history')
    }
  }
)

export const fetchChallengeStats = createAsyncThunk(
  'game/challenge/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge stats')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Streak Thunks  (from streakSlice — prefix: streak/ → game/streak/)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchUserStreak = createAsyncThunk(
  'game/streak/fetchUser',
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
  'game/streak/fetchLeaderboard',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/daily-challenges/leaderboard/streak?limit=${limit}`
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak leaderboard')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Core game (from gameSlice) ─────────────────────────────────────────────
  currentGame: null,
  loading: false,   // for submitScore
  error: null,

  // ── Save system (from saveSlice) — accessed as state.game.save.* ───────────
  save: {
    currentSave: null,
    savesList: [],
    pagination: null,
    lastSaveTime: null,
    saveStatus: 'idle',
    loadStatus: 'idle',
    hintStatus: 'idle',
    error: null,
    autoSaveEnabled: true,
    saveCount: 0,
    failedSaves: 0,
    pendingSave: false,
    conflictData: null,
    lastHint: null,
    hintsRemaining: 3,
    hintsUsed: 0,
  },

  // ── Puzzle (from puzzleSlice) — accessed as state.game.puzzle.* ───────────
  puzzle: {
    puzzles: [],
    totalPuzzles: 0,
    filteredPuzzles: [],
    currentPuzzle: null,
    currentAttempt: null,
    userProgress: null,
    attempts: [],
    totalAttempts: 0,
    filters: { difficulty: null, category: null, n: null },
    loading: false,
    listLoading: false,
    progressLoading: false,
    attemptLoading: false,
    error: null,
    listError: null,
    progressError: null,
    attemptError: null,
    attemptStarted: false,
    attemptCompleted: false,
  },

  // ── Daily Challenge (from dailyChallengeSlice) — state.game.dailyChallenge.* ─
  dailyChallenge: {
    currentChallenge: null,
    userProgress: null,
    history: [],
    stats: null,
    rewards: null,
    loading: false,
    error: null,
    challengeStarted: false,
    challengeCompleted: false,
    pagination: { total: 0, limit: 30, skip: 0, hasMore: false },
  },

  // ── Streak (from streakSlice) — accessed as state.game.streak.* ───────────
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalChallengesCompleted: 0,
    milestones: [],
    leaderboard: [],
    loading: false,
    error: null,
    streakUpdate: null,
    shouldBreak: false,
    completedToday: false,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // ── Core ──────────────────────────────────────────────────────────────────
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload
    },
    clearCurrentGame: (state) => {
      state.currentGame = null
    },
    clearError: (state) => {
      state.error = null
    },

    // ── Save ──────────────────────────────────────────────────────────────────
    setSaveStatus: (state, action) => {
      state.save.saveStatus = action.payload
    },
    setAutoSaveEnabled: (state, action) => {
      state.save.autoSaveEnabled = action.payload
    },
    incrementFailedSaves: (state) => {
      state.save.failedSaves += 1
    },
    resetFailedSaves: (state) => {
      state.save.failedSaves = 0
    },
    setConflictData: (state, action) => {
      state.save.conflictData = action.payload
    },
    clearConflictData: (state) => {
      state.save.conflictData = null
    },
    clearSaveError: (state) => {
      state.save.error = null
    },
    updateLocalSave: (state, action) => {
      state.save.currentSave = action.payload
      state.save.lastSaveTime = new Date().toISOString()
    },
    clearSaveState: (state) => {
      state.save.currentSave = null
      state.save.lastSaveTime = null
      state.save.saveStatus = 'idle'
      state.save.error = null
      state.save.conflictData = null
      state.save.lastHint = null
      state.save.hintsUsed = 0
      state.save.hintsRemaining = 3
    },
    setHintsUsed: (state, action) => {
      state.save.hintsUsed = action.payload
      state.save.hintsRemaining = Math.max(0, 3 - action.payload)
    },
    clearHint: (state) => {
      state.save.lastHint = null
    },

    // ── Puzzle ────────────────────────────────────────────────────────────────
    setFilters: (state, action) => {
      state.puzzle.filters = { ...state.puzzle.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.puzzle.filters = { difficulty: null, category: null, n: null }
    },
    clearCurrentPuzzle: (state) => {
      state.puzzle.currentPuzzle = null
      state.puzzle.currentAttempt = null
    },
    clearPuzzleErrors: (state) => {
      state.puzzle.error = null
      state.puzzle.listError = null
      state.puzzle.progressError = null
      state.puzzle.attemptError = null
    },
    resetAttemptFlags: (state) => {
      state.puzzle.attemptStarted = false
      state.puzzle.attemptCompleted = false
    },
    updateCurrentAttempt: (state, action) => {
      if (state.puzzle.currentAttempt) {
        state.puzzle.currentAttempt = { ...state.puzzle.currentAttempt, ...action.payload }
      }
    },

    // ── Daily Challenge ───────────────────────────────────────────────────────
    resetChallengeState: (state) => {
      state.dailyChallenge.challengeStarted = false
      state.dailyChallenge.challengeCompleted = false
      state.dailyChallenge.rewards = null
      state.dailyChallenge.error = null
    },
    clearChallengeError: (state) => {
      state.dailyChallenge.error = null
    },
    updateChallengeTimer: (state, action) => {
      if (state.dailyChallenge.userProgress) {
        state.dailyChallenge.userProgress.timeElapsed = action.payload
      }
    },
    incrementMoves: (state) => {
      if (state.dailyChallenge.userProgress) {
        state.dailyChallenge.userProgress.movesUsed =
          (state.dailyChallenge.userProgress.movesUsed || 0) + 1
      }
    },
    incrementHints: (state) => {
      if (state.dailyChallenge.userProgress) {
        state.dailyChallenge.userProgress.hintsUsed =
          (state.dailyChallenge.userProgress.hintsUsed || 0) + 1
      }
    },

    // ── Streak ────────────────────────────────────────────────────────────────
    setStreakUpdate: (state, action) => {
      state.streak.streakUpdate = action.payload
    },
    clearStreakUpdate: (state) => {
      state.streak.streakUpdate = null
    },
    clearStreakError: (state) => {
      state.streak.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      // ── submitScore ──────────────────────────────────────────────────────────
      .addCase(submitScore.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitScore.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(submitScore.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── saveGameAsync ────────────────────────────────────────────────────────
      .addCase(saveGameAsync.pending, (state) => {
        state.save.saveStatus = 'loading'
        state.save.pendingSave = true
        state.save.error = null
      })
      .addCase(saveGameAsync.fulfilled, (state, action) => {
        state.save.saveStatus = 'succeeded'
        state.save.pendingSave = false
        state.save.currentSave = action.payload.data
        state.save.lastSaveTime = new Date().toISOString()
        state.save.saveCount += 1
        state.save.failedSaves = 0
        state.save.error = null
      })
      .addCase(saveGameAsync.rejected, (state, action) => {
        state.save.saveStatus = 'failed'
        state.save.pendingSave = false
        state.save.error = action.payload
        state.save.failedSaves += 1
      })

      // ── loadGameAsync ────────────────────────────────────────────────────────
      .addCase(loadGameAsync.pending, (state) => {
        state.save.loadStatus = 'loading'
        state.save.error = null
      })
      .addCase(loadGameAsync.fulfilled, (state, action) => {
        state.save.loadStatus = 'succeeded'
        state.save.currentSave = action.payload.data
        state.save.error = null
      })
      .addCase(loadGameAsync.rejected, (state, action) => {
        state.save.loadStatus = 'failed'
        state.save.error = action.payload
      })

      // ── loadLatestGameAsync ──────────────────────────────────────────────────
      .addCase(loadLatestGameAsync.pending, (state) => {
        state.save.loadStatus = 'loading'
        state.save.error = null
      })
      .addCase(loadLatestGameAsync.fulfilled, (state, action) => {
        state.save.loadStatus = 'succeeded'
        state.save.currentSave = action.payload.data
        state.save.hintsUsed = action.payload.data?.hintsUsed || 0
        state.save.hintsRemaining = Math.max(0, 3 - state.save.hintsUsed)
        state.save.error = null
      })
      .addCase(loadLatestGameAsync.rejected, (state, action) => {
        state.save.loadStatus = 'failed'
        state.save.error = action.payload
      })

      // ── listGamesAsync ───────────────────────────────────────────────────────
      .addCase(listGamesAsync.pending, (state) => {
        state.save.loadStatus = 'loading'
        state.save.error = null
      })
      .addCase(listGamesAsync.fulfilled, (state, action) => {
        state.save.loadStatus = 'succeeded'
        state.save.savesList = action.payload.data
        state.save.pagination = action.payload.pagination
        state.save.error = null
      })
      .addCase(listGamesAsync.rejected, (state, action) => {
        state.save.loadStatus = 'failed'
        state.save.error = action.payload
      })

      // ── deleteGameAsync ──────────────────────────────────────────────────────
      .addCase(deleteGameAsync.fulfilled, (state, action) => {
        state.save.savesList = state.save.savesList.filter(
          (s) => s.id !== action.payload.saveId
        )
        if (state.save.currentSave?.id === action.payload.saveId) {
          state.save.currentSave = null
        }
      })

      // ── requestHintAsync ─────────────────────────────────────────────────────
      .addCase(requestHintAsync.pending, (state) => {
        state.save.hintStatus = 'loading'
        state.save.error = null
      })
      .addCase(requestHintAsync.fulfilled, (state, action) => {
        state.save.hintStatus = 'succeeded'
        state.save.lastHint = action.payload.hint
        state.save.hintsUsed = action.payload.hintsUsed
        state.save.hintsRemaining = action.payload.hintsRemaining
        state.save.error = null
      })
      .addCase(requestHintAsync.rejected, (state, action) => {
        state.save.hintStatus = 'failed'
        state.save.error = action.payload
      })

      // ── mergeSaveAsync ───────────────────────────────────────────────────────
      .addCase(mergeSaveAsync.fulfilled, (state, action) => {
        state.save.currentSave = action.payload.data
        state.save.conflictData = null
        state.save.saveStatus = 'succeeded'
      })

      // ── fetchPuzzleList ──────────────────────────────────────────────────────
      .addCase(fetchPuzzleList.pending, (state) => {
        state.puzzle.listLoading = true
        state.puzzle.listError = null
      })
      .addCase(fetchPuzzleList.fulfilled, (state, action) => {
        state.puzzle.listLoading = false
        state.puzzle.puzzles = action.payload.puzzles || []
        state.puzzle.totalPuzzles = action.payload.total || 0
        state.puzzle.filteredPuzzles = action.payload.puzzles || []
      })
      .addCase(fetchPuzzleList.rejected, (state, action) => {
        state.puzzle.listLoading = false
        state.puzzle.listError = action.payload
      })

      // ── fetchPuzzle ──────────────────────────────────────────────────────────
      .addCase(fetchPuzzle.pending, (state) => {
        state.puzzle.loading = true
        state.puzzle.error = null
      })
      .addCase(fetchPuzzle.fulfilled, (state, action) => {
        state.puzzle.loading = false
        state.puzzle.currentPuzzle = action.payload.puzzle
      })
      .addCase(fetchPuzzle.rejected, (state, action) => {
        state.puzzle.loading = false
        state.puzzle.error = action.payload
      })

      // ── startPuzzleAttempt ───────────────────────────────────────────────────
      .addCase(startPuzzleAttempt.pending, (state) => {
        state.puzzle.attemptLoading = true
        state.puzzle.attemptError = null
        state.puzzle.attemptStarted = false
      })
      .addCase(startPuzzleAttempt.fulfilled, (state, action) => {
        state.puzzle.attemptLoading = false
        state.puzzle.currentAttempt = action.payload.attempt
        state.puzzle.currentPuzzle = action.payload.puzzle
        state.puzzle.attemptStarted = true
      })
      .addCase(startPuzzleAttempt.rejected, (state, action) => {
        state.puzzle.attemptLoading = false
        state.puzzle.attemptError = action.payload
        state.puzzle.attemptStarted = false
      })

      // ── completePuzzleAttempt ────────────────────────────────────────────────
      .addCase(completePuzzleAttempt.pending, (state) => {
        state.puzzle.attemptLoading = true
        state.puzzle.attemptError = null
        state.puzzle.attemptCompleted = false
      })
      .addCase(completePuzzleAttempt.fulfilled, (state, action) => {
        state.puzzle.attemptLoading = false
        state.puzzle.currentAttempt = action.payload.attempt
        state.puzzle.attemptCompleted = true
      })
      .addCase(completePuzzleAttempt.rejected, (state, action) => {
        state.puzzle.attemptLoading = false
        state.puzzle.attemptError = action.payload
        state.puzzle.attemptCompleted = false
      })

      // ── fetchUserPuzzleProgress ──────────────────────────────────────────────
      .addCase(fetchUserPuzzleProgress.pending, (state) => {
        state.puzzle.progressLoading = true
        state.puzzle.progressError = null
      })
      .addCase(fetchUserPuzzleProgress.fulfilled, (state, action) => {
        state.puzzle.progressLoading = false
        state.puzzle.userProgress = action.payload.progress
      })
      .addCase(fetchUserPuzzleProgress.rejected, (state, action) => {
        state.puzzle.progressLoading = false
        state.puzzle.progressError = action.payload
      })

      // ── fetchUserAttempts ────────────────────────────────────────────────────
      .addCase(fetchUserAttempts.pending, (state) => {
        state.puzzle.loading = true
        state.puzzle.error = null
      })
      .addCase(fetchUserAttempts.fulfilled, (state, action) => {
        state.puzzle.loading = false
        state.puzzle.attempts = action.payload.attempts || []
        state.puzzle.totalAttempts = action.payload.total || 0
      })
      .addCase(fetchUserAttempts.rejected, (state, action) => {
        state.puzzle.loading = false
        state.puzzle.error = action.payload
      })

      // ── fetchCurrentChallenge ────────────────────────────────────────────────
      .addCase(fetchCurrentChallenge.pending, (state) => {
        state.dailyChallenge.loading = true
        state.dailyChallenge.error = null
      })
      .addCase(fetchCurrentChallenge.fulfilled, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.currentChallenge = action.payload.challenge
        state.dailyChallenge.userProgress = action.payload.userProgress
      })
      .addCase(fetchCurrentChallenge.rejected, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.error = action.payload
      })

      // ── startChallenge ───────────────────────────────────────────────────────
      .addCase(startChallenge.pending, (state) => {
        state.dailyChallenge.loading = true
        state.dailyChallenge.error = null
      })
      .addCase(startChallenge.fulfilled, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.userProgress = action.payload.userChallenge
        state.dailyChallenge.challengeStarted = true
      })
      .addCase(startChallenge.rejected, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.error = action.payload
      })

      // ── completeChallenge ────────────────────────────────────────────────────
      .addCase(completeChallenge.pending, (state) => {
        state.dailyChallenge.loading = true
        state.dailyChallenge.error = null
      })
      .addCase(completeChallenge.fulfilled, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.userProgress = action.payload.userChallenge
        state.dailyChallenge.rewards = action.payload.rewards
        state.dailyChallenge.challengeCompleted = true
      })
      .addCase(completeChallenge.rejected, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.error = action.payload
      })

      // ── fetchChallengeHistory ────────────────────────────────────────────────
      .addCase(fetchChallengeHistory.pending, (state) => {
        state.dailyChallenge.loading = true
        state.dailyChallenge.error = null
      })
      .addCase(fetchChallengeHistory.fulfilled, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.history = action.payload.history
        state.dailyChallenge.pagination = action.payload.pagination
      })
      .addCase(fetchChallengeHistory.rejected, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.error = action.payload
      })

      // ── fetchChallengeStats ──────────────────────────────────────────────────
      .addCase(fetchChallengeStats.pending, (state) => {
        state.dailyChallenge.loading = true
        state.dailyChallenge.error = null
      })
      .addCase(fetchChallengeStats.fulfilled, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.stats = action.payload.stats
      })
      .addCase(fetchChallengeStats.rejected, (state, action) => {
        state.dailyChallenge.loading = false
        state.dailyChallenge.error = action.payload
      })

      // ── fetchUserStreak ──────────────────────────────────────────────────────
      .addCase(fetchUserStreak.pending, (state) => {
        state.streak.loading = true
        state.streak.error = null
      })
      .addCase(fetchUserStreak.fulfilled, (state, action) => {
        state.streak.loading = false
        const s = action.payload.streak
        state.streak.currentStreak = s.currentStreak
        state.streak.longestStreak = s.longestStreak
        state.streak.lastCompletedDate = s.lastCompletedDate
        state.streak.totalChallengesCompleted = s.totalChallengesCompleted
        state.streak.milestones = s.milestones
        state.streak.shouldBreak = s.shouldBreak
        state.streak.completedToday = s.completedToday
      })
      .addCase(fetchUserStreak.rejected, (state, action) => {
        state.streak.loading = false
        state.streak.error = action.payload
      })

      // ── fetchStreakLeaderboard ───────────────────────────────────────────────
      .addCase(fetchStreakLeaderboard.pending, (state) => {
        state.streak.loading = true
        state.streak.error = null
      })
      .addCase(fetchStreakLeaderboard.fulfilled, (state, action) => {
        state.streak.loading = false
        state.streak.leaderboard = action.payload.leaderboard
      })
      .addCase(fetchStreakLeaderboard.rejected, (state, action) => {
        state.streak.loading = false
        state.streak.error = action.payload
      })
  },
})

export const {
  // Core
  setCurrentGame,
  clearCurrentGame,
  clearError,
  // Save
  setSaveStatus,
  setAutoSaveEnabled,
  incrementFailedSaves,
  resetFailedSaves,
  setConflictData,
  clearConflictData,
  clearSaveError,
  updateLocalSave,
  clearSaveState,
  setHintsUsed,
  clearHint,
  // Puzzle
  setFilters,
  clearFilters,
  clearCurrentPuzzle,
  clearPuzzleErrors,
  resetAttemptFlags,
  updateCurrentAttempt,
  // Daily Challenge
  resetChallengeState,
  clearChallengeError,
  updateChallengeTimer,
  incrementMoves,
  incrementHints,
  // Streak
  setStreakUpdate,
  clearStreakUpdate,
  clearStreakError,
} = gameSlice.actions

export default gameSlice.reducer