import MultiplayerStats from '../models/MultiplayerStats.js'

class MatchmakingService {
  constructor() {
    this.queue = {
      standard: [],
      speed: [],
      'puzzle-duel': []
    }
    
    this.searching = new Map() // userId -> { matchType, queuedAt, preferences }
  }

  // Add player to queue
  async addToQueue(userId, socketId, matchType, preferences = {}) {
    try {
      // Check if already in queue
      if (this.searching.has(userId.toString())) {
        return { success: false, error: 'Already in queue' }
      }

      // Get player stats
      const stats = await MultiplayerStats.getOrCreate(userId)
      
      const player = {
        userId: userId.toString(),
        socketId,
        elo: stats.elo,
        rank: stats.rank,
        wins: stats.wins,
        losses: stats.losses,
        queuedAt: Date.now(),
        preferences: {
          preferredEloRange: preferences.preferredEloRange || 200,
          maxWaitTime: preferences.maxWaitTime || 25000, // 25 seconds
          ...preferences
        }
      }

      // Add to appropriate queue
      if (!this.queue[matchType]) {
        return { success: false, error: 'Invalid match type' }
      }

      this.queue[matchType].push(player)
      this.searching.set(userId.toString(), { matchType, queuedAt: Date.now(), socketId })

      console.log(`✅ Player ${userId} added to ${matchType} queue (ELO: ${stats.elo})`)

      // Try to find match immediately
      const match = await this.findMatch(matchType, player)
      
      return {
        success: true,
        inQueue: true,
        queuePosition: this.queue[matchType].length,
        estimatedWaitTime: this.estimateWaitTime(matchType),
        match: match || null
      }
    } catch (error) {
      console.error('Error adding to queue:', error)
      return { success: false, error: error.message }
    }
  }

  // Remove player from queue
  removeFromQueue(userId) {
    const userIdStr = userId.toString()
    
    if (!this.searching.has(userIdStr)) {
      return { success: false, error: 'Not in queue' }
    }

    const { matchType } = this.searching.get(userIdStr)
    
    // Remove from queue
    this.queue[matchType] = this.queue[matchType].filter(
      p => p.userId !== userIdStr
    )
    
    this.searching.delete(userIdStr)

    console.log(`❌ Player ${userId} removed from ${matchType} queue`)

    return { success: true }
  }

  // Find match for player
  async findMatch(matchType, player) {
    const queue = this.queue[matchType]
    
    if (queue.length < 2) {
      return null
    }

    // Find best opponent based on ELO
    const opponents = queue.filter(p => p.userId !== player.userId)
    
    if (opponents.length === 0) {
      return null
    }

    // Calculate wait time
    const waitTime = Date.now() - player.queuedAt
    const maxWaitTime = player.preferences.maxWaitTime

    // ELO range expands over time
    const baseRange = player.preferences.preferredEloRange
    const expandedRange = baseRange + (waitTime / 1000) * 10 // Expand by 10 ELO per second

    // Find opponents within ELO range
    let suitableOpponents = opponents.filter(opp => {
      const eloDiff = Math.abs(player.elo - opp.elo)
      return eloDiff <= expandedRange
    })

    // If no suitable opponents and max wait time reached, match with anyone
    if (suitableOpponents.length === 0 && waitTime >= maxWaitTime) {
      suitableOpponents = opponents
      console.log(`⚠️ Max wait time reached for player ${player.userId}, matching with any available opponent`)
    }

    if (suitableOpponents.length === 0) {
      return null
    }

    // Sort by closest ELO
    suitableOpponents.sort((a, b) => {
      const diffA = Math.abs(player.elo - a.elo)
      const diffB = Math.abs(player.elo - b.elo)
      return diffA - diffB
    })

    // Select best opponent
    const opponent = suitableOpponents[0]

    // Remove both players from queue
    this.queue[matchType] = this.queue[matchType].filter(
      p => p.userId !== player.userId && p.userId !== opponent.userId
    )

    this.searching.delete(player.userId)
    this.searching.delete(opponent.userId)

    console.log(`🎮 Match found! Player ${player.userId} (${player.elo}) vs Player ${opponent.userId} (${opponent.elo})`)

    return {
      player1: player,
      player2: opponent,
      matchType,
      eloDifference: Math.abs(player.elo - opponent.elo)
    }
  }

  // Check all queues for potential matches
  async processQueues() {
    const matchTypes = ['standard', 'speed', 'puzzle-duel']
    const matches = []

    for (const matchType of matchTypes) {
      const queue = this.queue[matchType]
      
      // Process each player looking for a match
      for (let i = 0; i < queue.length; i++) {
        const player = queue[i]
        
        // Skip if already matched
        if (!this.searching.has(player.userId)) continue

        const match = await this.findMatch(matchType, player)
        
        if (match) {
          matches.push(match)
        }
      }
    }

    return matches
  }

  // Estimate wait time based on queue size and recent match rate
  estimateWaitTime(matchType) {
    const queueSize = this.queue[matchType].length
    
    if (queueSize === 0) return 0
    if (queueSize === 1) return 15000 // 15 seconds average
    
    // More players = faster matching
    return Math.max(5000, 20000 - (queueSize * 2000))
  }

  // Get queue status
  getQueueStatus(matchType = null) {
    if (matchType) {
      return {
        matchType,
        playersInQueue: this.queue[matchType].length,
        estimatedWait: this.estimateWaitTime(matchType)
      }
    }

    // All queues
    return Object.keys(this.queue).map(type => ({
      matchType: type,
      playersInQueue: this.queue[type].length,
      estimatedWait: this.estimateWaitTime(type)
    }))
  }

  // Get player queue status
  getPlayerStatus(userId) {
    const userIdStr = userId.toString()
    
    if (!this.searching.has(userIdStr)) {
      return { inQueue: false }
    }

    const { matchType, queuedAt } = this.searching.get(userIdStr)
    const waitTime = Date.now() - queuedAt

    return {
      inQueue: true,
      matchType,
      queuedAt,
      waitTime,
      queuePosition: this.queue[matchType].findIndex(p => p.userId === userIdStr) + 1,
      estimatedWaitTime: this.estimateWaitTime(matchType)
    }
  }

  // Clear queue (admin/testing)
  clearQueue(matchType = null) {
    if (matchType) {
      this.queue[matchType] = []
      
      // Remove from searching map
      for (const [userId, data] of this.searching.entries()) {
        if (data.matchType === matchType) {
          this.searching.delete(userId)
        }
      }
    } else {
      // Clear all queues
      this.queue = {
        standard: [],
        speed: [],
        'puzzle-duel': []
      }
      this.searching.clear()
    }

    return { success: true, message: 'Queue cleared' }
  }

  // Get queue statistics
  getStatistics() {
    const totalPlayers = Object.values(this.queue).reduce((sum, q) => sum + q.length, 0)
    
    const avgElo = {}
    for (const [type, queue] of Object.entries(this.queue)) {
      if (queue.length > 0) {
        const totalElo = queue.reduce((sum, p) => sum + p.elo, 0)
        avgElo[type] = Math.round(totalElo / queue.length)
      } else {
        avgElo[type] = 0
      }
    }

    return {
      totalPlayers,
      queueSizes: {
        standard: this.queue.standard.length,
        speed: this.queue.speed.length,
        'puzzle-duel': this.queue['puzzle-duel'].length
      },
      averageElo: avgElo,
      searchingCount: this.searching.size
    }
  }
}

// Create singleton instance
const matchmakingService = new MatchmakingService()

export default matchmakingService
