import Tournament from '../models/Tournament.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

class TournamentService {
  // Create a new tournament
  async createTournament(tournamentData, organizerId) {
    try {
      const tournament = new Tournament({
        ...tournamentData,
        organizer: organizerId,
        status: 'upcoming'
      })

      await tournament.save()
      await tournament.populate('organizer', 'name email')
      return { success: true, tournament }
    } catch (error) {
      console.error('Error creating tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all tournaments with filters
  async getTournaments(filters = {}) {
    try {
      const query = {}
      
      if (filters.status) {
        query.status = filters.status
      }
      
      if (filters.gameMode) {
        query.gameMode = filters.gameMode
      }
      
      if (filters.type) {
        query.type = filters.type
      }
      
      if (filters.upcoming) {
        query['schedule.tournamentStart'] = { $gt: new Date() }
      }
      
      if (filters.registrationOpen) {
        const now = new Date()
        query.status = 'registration'
        query['schedule.registrationStart'] = { $lte: now }
        query['schedule.registrationEnd'] = { $gte: now }
      }

      const tournaments = await Tournament.find(query)
        .populate('organizer', 'name email')
        .populate('participants.user', 'name email')
        .sort({ 'schedule.tournamentStart': 1 })
        .limit(filters.limit || 50)

      return { success: true, tournaments }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      return { success: false, error: error.message }
    }
  }

  // Get tournament by ID
  async getTournamentById(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
        .populate('organizer', 'name email')
        .populate('participants.user', 'name email')
        .populate('bracket.rounds.matches.player1', 'name email')
        .populate('bracket.rounds.matches.player2', 'name email')
        .populate('bracket.rounds.matches.winner', 'name email')
        .populate('leaderboard.user', 'name email')

      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      return { success: true, tournament }
    } catch (error) {
      console.error('Error fetching tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Register user for tournament
  async registerUser(tournamentId, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      const canRegister = tournament.canUserRegister(userId)
      if (!canRegister.canRegister) {
        return { success: false, error: canRegister.reason }
      }

      await tournament.registerUser(userId)
      await tournament.populate('participants.user', 'name email')

      return { success: true, tournament, message: 'Successfully registered for tournament' }
    } catch (error) {
      console.error('Error registering for tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Unregister user from tournament
  async unregisterUser(tournamentId, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      if (tournament.status !== 'registration') {
        return { success: false, error: 'Cannot unregister after registration period' }
      }

      const participantIndex = tournament.participants.findIndex(
        p => p.user.toString() === userId.toString()
      )

      if (participantIndex === -1) {
        return { success: false, error: 'User not registered for this tournament' }
      }

      tournament.participants.splice(participantIndex, 1)
      await tournament.save()

      return { success: true, message: 'Successfully unregistered from tournament' }
    } catch (error) {
      console.error('Error unregistering from tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Start tournament (generate bracket)
  async startTournament(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      if (tournament.status !== 'registration') {
        return { success: false, error: 'Tournament must be in registration status to start' }
      }

      if (tournament.participants.length < 2) {
        return { success: false, error: 'Need at least 2 participants to start tournament' }
      }

      // Generate bracket
      await tournament.generateBracket()
      tournament.status = 'active'
      tournament.schedule.tournamentStart = new Date()
      
      await tournament.save()
      await tournament.populate('bracket.rounds.matches.player1', 'name email')
      await tournament.populate('bracket.rounds.matches.player2', 'name email')

      return { success: true, tournament, message: 'Tournament started successfully' }
    } catch (error) {
      console.error('Error starting tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Submit match result
  async submitMatchResult(tournamentId, matchId, gameResults) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      if (tournament.status !== 'active') {
        return { success: false, error: 'Tournament is not active' }
      }

      // Find the match
      let match = null
      let round = null
      
      for (const r of tournament.bracket.rounds) {
        const m = r.matches.find(match => match.matchId === matchId)
        if (m) {
          match = m
          round = r
          break
        }
      }

      if (!match) {
        return { success: false, error: 'Match not found' }
      }

      if (match.status === 'completed') {
        return { success: false, error: 'Match already completed' }
      }

      // Determine winner based on game results
      let winner = null
      let bestScore = -1
      let bestTime = Infinity

      match.gameResults = gameResults
      match.startTime = match.startTime || new Date()
      match.endTime = new Date()

      for (const result of gameResults) {
        if (result.completed) {
          if (result.score > bestScore || 
              (result.score === bestScore && result.timeElapsed < bestTime)) {
            winner = result.player
            bestScore = result.score
            bestTime = result.timeElapsed
          }
        }
      }

      // If no one completed, winner is the one with highest score
      if (!winner) {
        for (const result of gameResults) {
          if (result.score > bestScore) {
            winner = result.player
            bestScore = result.score
          }
        }
      }

      if (!winner) {
        return { success: false, error: 'Cannot determine winner' }
      }

      // Update match and advance winner
      await tournament.advanceWinner(matchId, winner)

      // Update participant stats
      for (const result of gameResults) {
        const participant = tournament.participants.find(
          p => p.user.toString() === result.player.toString()
        )
        if (participant) {
          participant.stats.gamesPlayed += 1
          if (result.player.toString() === winner.toString()) {
            participant.stats.gamesWon += 1
          }
          participant.stats.totalScore += result.score
          
          // Update average time
          const totalTime = participant.stats.averageTime * (participant.stats.gamesPlayed - 1) + result.timeElapsed
          participant.stats.averageTime = Math.round(totalTime / participant.stats.gamesPlayed)
          
          // Update best time
          if (!participant.stats.bestTime || result.timeElapsed < participant.stats.bestTime) {
            participant.stats.bestTime = result.timeElapsed
          }
        }
      }

      // Update tournament statistics
      tournament.statistics.completedMatches += 1
      tournament.statistics.totalMatches = tournament.bracket.rounds.reduce(
        (total, round) => total + round.matches.length, 0
      )

      // Update leaderboard
      await tournament.updateLeaderboard()

      // Check if tournament is complete
      const finalRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1]
      const finalMatch = finalRound.matches[0]
      
      if (finalMatch && finalMatch.status === 'completed') {
        tournament.status = 'completed'
        tournament.schedule.tournamentEnd = new Date()
        
        // Update winner's participant status
        const winnerParticipant = tournament.participants.find(
          p => p.user.toString() === finalMatch.winner.toString()
        )
        if (winnerParticipant) {
          winnerParticipant.status = 'winner'
        }
      }

      await tournament.save()
      
      return { 
        success: true, 
        tournament, 
        winner,
        tournamentComplete: tournament.status === 'completed',
        message: 'Match result submitted successfully' 
      }
    } catch (error) {
      console.error('Error submitting match result:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user's tournaments
  async getUserTournaments(userId) {
    try {
      const tournaments = await Tournament.find({
        'participants.user': userId
      })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })

      return { success: true, tournaments }
    } catch (error) {
      console.error('Error fetching user tournaments:', error)
      return { success: false, error: error.message }
    }
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      const stats = {
        basic: {
          participantCount: tournament.participants.length,
          totalMatches: tournament.statistics.totalMatches,
          completedMatches: tournament.statistics.completedMatches,
          averageMatchTime: tournament.statistics.averageMatchTime,
          status: tournament.status
        },
        participants: {
          registeredCount: tournament.participants.filter(p => p.status === 'registered').length,
          activeCount: tournament.participants.filter(p => p.status === 'active').length,
          eliminatedCount: tournament.participants.filter(p => p.status === 'eliminated').length,
          winnerCount: tournament.participants.filter(p => p.status === 'winner').length
        },
        performance: {
          highestScore: tournament.statistics.highestScore,
          fastestCompletion: tournament.statistics.fastestCompletion,
          averageScore: tournament.participants.reduce((sum, p) => 
            sum + (p.stats.totalScore / Math.max(p.stats.gamesPlayed, 1)), 0
          ) / Math.max(tournament.participants.length, 1)
        },
        leaderboard: tournament.leaderboard.slice(0, 10) // Top 10
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Error fetching tournament stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Update tournament settings
  async updateTournament(tournamentId, updates, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      // Check if user is organizer
      if (tournament.organizer.toString() !== userId.toString()) {
        return { success: false, error: 'Only organizer can update tournament' }
      }

      // Prevent updates after tournament starts
      if (tournament.status === 'active' || tournament.status === 'completed') {
        return { success: false, error: 'Cannot update active or completed tournament' }
      }

      // Update allowed fields
      const allowedUpdates = [
        'name', 'description', 'gameMode', 'boardSize', 'timeLimit',
        'maxParticipants', 'entryFee', 'prizePool', 'schedule', 'rules', 'settings'
      ]

      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          tournament[field] = updates[field]
        }
      }

      await tournament.save()
      return { success: true, tournament, message: 'Tournament updated successfully' }
    } catch (error) {
      console.error('Error updating tournament:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete tournament
  async deleteTournament(tournamentId, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }

      // Check if user is organizer
      if (tournament.organizer.toString() !== userId.toString()) {
        return { success: false, error: 'Only organizer can delete tournament' }
      }

      // Can only delete if not started
      if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
        return { success: false, error: 'Cannot delete active or completed tournament' }
      }

      await Tournament.findByIdAndDelete(tournamentId)
      return { success: true, message: 'Tournament deleted successfully' }
    } catch (error) {
      console.error('Error deleting tournament:', error)
      return { success: false, error: error.message }
    }
  }
}

export default TournamentService