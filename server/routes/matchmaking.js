import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getPlayerQueueStatus,
  getMatchmakingStats,
  clearQueue,
  findOpponent
} from '../controllers/matchmakingController.js'

const router = express.Router()

// All routes require authentication
router.use(verifyToken)

// Join matchmaking queue
router.post('/join', joinQueue)

// Leave matchmaking queue
router.post('/leave', leaveQueue)

// Get queue status (all queues or specific type)
router.get('/status', getQueueStatus)

// Get player's queue status
router.get('/player-status', getPlayerQueueStatus)

// Get matchmaking statistics
router.get('/stats', getMatchmakingStats)

// Find opponent (testing)
router.post('/find-opponent', findOpponent)

// Clear queue (admin only - add admin middleware if needed)
router.post('/clear-queue', clearQueue)

export default router
