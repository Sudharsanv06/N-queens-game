import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementById,
  checkUserAchievements,
  markNotificationShown,
  getUnshownNotifications,
  getAchievementStats,
  createAchievement,
  updateAchievement,
  deleteAchievement
} from '../controllers/achievementController.js'

const router = express.Router()

// Public routes
router.get('/', getAllAchievements)

// Protected routes
router.use(protect)

router.get('/user', getUserAchievements)
router.get('/user/stats', getAchievementStats)
router.get('/user/check', checkUserAchievements)
router.get('/notifications', getUnshownNotifications)
router.put('/notifications/:achievementId', markNotificationShown)
router.get('/:achievementId', getAchievementById)

// Admin routes (add admin middleware as needed)
router.post('/', createAchievement)
router.put('/:achievementId', updateAchievement)
router.delete('/:achievementId', deleteAchievement)

export default router
