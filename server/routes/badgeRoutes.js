import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getAllBadges,
  getUserBadges,
  getBadgeById,
  equipBadge,
  getEquippedBadge,
  getUnshownBadgeNotifications,
  markBadgeNotificationShown,
  createBadge,
  updateBadge,
  deleteBadge
} from '../controllers/badgeController.js'

const router = express.Router()

// Public routes
router.get('/', getAllBadges)

// Protected routes
router.use(protect)

router.get('/user', getUserBadges)
router.get('/user/equipped', getEquippedBadge)
router.put('/user/:badgeId/equip', equipBadge)
router.get('/notifications', getUnshownBadgeNotifications)
router.put('/notifications/:badgeId', markBadgeNotificationShown)
router.get('/:badgeId', getBadgeById)

// Admin routes
router.post('/', createBadge)
router.put('/:badgeId', updateBadge)
router.delete('/:badgeId', deleteBadge)

export default router
