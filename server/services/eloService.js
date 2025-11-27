import MultiplayerStats from '../models/MultiplayerStats.js'

class EloService {
  constructor() {
    // ELO constants
    this.BASE_K_FACTOR = 24
    this.NEW_PLAYER_K = 40 // For players with < 30 matches
    this.HIGH_ELO_K = 16 // For players with ELO >= 2400
  }

  /**
   * Calculate expected score for player A vs player B
   * @param {number} eloA - Player A's ELO rating
   * @param {number} eloB - Player B's ELO rating
   * @returns {number} Expected score (0-1)
   */
  calculateExpectedScore(eloA, eloB) {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400))
  }

  /**
   * Get K-factor for a player based on their stats
   * @param {Object} stats - Player's MultiplayerStats document
   * @returns {number} K-factor
   */
  getKFactor(stats) {
    if (stats.totalMatches < 30) {
      return this.NEW_PLAYER_K
    }
    if (stats.elo >= 2400) {
      return this.HIGH_ELO_K
    }
    return this.BASE_K_FACTOR
  }

  /**
   * Calculate ELO change for a match result
   * @param {number} playerElo - Player's current ELO
   * @param {number} opponentElo - Opponent's current ELO
   * @param {number} actualScore - Actual score (1 = win, 0.5 = draw, 0 = loss)
   * @param {number} kFactor - K-factor for this player
   * @returns {number} ELO change (can be negative)
   */
  calculateEloChange(playerElo, opponentElo, actualScore, kFactor) {
    const expectedScore = this.calculateExpectedScore(playerElo, opponentElo)
    const eloChange = Math.round(kFactor * (actualScore - expectedScore))
    return eloChange
  }

  /**
   * Process match result and update both players' stats
   * @param {Object} params - Match parameters
   * @returns {Object} Updated stats for both players
   */
  async processMatchResult(params) {
    const {
      player1Id,
      player2Id,
      winnerId,
      matchType,
      duration,
      player1Moves,
      player2Moves,
      isDraw = false
    } = params

    try {
      // Get both players' stats
      const [player1Stats, player2Stats] = await Promise.all([
        MultiplayerStats.getOrCreate(player1Id),
        MultiplayerStats.getOrCreate(player2Id)
      ])

      // Determine match results
      let player1Score, player2Score, player1Result, player2Result

      if (isDraw) {
        player1Score = 0.5
        player2Score = 0.5
        player1Result = 'draw'
        player2Result = 'draw'
      } else if (winnerId.toString() === player1Id.toString()) {
        player1Score = 1
        player2Score = 0
        player1Result = 'win'
        player2Result = 'loss'
      } else {
        player1Score = 0
        player2Score = 1
        player1Result = 'loss'
        player2Result = 'win'
      }

      // Calculate ELO changes
      const player1KFactor = this.getKFactor(player1Stats)
      const player2KFactor = this.getKFactor(player2Stats)

      const player1EloChange = this.calculateEloChange(
        player1Stats.elo,
        player2Stats.elo,
        player1Score,
        player1KFactor
      )

      const player2EloChange = this.calculateEloChange(
        player2Stats.elo,
        player1Stats.elo,
        player2Score,
        player2KFactor
      )

      // Update player 1 stats
      await player1Stats.recordMatch(
        player1Result,
        player2Id,
        player1EloChange,
        matchType,
        duration,
        player1Moves
      )

      // Update player 2 stats
      await player2Stats.recordMatch(
        player2Result,
        player1Id,
        player2EloChange,
        matchType,
        duration,
        player2Moves
      )

      console.log(`📊 ELO Updated:`)
      console.log(`   Player 1: ${player1Stats.elo - player1EloChange} → ${player1Stats.elo} (${player1EloChange >= 0 ? '+' : ''}${player1EloChange})`)
      console.log(`   Player 2: ${player2Stats.elo - player2EloChange} → ${player2Stats.elo} (${player2EloChange >= 0 ? '+' : ''}${player2EloChange})`)

      return {
        success: true,
        player1: {
          userId: player1Id,
          result: player1Result,
          eloChange: player1EloChange,
          newElo: player1Stats.elo,
          newRank: player1Stats.rank
        },
        player2: {
          userId: player2Id,
          result: player2Result,
          eloChange: player2EloChange,
          newElo: player2Stats.elo,
          newRank: player2Stats.rank
        }
      }
    } catch (error) {
      console.error('Error processing match result:', error)
      throw error
    }
  }

  /**
   * Calculate probability of player A winning against player B
   * @param {number} eloA - Player A's ELO
   * @param {number} eloB - Player B's ELO
   * @returns {Object} Win probabilities
   */
  calculateWinProbability(eloA, eloB) {
    const probA = this.calculateExpectedScore(eloA, eloB)
    const probB = 1 - probA

    return {
      playerA: (probA * 100).toFixed(1),
      playerB: (probB * 100).toFixed(1),
      draw: 5 // Simplified draw probability
    }
  }

  /**
   * Get rank tier from ELO rating
   * @param {number} elo - ELO rating
   * @returns {string} Rank tier
   */
  getRankFromElo(elo) {
    if (elo < 1200) return 'bronze'
    if (elo < 1400) return 'silver'
    if (elo < 1600) return 'gold'
    if (elo < 1800) return 'platinum'
    if (elo < 2000) return 'diamond'
    if (elo < 2200) return 'master'
    if (elo < 2400) return 'grandmaster'
    return 'challenger'
  }

  /**
   * Get rank thresholds
   * @returns {Object} Rank thresholds
   */
  getRankThresholds() {
    return {
      bronze: { min: 0, max: 1199 },
      silver: { min: 1200, max: 1399 },
      gold: { min: 1400, max: 1599 },
      platinum: { min: 1600, max: 1799 },
      diamond: { min: 1800, max: 1999 },
      master: { min: 2000, max: 2199 },
      grandmaster: { min: 2200, max: 2399 },
      challenger: { min: 2400, max: Infinity }
    }
  }

  /**
   * Calculate ELO gain/loss preview
   * @param {number} playerElo - Player's current ELO
   * @param {number} opponentElo - Opponent's ELO
   * @param {number} kFactor - K-factor
   * @returns {Object} Preview of potential ELO changes
   */
  getEloChangePreview(playerElo, opponentElo, kFactor) {
    const winChange = this.calculateEloChange(playerElo, opponentElo, 1, kFactor)
    const drawChange = this.calculateEloChange(playerElo, opponentElo, 0.5, kFactor)
    const lossChange = this.calculateEloChange(playerElo, opponentElo, 0, kFactor)

    return {
      win: winChange,
      draw: drawChange,
      loss: lossChange,
      expectedScore: this.calculateExpectedScore(playerElo, opponentElo)
    }
  }

  /**
   * Simulate ELO changes for multiple matches
   * @param {number} initialElo - Starting ELO
   * @param {Array} results - Array of {opponentElo, result} objects
   * @returns {Array} ELO progression
   */
  simulateEloProgression(initialElo, results) {
    let currentElo = initialElo
    const progression = [{ match: 0, elo: initialElo }]

    results.forEach((match, index) => {
      const score = match.result === 'win' ? 1 : match.result === 'draw' ? 0.5 : 0
      const kFactor = this.BASE_K_FACTOR
      const change = this.calculateEloChange(currentElo, match.opponentElo, score, kFactor)
      
      currentElo += change
      progression.push({
        match: index + 1,
        elo: currentElo,
        change,
        opponent: match.opponentElo,
        result: match.result
      })
    })

    return progression
  }
}

// Create singleton instance
const eloService = new EloService()

export default eloService
