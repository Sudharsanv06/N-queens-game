import express from 'express'
import TournamentService from '../services/tournamentService.js'
import { verifyToken } from '../middleware/auth.js'
import { trackDailyChallengeCompleted } from '../utils/analytics.js'

const router = express.Router()
const tournamentService = new TournamentService()

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      gameMode: req.query.gameMode,
      type: req.query.type,
      upcoming: req.query.upcoming === 'true',
      registrationOpen: req.query.registrationOpen === 'true',
      limit: parseInt(req.query.limit) || 50
    }

    const result = await tournamentService.getTournaments(filters)
    
    if (result.success) {
      res.json({
        success: true,
        tournaments: result.tournaments,
        count: result.tournaments.length
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await tournamentService.getTournamentById(req.params.id)
    
    if (result.success) {
      res.json({ success: true, tournament: result.tournament })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments/:id:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Create new tournament
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      type = 'single-elimination',
      gameMode = 'classic',
      boardSize = 8,
      timeLimit = 300,
      maxParticipants = 16,
      entryFee = 0,
      prizePool,
      schedule,
      rules,
      settings
    } = req.body

    // Validate required fields
    if (!name || !schedule) {
      return res.status(400).json({
        success: false,
        error: 'Name and schedule are required'
      })
    }

    // Validate schedule dates
    const now = new Date()
    const regStart = new Date(schedule.registrationStart)
    const regEnd = new Date(schedule.registrationEnd)
    const tournStart = new Date(schedule.tournamentStart)

    if (regStart < now) {
      return res.status(400).json({
        success: false,
        error: 'Registration start time must be in the future'
      })
    }

    if (regEnd <= regStart) {
      return res.status(400).json({
        success: false,
        error: 'Registration end time must be after start time'
      })
    }

    if (tournStart <= regEnd) {
      return res.status(400).json({
        success: false,
        error: 'Tournament start time must be after registration end'
      })
    }

    const tournamentData = {
      name,
      description,
      type,
      gameMode,
      boardSize,
      timeLimit,
      maxParticipants,
      entryFee,
      prizePool,
      schedule,
      rules,
      settings
    }

    const result = await tournamentService.createTournament(tournamentData, req.user.id)
    
    if (result.success) {
      res.status(201).json({
        success: true,
        tournament: result.tournament,
        message: 'Tournament created successfully'
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in POST /tournaments:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Register for tournament
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const result = await tournamentService.registerUser(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        tournament: result.tournament
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in POST /tournaments/:id/register:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Unregister from tournament
router.delete('/:id/register', verifyToken, async (req, res) => {
  try {
    const result = await tournamentService.unregisterUser(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({ success: true, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in DELETE /tournaments/:id/register:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Start tournament (organizer only)
router.post('/:id/start', verifyToken, async (req, res) => {
  try {
    // Check if user is tournament organizer
    const tournamentResult = await tournamentService.getTournamentById(req.params.id)
    if (!tournamentResult.success) {
      return res.status(404).json({ success: false, error: 'Tournament not found' })
    }

    if (tournamentResult.tournament.organizer._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only tournament organizer can start tournament' 
      })
    }

    const result = await tournamentService.startTournament(req.params.id)
    
    if (result.success) {
      res.json({
        success: true,
        tournament: result.tournament,
        message: result.message
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in POST /tournaments/:id/start:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Submit match result
router.post('/:id/matches/:matchId/result', verifyToken, async (req, res) => {
  try {
    const { gameResults } = req.body

    if (!gameResults || !Array.isArray(gameResults)) {
      return res.status(400).json({
        success: false,
        error: 'Game results are required and must be an array'
      })
    }

    // Validate that user is one of the match participants
    const tournamentResult = await tournamentService.getTournamentById(req.params.id)
    if (!tournamentResult.success) {
      return res.status(404).json({ success: false, error: 'Tournament not found' })
    }

    const tournament = tournamentResult.tournament
    let match = null

    for (const round of tournament.bracket.rounds) {
      const foundMatch = round.matches.find(m => m.matchId === req.params.matchId)
      if (foundMatch) {
        match = foundMatch
        break
      }
    }

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found' })
    }

    // Check if user is participant in this match
    const isParticipant = match.player1?._id.toString() === req.user.id || 
                         match.player2?._id.toString() === req.user.id

    if (!isParticipant && tournament.organizer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only match participants or tournament organizer can submit results'
      })
    }

    const result = await tournamentService.submitMatchResult(
      req.params.id,
      req.params.matchId,
      gameResults
    )
    
    if (result.success) {
      res.json({
        success: true,
        tournament: result.tournament,
        winner: result.winner,
        tournamentComplete: result.tournamentComplete,
        message: result.message
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in POST /tournaments/:id/matches/:matchId/result:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get user's tournaments
router.get('/user/my', verifyToken, async (req, res) => {
  try {
    const result = await tournamentService.getUserTournaments(req.user.id)
    
    if (result.success) {
      res.json({ success: true, tournaments: result.tournaments })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments/user/my:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get tournament statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const result = await tournamentService.getTournamentStats(req.params.id)
    
    if (result.success) {
      res.json({ success: true, stats: result.stats })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments/:id/stats:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Update tournament (organizer only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const result = await tournamentService.updateTournament(
      req.params.id,
      req.body,
      req.user.id
    )
    
    if (result.success) {
      res.json({
        success: true,
        tournament: result.tournament,
        message: result.message
      })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in PUT /tournaments/:id:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Delete tournament (organizer only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await tournamentService.deleteTournament(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({ success: true, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in DELETE /tournaments/:id:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get tournament bracket
router.get('/:id/bracket', async (req, res) => {
  try {
    const result = await tournamentService.getTournamentById(req.params.id)
    
    if (result.success) {
      res.json({
        success: true,
        bracket: result.tournament.bracket,
        status: result.tournament.status
      })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments/:id/bracket:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get tournament leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const result = await tournamentService.getTournamentById(req.params.id)
    
    if (result.success) {
      res.json({
        success: true,
        leaderboard: result.tournament.leaderboard,
        participantCount: result.tournament.participants.length
      })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Error in GET /tournaments/:id/leaderboard:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router