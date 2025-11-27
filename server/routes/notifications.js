import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
  registerPushSubscription,
  unregisterPushSubscription,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getVapidPublicKey
} from '../controllers/notificationController.js'

const router = express.Router()

// All notification routes require authentication
router.use(verifyToken)

// Push subscription routes
router.post('/push/register', registerPushSubscription)
router.post('/push/unregister', unregisterPushSubscription)
router.get('/push/vapid-public-key', getVapidPublicKey)

// Notification routes
router.get('/list', getNotifications)
router.get('/unread-count', getUnreadCount)
router.post('/:notificationId/read', markAsRead)
router.post('/read-all', markAllAsRead)

export default router