import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import userSlice from './slices/userSlice'
import statsSlice from './slices/statsSlice'
import leaderboardSlice from './slices/leaderboardSlice'
import gameSlice from './slices/gameSlice'
import boardGameSlice from './slices/boardGameSlice'
import multiplayerSlice from './slices/multiplayerSlice'
import multiplayerSliceNew from './slices/multiplayerSliceNew'
import matchmakingSlice from './slices/matchmakingSlice'
import eloSlice from './slices/eloSlice'
import uiSlice from './slices/uiSlice'
import saveSlice from './slices/saveSlice'
import puzzleSlice from './slices/puzzleSlice'
import achievementSlice from './slices/achievementSlice'
import badgeSlice from './slices/badgeSlice'
import xpSlice from './slices/xpSlice'
import rewardSlice from './slices/rewardSlice'
import dailyChallengeSlice from './slices/dailyChallengeSlice'
import streakSlice from './slices/streakSlice'
import notificationsSlice from './slices/notificationsSlice'
import settingsSlice from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    stats: statsSlice,
    leaderboard: leaderboardSlice,
    game: gameSlice,
    boardGame: boardGameSlice,
    multiplayer: multiplayerSlice, // Old multiplayer (keep for compatibility)
    multiplayerGame: multiplayerSliceNew, // New Day 9 multiplayer system
    matchmaking: matchmakingSlice,
    elo: eloSlice,
    ui: uiSlice,
    save: saveSlice,
    puzzle: puzzleSlice,
    achievements: achievementSlice,
    badges: badgeSlice,
    xp: xpSlice,
    rewards: rewardSlice,
    dailyChallenge: dailyChallengeSlice,
    streak: streakSlice,
    notifications: notificationsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// Export types for TypeScript usage (remove if using pure JavaScript)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
