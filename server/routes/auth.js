import express from 'express'
import { signup, login, refreshToken, logout, getCurrentUser, updateProfile, changePassword, uploadAvatar, upload } from '../controllers/authController.js'
import { authRequired } from '../middleware/auth.js'
import { rateLimit } from 'express-rate-limit'

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { 
    success: false,
    message: 'Too many authentication attempts. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Public routes
router.post('/signup', authLimiter, signup)
router.post('/login', authLimiter, login)
router.post('/refresh', refreshToken)

// Protected routes
router.post('/logout', authRequired, logout)
router.get('/me', authRequired, getCurrentUser)
router.put('/profile', authRequired, updateProfile)
router.put('/change-password', authRequired, changePassword)
router.post('/upload-avatar', authRequired, upload.single('avatar'), uploadAvatar)

export default router
