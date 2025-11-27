import Notification from '../models/Notification.js'
import PushSubscription from '../models/PushSubscription.js'
import webpush from 'web-push'

// Configure web push (VAPID keys should be in environment variables)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// Register push subscription
export const registerPushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body
    
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid subscription data' 
      })
    }
    
    const userAgent = req.headers['user-agent']
    
    await PushSubscription.addOrUpdate(
      req.user._id,
      subscription,
      userAgent
    )
    
    res.json({
      success: true,
      message: 'Push subscription registered'
    })
  } catch (error) {
    console.error('Register push subscription error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register push subscription',
      error: error.message 
    })
  }
}

// Unregister push subscription
export const unregisterPushSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body
    
    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        message: 'Endpoint is required' 
      })
    }
    
    await PushSubscription.deactivate(endpoint)
    
    res.json({
      success: true,
      message: 'Push subscription unregistered'
    })
  } catch (error) {
    console.error('Unregister push subscription error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unregister push subscription',
      error: error.message 
    })
  }
}

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query
    
    const notifications = await Notification.getUserNotifications(
      req.user._id,
      {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === 'true'
      }
    )
    
    const unreadCount = await Notification.getUnreadCount(req.user._id)
    
    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notifications',
      error: error.message 
    })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user._id
    })
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }
    
    await notification.markAsRead()
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read',
      error: error.message 
    })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id)
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read',
      error: error.message 
    })
  }
}

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id)
    
    res.json({
      success: true,
      count
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get unread count',
      error: error.message 
    })
  }
}

// Send push notification (internal function)
export const sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.getUserSubscriptions(userId)
    
    if (subscriptions.length === 0) {
      console.log('No active subscriptions for user:', userId)
      return
    }
    
    const notificationPayload = JSON.stringify(payload)
    
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          notificationPayload
        )
        
        // Update last used
        sub.lastUsed = new Date()
        await sub.save()
        
        console.log('Push notification sent successfully')
      } catch (error) {
        console.error('Failed to send push notification:', error)
        
        // If subscription is invalid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.deactivate(sub.endpoint)
        }
      }
    })
    
    await Promise.all(sendPromises)
  } catch (error) {
    console.error('Send push notification error:', error)
  }
}

// Get VAPID public key
export const getVapidPublicKey = async (req, res) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'VAPID public key not configured' 
      })
    }
    
    res.json({
      success: true,
      publicKey: process.env.VAPID_PUBLIC_KEY
    })
  } catch (error) {
    console.error('Get VAPID public key error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get VAPID public key',
      error: error.message 
    })
  }
}
