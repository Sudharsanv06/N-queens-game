import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    sidebarOpen: false,
    modalOpen: false,
    modalContent: null,
    notifications: [],
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    openModal: (state, action) => {
      state.modalOpen = true
      state.modalContent = action.payload
    },
    closeModal: (state) => {
      state.modalOpen = false
      state.modalContent = null
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const {
  setTheme,
  toggleSidebar,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
} = uiSlice.actions

export default uiSlice.reducer
