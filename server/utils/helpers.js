// server/utils/helpers.js
/**
 * General helper utilities
 */

/**
 * Calculate points based on game performance
 */
export const calculatePoints = (boardSize, timeElapsed, hintsUsed) => {
  const basePoints = boardSize * 100
  const timeBonus = Math.max(0, 1000 - timeElapsed)
  const hintPenalty = hintsUsed * 50
  
  return Math.max(0, basePoints + timeBonus - hintPenalty)
}

/**
 * Generate random board configuration
 */
export const generateRandomBoard = (size) => {
  const queens = []
  for (let i = 0; i < size; i++) {
    queens.push(Math.floor(Math.random() * size))
  }
  return queens
}

/**
 * Validate N-Queens solution
 */
export const isValidSolution = (queens) => {
  const n = queens.length
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Check same row
      if (queens[i] === queens[j]) return false
      
      // Check diagonals
      if (Math.abs(i - j) === Math.abs(queens[i] - queens[j])) return false
    }
  }
  
  return true
}

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Generate unique game ID
 */
export const generateGameId = () => {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate leaderboard rank
 */
export const calculateRank = (score, allScores) => {
  const sortedScores = allScores.sort((a, b) => b - a)
  return sortedScores.indexOf(score) + 1
}

/**
 * Paginate results
 */
export const paginate = (items, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  
  return {
    data: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.ceil(items.length / limit)
    }
  }
}

/**
 * Generate achievement progress
 */
export const calculateAchievementProgress = (current, target) => {
  return Math.min(100, Math.round((current / target) * 100))
}
