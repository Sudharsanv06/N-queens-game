// Offline Game Store - Local storage management for offline gameplay

export class OfflineGameStore {
  static STORAGE_KEY = 'nqueens_offline_games'

  static saveGame(gameData) {
    try {
      const games = this.getAllGames()
      const gameId = gameData.id || Date.now().toString()
      games[gameId] = {
        ...gameData,
        id: gameId,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games))
      return gameId
    } catch (error) {
      console.error('Failed to save game:', error)
      return null
    }
  }

  static getGame(gameId) {
    try {
      const games = this.getAllGames()
      return games[gameId] || null
    } catch (error) {
      console.error('Failed to get game:', error)
      return null
    }
  }

  static getAllGames() {
    try {
      const gamesJson = localStorage.getItem(this.STORAGE_KEY)
      return gamesJson ? JSON.parse(gamesJson) : {}
    } catch (error) {
      console.error('Failed to get all games:', error)
      return {}
    }
  }

  static deleteGame(gameId) {
    try {
      const games = this.getAllGames()
      delete games[gameId]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games))
      return true
    } catch (error) {
      console.error('Failed to delete game:', error)
      return false
    }
  }

  static clearAllGames() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear games:', error)
      return false
    }
  }

  static getGamesList() {
    const games = this.getAllGames()
    return Object.values(games).sort((a, b) => 
      new Date(b.savedAt) - new Date(a.savedAt)
    )
  }

  static getGames() {
    // Alias for getGamesList - used by leaderboard
    return this.getGamesList()
  }
}

export default OfflineGameStore
