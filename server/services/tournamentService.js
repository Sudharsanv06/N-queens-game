import Tournament from '../models/Tournament.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import AchievementService from './achievementService.js'

class TournamentService {
  
  // Get all tournaments with filters
  async getTournaments(filters = {}) {
    try {
      const query = {}
      
      if (filters.status) query.status = filters.status
      if (filters.gameMode) query.gameMode = filters.gameMode
      if (filters.type) query.type = filters.type
      
      if (filters.upcoming) {
        query.status = 'upcoming'
        query['schedule.tournamentStart'] = { $gt: new Date() }
      }
      
      if (filters.registrationOpen) {
        query.status = 'registration'
        query['schedule.registrationEnd'] = { $gt: new Date() }
      }
      
      let tournaments = await Tournament.find(query)
        .populate('organizer', 'name username avatar')
        .populate('participants', 'name username avatar')
        .sort({ 'schedule.tournamentStart': 1 })
        .limit(filters.limit || 50)
      
      // Filter active tournaments
      const now = new Date()
      tournaments = tournaments.filter(t => {
        if (t.status === 'completed') return false
        if (t.status === 'upcoming' && new Date(t.schedule.tournamentStart) < now) return false
        return true
      })
      
      return { success: true, tournaments }
    } catch (error) {
      console.error('Get tournaments error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Get tournament by ID
  async getTournamentById(id) {
    try {
      const tournament = await Tournament.findById(id)
        .populate('organizer', 'name username avatar avatarColor level rating')
        .populate('participants', 'name username avatar avatarColor level rating')
        .populate('bracket.rounds.matches.player1', 'name username avatar avatarColor level rating')
        .populate('bracket.rounds.matches.player2', 'name username avatar avatarColor level rating')
        .populate('bracket.rounds.matches.winner', 'name username avatar')
        .populate('leaderboard.userId', 'name username avatar level rating')
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      return { success: true, tournament }
    } catch (error) {
      console.error('Get tournament by ID error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Create tournament
  async createTournament(data, organizerId) {
    try {
      const tournament = new Tournament({
        ...data,
        organizer: organizerId,
        status: 'registration',
        participants: [],
        bracket: {
          rounds: [],
          currentRound: 0,
          totalRounds: Math.log2(data.maxParticipants || 16)
        },
        leaderboard: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await tournament.save()
      
      return { success: true, tournament }
    } catch (error) {
      console.error('Create tournament error:', error)
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
      
      // Check if registration is open
      const now = new Date()
      if (now > tournament.schedule.registrationEnd) {
        return { success: false, error: 'Registration period has ended' }
      }
      
      if (tournament.status !== 'registration') {
        return { success: false, error: 'Tournament is not open for registration' }
      }
      
      // Check if user already registered
      if (tournament.participants.includes(userId)) {
        return { success: false, error: 'Already registered for this tournament' }
      }
      
      // Check if tournament is full
      if (tournament.participants.length >= tournament.maxParticipants) {
        return { success: false, error: 'Tournament is full' }
      }
      
      tournament.participants.push(userId)
      await tournament.save()
      
      // Send notification
      await Notification.createNotification({
        userId,
        type: 'tournament-registered',
        title: '🎯 Tournament Registration Confirmed',
        message: `You have successfully registered for ${tournament.name}`,
        data: { tournamentId: tournament._id, tournamentName: tournament.name },
        actionUrl: `/tournaments/${tournament._id}`,
        priority: 'high'
      })
      
      return { success: true, message: 'Successfully registered for tournament', tournament }
    } catch (error) {
      console.error('Register user error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Unregister from tournament
  async unregisterUser(tournamentId, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      const index = tournament.participants.indexOf(userId)
      if (index === -1) {
        return { success: false, error: 'Not registered for this tournament' }
      }
      
      tournament.participants.splice(index, 1)
      await tournament.save()
      
      return { success: true, message: 'Successfully unregistered from tournament' }
    } catch (error) {
      console.error('Unregister user error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Start tournament (generate bracket)
  async startTournament(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
        .populate('participants', 'name username avatar avatarColor level rating')
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      if (tournament.status !== 'registration') {
        return { success: false, error: 'Tournament cannot be started from current status' }
      }
      
      const now = new Date()
      if (now < tournament.schedule.tournamentStart) {
        return { success: false, error: 'Tournament cannot start before scheduled time' }
      }
      
      if (tournament.participants.length < 2) {
        return { success: false, error: 'Need at least 2 participants to start tournament' }
      }
      
      // Generate bracket
      const participants = [...tournament.participants]
      // Shuffle participants randomly
      for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]]
      }
      
      const totalRounds = Math.ceil(Math.log2(participants.length))
      const bracket = {
        rounds: [],
        currentRound: 1,
        totalRounds: totalRounds
      }
      
      // Create first round matches
      const firstRoundMatches = []
      const numByes = Math.pow(2, totalRounds) - participants.length
      
      let participantIndex = 0
      for (let i = 0; i < Math.pow(2, totalRounds - 1); i++) {
        let match = {
          matchId: `round_1_match_${i + 1}`,
          round: 1,
          status: 'scheduled',
          player1: null,
          player2: null,
          winner: null,
          score: null,
          scheduledTime: tournament.schedule.tournamentStart
        }
        
        if (participantIndex < participants.length) {
          match.player1 = participants[participantIndex++]._id
        }
        if (participantIndex < participants.length) {
          match.player2 = participants[participantIndex++]._id
        }
        
        // If it's a bye, auto-advance the player
        if (match.player1 && !match.player2) {
          match.status = 'completed'
          match.winner = match.player1
          match.score = 'Bye'
        } else if (!match.player1 && match.player2) {
          match.status = 'completed'
          match.winner = match.player2
          match.score = 'Bye'
        }
        
        if (match.player1 || match.player2) {
          firstRoundMatches.push(match)
        }
      }
      
      bracket.rounds.push({
        roundNumber: 1,
        name: 'Round of ' + firstRoundMatches.length * 2,
        matches: firstRoundMatches
      })
      
      tournament.bracket = bracket
      tournament.status = 'in-progress'
      await tournament.save()
      
      // Send notifications to all participants
      for (const participant of participants) {
        await Notification.createNotification({
          userId: participant._id,
          type: 'tournament-started',
          title: '🏆 Tournament Started!',
          message: `${tournament.name} has started. Check your bracket!`,
          data: { tournamentId: tournament._id },
          actionUrl: `/tournaments/${tournament._id}`,
          priority: 'high'
        })
      }
      
      return { success: true, message: 'Tournament started', tournament }
    } catch (error) {
      console.error('Start tournament error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Submit match result
  async submitMatchResult(tournamentId, matchId, gameResults) {
    try {
      const tournament = await Tournament.findById(tournamentId)
        .populate('participants', 'name username avatar')
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      // Find the match
      let match = null
      let roundIndex = null
      let matchIndex = null
      
      for (let i = 0; i < tournament.bracket.rounds.length; i++) {
        const round = tournament.bracket.rounds[i]
        const foundIndex = round.matches.findIndex(m => m.matchId === matchId)
        if (foundIndex !== -1) {
          match = round.matches[foundIndex]
          roundIndex = i
          matchIndex = foundIndex
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
      let player1Wins = 0
      let player2Wins = 0
      
      for (const result of gameResults) {
        if (result.winner === 'player1') player1Wins++
        else if (result.winner === 'player2') player2Wins++
      }
      
      const winner = player1Wins > player2Wins ? match.player1 : match.player2
      const score = `${player1Wins}-${player2Wins}`
      
      match.status = 'completed'
      match.winner = winner
      match.score = score
      
      await tournament.save()
      
      // Update tournament leaderboard
      await this.updateLeaderboard(tournament)
      
      // Check if tournament is complete
      const isTournamentComplete = await this.checkTournamentComplete(tournament)
      
      if (isTournamentComplete) {
        tournament.status = 'completed'
        tournament.completedAt = new Date()
        await tournament.save()
        
        // Award prizes and achievements
        await this.awardTournamentPrizes(tournament)
      } else {
        // Generate next round matches if needed
        await this.generateNextRound(tournament, roundIndex, matchIndex, winner)
      }
      
      return {
        success: true,
        message: 'Match result submitted',
        tournament,
        winner,
        tournamentComplete: isTournamentComplete
      }
    } catch (error) {
      console.error('Submit match result error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Generate next round matches
  async generateNextRound(tournament, currentRoundIndex, matchIndex, winner) {
    const nextRoundIndex = currentRoundIndex + 1
    
    // If next round doesn't exist, create it
    if (!tournament.bracket.rounds[nextRoundIndex]) {
      const totalMatches = Math.pow(2, tournament.bracket.totalRounds - nextRoundIndex - 1)
      const nextRound = {
        roundNumber: nextRoundIndex + 1,
        name: nextRoundIndex === tournament.bracket.totalRounds - 1 ? 'Finals' : `Round ${nextRoundIndex + 1}`,
        matches: []
      }
      
      for (let i = 0; i < totalMatches; i++) {
        nextRound.matches.push({
          matchId: `round_${nextRoundIndex + 1}_match_${i + 1}`,
          round: nextRoundIndex + 1,
          status: 'scheduled',
          player1: null,
          player2: null,
          winner: null,
          score: null
        })
      }
      
      tournament.bracket.rounds.push(nextRound)
    }
    
    // Place winner into next round match
    const targetMatchIndex = Math.floor(matchIndex / 2)
    const targetMatch = tournament.bracket.rounds[nextRoundIndex].matches[targetMatchIndex]
    
    if (matchIndex % 2 === 0) {
      targetMatch.player1 = winner
    } else {
      targetMatch.player2 = winner
    }
    
    // If both players are set, update match status
    if (targetMatch.player1 && targetMatch.player2) {
      targetMatch.status = 'scheduled'
    }
    
    await tournament.save()
  }
  
  // Check if tournament is complete
  async checkTournamentComplete(tournament) {
    const lastRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1]
    if (!lastRound) return false
    
    const finalMatch = lastRound.matches[0]
    return finalMatch?.status === 'completed'
  }
  
  // Update leaderboard
  async updateLeaderboard(tournament) {
    const leaderboardMap = new Map()
    
    for (const round of tournament.bracket.rounds) {
      for (const match of round.matches) {
        if (match.status === 'completed' && match.winner) {
          const winnerId = match.winner.toString()
          leaderboardMap.set(winnerId, (leaderboardMap.get(winnerId) || 0) + 1)
        }
      }
    }
    
    const leaderboard = Array.from(leaderboardMap.entries())
      .map(([userId, wins]) => ({ userId, wins }))
      .sort((a, b) => b.wins - a.wins)
    
    tournament.leaderboard = leaderboard
    await tournament.save()
  }
  
  // Award tournament prizes and achievements
  async awardTournamentPrizes(tournament) {
    const winner = tournament.leaderboard[0]?.userId
    const runnerUp = tournament.leaderboard[1]?.userId
    
    if (winner) {
      const user = await User.findById(winner)
      if (user) {
        // Award XP for tournament win
        const xpReward = tournament.prizePool?.xp || 500
        user.xp = (user.xp || 0) + xpReward
        await user.save()
        
        // Check for tournament win achievement
        await AchievementService.checkAndUnlockAchievements(winner, {
          tournamentWin: true,
          tournamentId: tournament._id
        })
        
        // Send winner notification
        await Notification.createNotification({
          userId: winner,
          type: 'tournament-won',
          title: '🏆 Tournament Champion!',
          message: `Congratulations! You won ${tournament.name} and earned ${xpReward} XP!`,
          data: { tournamentId: tournament._id, prize: xpReward },
          actionUrl: `/tournaments/${tournament._id}`,
          priority: 'high'
        })
      }
    }
    
    if (runnerUp) {
      await Notification.createNotification({
        userId: runnerUp,
        type: 'tournament-runner-up',
        title: '🥈 Tournament Runner-Up',
        message: `Great job! You finished 2nd in ${tournament.name}`,
        data: { tournamentId: tournament._id },
        actionUrl: `/tournaments/${tournament._id}`,
        priority: 'high'
      })
    }
  }
  
  // Get user's tournaments
  async getUserTournaments(userId) {
    try {
      const tournaments = await Tournament.find({
        participants: userId
      }).populate('organizer', 'name username avatar')
        .sort({ 'schedule.tournamentStart': -1 })
        .limit(20)
      
      return { success: true, tournaments }
    } catch (error) {
      console.error('Get user tournaments error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Get tournament stats
  async getTournamentStats(tournamentId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      const stats = {
        totalParticipants: tournament.participants.length,
        maxParticipants: tournament.maxParticipants,
        totalMatches: tournament.bracket.rounds.reduce((sum, r) => sum + r.matches.length, 0),
        completedMatches: tournament.bracket.rounds.reduce(
          (sum, r) => sum + r.matches.filter(m => m.status === 'completed').length, 0
        ),
        currentRound: tournament.bracket.currentRound,
        totalRounds: tournament.bracket.totalRounds,
        status: tournament.status
      }
      
      return { success: true, stats }
    } catch (error) {
      console.error('Get tournament stats error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Update tournament
  async updateTournament(tournamentId, updates, userId) {
    try {
      const tournament = await Tournament.findById(tournamentId)
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' }
      }
      
      if (tournament.organizer.toString() !== userId) {
        return { success: false, error: 'Only tournament organizer can update' }
      }
      
      Object.assign(tournament, updates)
      tournament.updatedAt = new Date()
      await tournament.save()
      
      return { success: true, message: 'Tournament updated', tournament }
    } catch (error) {
      console.error('Update tournament error:', error)
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
      
      if (tournament.organizer.toString() !== userId) {
        return { success: false, error: 'Only tournament organizer can delete' }
      }
      
      await Tournament.deleteOne({ _id: tournamentId })
      
      return { success: true, message: 'Tournament deleted' }
    } catch (error) {
      console.error('Delete tournament error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default TournamentService