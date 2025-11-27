import express from 'express'
import SocialService from '../services/socialService.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
const socialService = new SocialService()

// Friend System Routes
router.post('/friends/request', verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body
    if (!recipientId) {
      return res.status(400).json({ success: false, error: 'Recipient ID required' })
    }

    const result = await socialService.sendFriendRequest(req.user.id, recipientId)
    
    if (result.success) {
      res.json({ success: true, friendship: result.friendship, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.put('/friends/:id/respond', verifyToken, async (req, res) => {
  try {
    const { action } = req.body // 'accepted' or 'declined'
    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' })
    }

    const result = await socialService.respondToFriendRequest(req.params.id, req.user.id, action)
    
    if (result.success) {
      res.json({ success: true, friendship: result.friendship, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/friends', verifyToken, async (req, res) => {
  try {
    const result = await socialService.getFriends(req.user.id)
    
    if (result.success) {
      res.json({ success: true, friends: result.friends })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/friends/requests', verifyToken, async (req, res) => {
  try {
    const result = await socialService.getPendingRequests(req.user.id)
    
    if (result.success) {
      res.json({ success: true, requests: result.requests })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// User Search Route
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' })
    }

    const result = await socialService.searchUsers(req.user.id, q.trim())
    
    if (result.success) {
      res.json({ success: true, users: result.users })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Game Replay Routes
router.post('/replays', verifyToken, async (req, res) => {
  try {
    const { gameData, metadata } = req.body
    if (!gameData) {
      return res.status(400).json({ success: false, error: 'Game data required' })
    }

    const result = await socialService.saveGameReplay(req.user.id, gameData, metadata || {})
    
    if (result.success) {
      res.status(201).json({ success: true, replay: result.replay, message: result.message })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/replays', async (req, res) => {
  try {
    const filters = {
      boardSize: req.query.boardSize ? parseInt(req.query.boardSize) : undefined,
      mode: req.query.mode,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    }

    const result = await socialService.getPublicReplays(filters)
    
    if (result.success) {
      res.json({ success: true, replays: result.replays })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/replays/my', verifyToken, async (req, res) => {
  try {
    const result = await socialService.getUserReplays(req.user.id)
    
    if (result.success) {
      res.json({ success: true, replays: result.replays })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/replays/:id/like', verifyToken, async (req, res) => {
  try {
    const result = await socialService.likeReplay(req.params.id, req.user.id)
    
    if (result.success) {
      res.json({ success: true, liked: result.liked, likeCount: result.likeCount })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/replays/:id/share', async (req, res) => {
  try {
    const { platform } = req.body
    const result = await socialService.shareReplay(req.params.id, platform)
    
    if (result.success) {
      res.json({ success: true, shares: result.shares })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Social Stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const result = await socialService.getSocialStats(req.user.id)
    
    if (result.success) {
      res.json({ success: true, stats: result.stats })
    } else {
      res.status(400).json({ success: false, error: result.error })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router