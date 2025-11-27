import Badge from '../models/Badge.js'
import UserBadge from '../models/UserBadge.js'

/**
 * Get all badges
 */
export const getAllBadges = async (req, res) => {
  try {
    const { tier, category } = req.query
    
    const filter = { isActive: true }
    if (tier) filter.tier = tier
    if (category) filter.category = category
    
    const badges = await Badge.find(filter).sort({ tier: 1, sortOrder: 1 })
    
    res.json({
      success: true,
      count: badges.length,
      badges
    })
    
  } catch (error) {
    console.error('Get all badges error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    })
  }
}

/**
 * Get user's badges
 */
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get all badges
    const allBadges = await Badge.find({ isActive: true }).sort({ tier: 1, sortOrder: 1 })
    
    // Get user's earned badges
    const userBadges = await UserBadge.find({ userId })
    
    // Map user badges to badge details
    const badgesWithStatus = allBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.badgeId)
      
      return {
        ...badge.toObject(),
        isEarned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
        isEquipped: userBadge?.isEquipped || false
      }
    })
    
    // Group by tier
    const grouped = {
      bronze: badgesWithStatus.filter(b => b.tier === 'bronze'),
      silver: badgesWithStatus.filter(b => b.tier === 'silver'),
      gold: badgesWithStatus.filter(b => b.tier === 'gold'),
      platinum: badgesWithStatus.filter(b => b.tier === 'platinum'),
      diamond: badgesWithStatus.filter(b => b.tier === 'diamond')
    }
    
    const earned = badgesWithStatus.filter(b => b.isEarned).length
    
    res.json({
      success: true,
      total: badgesWithStatus.length,
      earned,
      badges: badgesWithStatus,
      grouped
    })
    
  } catch (error) {
    console.error('Get user badges error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges',
      error: error.message
    })
  }
}

/**
 * Get specific badge details
 */
export const getBadgeById = async (req, res) => {
  try {
    const { badgeId } = req.params
    const userId = req.user.id
    
    const badge = await Badge.findOne({ badgeId, isActive: true })
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      })
    }
    
    const userBadge = await UserBadge.findOne({ userId, badgeId })
    
    res.json({
      success: true,
      badge: {
        ...badge.toObject(),
        isEarned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
        isEquipped: userBadge?.isEquipped || false
      }
    })
    
  } catch (error) {
    console.error('Get badge by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching badge',
      error: error.message
    })
  }
}

/**
 * Equip/unequip a badge
 */
export const equipBadge = async (req, res) => {
  try {
    const userId = req.user.id
    const { badgeId } = req.params
    const { equip } = req.body // true or false
    
    // Check if user owns this badge
    const userBadge = await UserBadge.findOne({ userId, badgeId })
    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not earned yet'
      })
    }
    
    if (equip) {
      // Unequip all other badges first (only one equipped at a time)
      await UserBadge.updateMany({ userId }, { isEquipped: false })
      userBadge.isEquipped = true
    } else {
      userBadge.isEquipped = false
    }
    
    await userBadge.save()
    
    res.json({
      success: true,
      message: equip ? 'Badge equipped successfully' : 'Badge unequipped',
      userBadge
    })
    
  } catch (error) {
    console.error('Equip badge error:', error)
    res.status(500).json({
      success: false,
      message: 'Error equipping badge',
      error: error.message
    })
  }
}

/**
 * Get equipped badge
 */
export const getEquippedBadge = async (req, res) => {
  try {
    const userId = req.user.id
    
    const userBadge = await UserBadge.findOne({ userId, isEquipped: true })
    if (!userBadge) {
      return res.json({
        success: true,
        badge: null
      })
    }
    
    const badge = await Badge.findOne({ badgeId: userBadge.badgeId })
    
    res.json({
      success: true,
      badge: badge ? {
        ...badge.toObject(),
        earnedAt: userBadge.earnedAt
      } : null
    })
    
  } catch (error) {
    console.error('Get equipped badge error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching equipped badge',
      error: error.message
    })
  }
}

/**
 * Get unshown badge notifications
 */
export const getUnshownBadgeNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    
    const unshownBadges = await UserBadge.find({
      userId,
      notificationShown: false
    }).sort({ earnedAt: -1 })
    
    const badgeIds = unshownBadges.map(ub => ub.badgeId)
    const badges = await Badge.find({ badgeId: { $in: badgeIds } })
    
    const notifications = unshownBadges.map(ub => {
      const badge = badges.find(b => b.badgeId === ub.badgeId)
      return {
        ...badge?.toObject(),
        earnedAt: ub.earnedAt
      }
    })
    
    res.json({
      success: true,
      count: notifications.length,
      notifications
    })
    
  } catch (error) {
    console.error('Get unshown badge notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching badge notifications',
      error: error.message
    })
  }
}

/**
 * Mark badge notification as shown
 */
export const markBadgeNotificationShown = async (req, res) => {
  try {
    const userId = req.user.id
    const { badgeId } = req.params
    
    await UserBadge.findOneAndUpdate(
      { userId, badgeId },
      { notificationShown: true }
    )
    
    res.json({
      success: true,
      message: 'Badge notification marked as shown'
    })
    
  } catch (error) {
    console.error('Mark badge notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking badge notification',
      error: error.message
    })
  }
}

// Admin endpoints
export const createBadge = async (req, res) => {
  try {
    const badge = new Badge(req.body)
    await badge.save()
    
    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      badge
    })
    
  } catch (error) {
    console.error('Create badge error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating badge',
      error: error.message
    })
  }
}

export const updateBadge = async (req, res) => {
  try {
    const { badgeId } = req.params
    
    const badge = await Badge.findOneAndUpdate(
      { badgeId },
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Badge updated successfully',
      badge
    })
    
  } catch (error) {
    console.error('Update badge error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating badge',
      error: error.message
    })
  }
}

export const deleteBadge = async (req, res) => {
  try {
    const { badgeId } = req.params
    
    await Badge.findOneAndUpdate(
      { badgeId },
      { isActive: false }
    )
    
    res.json({
      success: true,
      message: 'Badge deactivated successfully'
    })
    
  } catch (error) {
    console.error('Delete badge error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting badge',
      error: error.message
    })
  }
}
