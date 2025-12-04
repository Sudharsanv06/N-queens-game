// Offline Authentication - Manage guest/offline users

export class OfflineAuth {
  static STORAGE_KEY = 'nqueens_offline_user'

  static createOfflineUser() {
    const user = {
      id: `offline_${Date.now()}`,
      username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
      isOffline: true,
      createdAt: new Date().toISOString(),
    }
    this.saveOfflineUser(user)
    return user
  }

  static saveOfflineUser(user) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save offline user:', error)
    }
  }

  static getOfflineUser() {
    try {
      const userJson = localStorage.getItem(this.STORAGE_KEY)
      return userJson ? JSON.parse(userJson) : null
    } catch (error) {
      console.error('Failed to get offline user:', error)
      return null
    }
  }

  static clearOfflineUser() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear offline user:', error)
    }
  }

  static isOfflineMode() {
    return !navigator.onLine || !localStorage.getItem('token')
  }

  static getOrCreateOfflineUser() {
    let user = this.getOfflineUser()
    if (!user) {
      user = this.createOfflineUser()
    }
    return user
  }

  static getCurrentUser() {
    // Check for authenticated user first
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        return JSON.parse(userStr)
      } catch (error) {
        console.error('Failed to parse user:', error)
      }
    }
    
    // Fall back to offline user
    return this.getOrCreateOfflineUser()
  }

  static isAuthenticated() {
    // Check if user has a valid token
    const token = localStorage.getItem('token')
    return !!token
  }
}

export default OfflineAuth
