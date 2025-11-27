import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
  getProfile,
  getLeaderboard,
  getMatchHistory,
  getActiveRooms,
  getRoomDetails,
  getEloPreview,
  getRankInfo,
  getStatsSummary
} from '../controllers/multiplayerController.js'

const router = express.Router()

// Public routes
router.get('/leaderboard', getLeaderboard)
router.get('/rank-info', getRankInfo)
router.get('/rooms/active', getActiveRooms)
router.get('/rooms/:roomId', getRoomDetails)

// Protected routes
router.use(verifyToken)

// User profile and stats
router.get('/profile', getProfile)
router.get('/profile/:userId', getProfile)
router.get('/stats/summary', getStatsSummary)
router.get('/match-history', getMatchHistory)
router.get('/match-history/:userId', getMatchHistory)

// ELO preview
router.get('/elo-preview', getEloPreview)

export default router
