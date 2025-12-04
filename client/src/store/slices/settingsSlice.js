import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    sound: true,
    music: true,
    haptics: true,
    notifications: true,
    theme: 'light',
    language: 'en',
  },
  reducers: {
    toggleSound: (state) => {
      state.sound = !state.sound
    },
    toggleMusic: (state) => {
      state.music = !state.music
    },
    toggleHaptics: (state) => {
      state.haptics = !state.haptics
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    setLanguage: (state, action) => {
      state.language = action.payload
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
})

export const {
  toggleSound,
  toggleMusic,
  toggleHaptics,
  toggleNotifications,
  setTheme,
  setLanguage,
  updateSettings,
} = settingsSlice.actions

export default settingsSlice.reducer
