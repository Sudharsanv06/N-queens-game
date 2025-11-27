import express from 'express'
import PuzzleService from '../services/puzzleService.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
const puzzleService = new PuzzleService()

// Create custom puzzle
router.post('/', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.createPuzzle(req.user.id, req.body)
    
    if (result.success) {
      res.status(201).json({ success: true, puzzle: result.puzzle, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get public puzzles
router.get('/', async (req, res) => {
  try {
    const filters = {
      difficulty: req.query.difficulty,
      boardSize: req.query.boardSize ? parseInt(req.query.boardSize) : undefined,
      category: req.query.category,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      skip: req.query.skip ? parseInt(req.query.skip) : 0
    }

    const result = await puzzleService.getPublicPuzzles(filters)
    
    if (result.success) {
      res.json({ success: true, puzzles: result.puzzles })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get user's puzzles
router.get('/my', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.getUserPuzzles(req.user.id)
    
    if (result.success) {
      res.json({ success: true, puzzles: result.puzzles })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get puzzle by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await puzzleService.getPuzzleById(req.params.id)
    
    if (result.success) {
      res.json({ success: true, puzzle: result.puzzle })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Update puzzle
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.updatePuzzle(req.params.id, req.body, req.user.id)
    
    if (result.success) {
      res.json({ success: true, puzzle: result.puzzle, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Publish puzzle
router.post('/:id/publish', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.publishPuzzle(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({ success: true, puzzle: result.puzzle, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Like/unlike puzzle
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.likePuzzle(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({ success: true, liked: result.liked, likeCount: result.likeCount })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Rate puzzle
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating } = req.body
    const result = await puzzleService.ratePuzzle(req.params.id, req.user.id, rating)
    
    if (result.success) {
      res.json({ success: true, rating: result.rating, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Start puzzle
router.post('/:id/start', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.startPuzzle(req.user.id, req.params.id)
    
    if (result.success) {
      res.json({ success: true, progress: result.progress, puzzle: result.puzzle })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Complete puzzle
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { gameData } = req.body
    const result = await puzzleService.completePuzzle(req.user.id, req.params.id, gameData)
    
    if (result.success) {
      res.json({ success: true, progress: result.progress, puzzle: result.puzzle, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get user progress
router.get('/progress/my', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.getUserProgress(req.user.id)
    
    if (result.success) {
      res.json({ success: true, progress: result.progress })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get puzzle statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const result = await puzzleService.getPuzzleStats(req.params.id)
    
    if (result.success) {
      res.json({ success: true, stats: result.stats })
    } else {
      res.status(404).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Collections routes
router.post('/collections', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.createCollection(req.user.id, req.body)
    
    if (result.success) {
      res.status(201).json({ success: true, collection: result.collection, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/collections', async (req, res) => {
  try {
    const filters = {
      difficulty: req.query.difficulty,
      limit: req.query.limit ? parseInt(req.query.limit) : 10
    }

    const result = await puzzleService.getCollections(filters)
    
    if (result.success) {
      res.json({ success: true, collections: result.collections })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/collections/:id/puzzles/:puzzleId', verifyToken, async (req, res) => {
  try {
    const result = await puzzleService.addPuzzleToCollection(
      req.params.id, 
      req.params.puzzleId, 
      req.user.id
    )
    
    if (result.success) {
      res.json({ success: true, collection: result.collection, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router