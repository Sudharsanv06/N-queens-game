import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getUserXP,
  getXPLeaderboard,
  getUserProgress,
  getAllNotifications,
  markAllNotificationsShown,
  getRewardHistory
} from '../controllers/rewardController.js'

const router = express.Router()

// All routes are protected
router.use(protect)

router.get('/xp', getUserXP)
router.get('/xp/leaderboard', getXPLeaderboard)
router.get('/progress', getUserProgress)
router.get('/notifications', getAllNotifications)
router.put('/notifications/mark-all', markAllNotificationsShown)
router.get('/history', getRewardHistory)

export default router
