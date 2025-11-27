import express from 'express'
import EmailService from '../services/emailService.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const router = express.Router()
const emailService = new EmailService()

// Send password reset email
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    // Set reset token and expiration (1 hour)
    user.passwordResetToken = resetTokenHash
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.name,
      user.email,
      resetToken
    )

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      })
    } else {
      console.error('Failed to send password reset email:', emailResult.error)
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      })
    }
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, email, and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password and clear reset fields
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Send game invitation email
router.post('/game-invite', verifyToken, async (req, res) => {
  try {
    const { toUserId, gameMode, gameUrl } = req.body

    if (!toUserId || !gameMode || !gameUrl) {
      return res.status(400).json({
        success: false,
        message: 'Recipient user ID, game mode, and game URL are required'
      })
    }

    // Get sender user
    const fromUser = await User.findById(req.user.id)
    if (!fromUser) {
      return res.status(404).json({
        success: false,
        message: 'Sender user not found'
      })
    }

    // Get recipient user
    const toUser = await User.findById(toUserId)
    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      })
    }

    // Check if recipient wants to receive email notifications
    if (!toUser.notificationSettings || !toUser.notificationSettings.emailGameInvites) {
      return res.json({
        success: true,
        message: 'Game invitation sent (email notifications disabled for recipient)'
      })
    }

    // Send game invitation email
    const emailResult = await emailService.sendGameInviteEmail(
      fromUser.name,
      toUser.name,
      toUser.email,
      gameMode,
      gameUrl
    )

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Game invitation email sent successfully'
      })
    } else {
      console.error('Failed to send game invitation email:', emailResult.error)
      res.status(500).json({
        success: false,
        message: 'Failed to send game invitation email'
      })
    }
  } catch (error) {
    console.error('Game invite error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Send welcome email (for manual trigger or admin use)
router.post('/welcome', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body

    // If no userId provided, use current user
    const targetUserId = userId || req.user.id

    const user = await User.findById(targetUserId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Send welcome email
    const emailResult = await emailService.sendWelcomeEmail(user.name, user.email)

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      })
    } else {
      console.error('Failed to send welcome email:', emailResult.error)
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email'
      })
    }
  } catch (error) {
    console.error('Welcome email error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Send achievement notification email
router.post('/achievement', verifyToken, async (req, res) => {
  try {
    const { achievementId } = req.body

    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Achievement ID is required'
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if user wants to receive achievement emails
    if (!user.notificationSettings || !user.notificationSettings.emailAchievements) {
      return res.json({
        success: true,
        message: 'Achievement notification skipped (email notifications disabled)'
      })
    }

    // Find the achievement in user's achievements
    const achievement = user.achievements.find(a => a.name === achievementId || a.id === achievementId)
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found for user'
      })
    }

    // Send achievement notification email
    const emailResult = await emailService.sendAchievementNotificationEmail(
      user.name,
      user.email,
      achievement
    )

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Achievement notification email sent successfully'
      })
    } else {
      console.error('Failed to send achievement email:', emailResult.error)
      res.status(500).json({
        success: false,
        message: 'Failed to send achievement notification email'
      })
    }
  } catch (error) {
    console.error('Achievement email error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Update user email notification preferences
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const { emailAchievements, emailGameInvites, emailWeeklyDigest } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update notification settings
    if (!user.notificationSettings) {
      user.notificationSettings = {}
    }

    if (typeof emailAchievements === 'boolean') {
      user.notificationSettings.emailAchievements = emailAchievements
    }
    if (typeof emailGameInvites === 'boolean') {
      user.notificationSettings.emailGameInvites = emailGameInvites
    }
    if (typeof emailWeeklyDigest === 'boolean') {
      user.notificationSettings.emailWeeklyDigest = emailWeeklyDigest
    }

    await user.save()

    res.json({
      success: true,
      message: 'Email notification preferences updated',
      preferences: user.notificationSettings
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// Get user email notification preferences
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const defaultPreferences = {
      emailAchievements: true,
      emailGameInvites: true,
      emailWeeklyDigest: false
    }

    const preferences = {
      ...defaultPreferences,
      ...user.notificationSettings
    }

    res.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Get preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
