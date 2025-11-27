import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const checkAchievements = async (gameData) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found, skipping achievement check')
      return { success: false, message: 'No authentication token' }
    }

    const response = await axios.post(`${API_URL}/api/achievements/check`, {
      gameData
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return response.data
  } catch (error) {
    console.error('Error checking achievements:', error)
    return { success: false, error: error.message }
  }
}

export const getUserAchievements = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await axios.get(`${API_URL}/api/achievements/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching achievements:', error)
    throw error
  }
}

export const getAchievementLeaderboard = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/api/achievements/leaderboard?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Error fetching achievement leaderboard:', error)
    throw error
  }
}

export const initializeAchievements = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await axios.post(`${API_URL}/api/achievements/initialize`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return response.data
  } catch (error) {
    console.error('Error initializing achievements:', error)
    throw error
  }
}