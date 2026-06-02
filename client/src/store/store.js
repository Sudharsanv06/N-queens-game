/**
 * store.js
 * Consolidated Redux store — 6 slices replacing the original 19.
 *
 * Slice → store key → what it absorbed
 * ─────────────────────────────────────────────────────────────────────────────
 *  authSlice        → state.auth          ← authSlice, userSlice, statsSlice, settingsSlice
 *  gameSlice        → state.game          ← gameSlice, saveSlice, puzzleSlice, dailyChallengeSlice, streakSlice
 *  multiplayerSlice → state.multiplayer   ← multiplayerSlice, matchmakingSlice, eloSlice
 *  achievementSlice → state.achievements  ← achievementSlice, badgeSlice, xpSlice, rewardSlice
 *  notificationSlice→ state.notifications ← notificationsSlice (standalone, cleaned up)
 *  uiSlice          → state.ui            ← uiSlice, leaderboardSlice
 *
 * State path migration cheat-sheet (update component selectors):
 *   state.user.*           → state.auth.*
 *   state.stats.*          → state.auth.*
 *   state.settings.*       → state.auth.settings.*
 *   state.save.*           → state.game.save.*
 *   state.puzzle.*         → state.game.puzzle.*
 *   state.dailyChallenge.* → state.game.challenge.*
 *   state.streak.*         → state.game.streak.*
 *   state.matchmaking.*    → state.multiplayer.matchmaking.*
 *   state.elo.*            → state.multiplayer.elo.*
 *   state.badges.*         → state.achievements.badges.*
 *   state.xp.*             → state.achievements.xp.*
 *   state.rewards.*        → state.achievements.rewards.*
 *   state.leaderboard.*    → state.ui.leaderboard.*
 */

import { configureStore } from '@reduxjs/toolkit'

import authReducer       from './slices/authSlice'
import gameReducer       from './slices/gameSlice'
import multiplayerReducer from './slices/multiplayerSlice'
import achievementReducer from './slices/achievementSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer         from './slices/uiSlice'

const store = configureStore({
  reducer: {
    auth:          authReducer,
    game:          gameReducer,
    multiplayer:   multiplayerReducer,
    achievements:  achievementReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Some slices store non-serializable Date objects (earnedAt, lastLevelUp)
      // in state for display purposes — suppress the warning for those paths.
      serializableCheck: {
        ignoredPaths: [
          'auth.user.createdAt',
          'achievements.xp.xp.lastLevelUp',
          'game.streak.streak.lastActivity',
          'game.challenge.currentChallenge.date',
        ],
      },
    }),

  devTools: import.meta.env.DEV,
})

export default store