import express from 'express'
import {
  getCurrentChallenge,
  getChallengeHistory,
  startChallenge,
  completeChallenge,
  getChallengeStats,
  getUserStreak,
  getStreakLeaderboard,
  generateTestChallenge
} from '../controllers/dailyChallengeController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Public/mixed routes
router.get('/current', getCurrentChallenge)
router.get('/leaderboard/streak', getStreakLeaderboard)

// Protected routes (require authentication)
router.get('/history', verifyToken, getChallengeHistory)
router.post('/start', verifyToken, startChallenge)
router.post('/complete', verifyToken, completeChallenge)
router.get('/stats', verifyToken, getChallengeStats)
router.get('/streak', verifyToken, getUserStreak)

// Admin/test routes
router.post('/generate-test', verifyToken, generateTestChallenge)

export default router
