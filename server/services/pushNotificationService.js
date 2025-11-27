import webpush from 'web-push'
import User from '../models/User.js'

// Initialize web push with VAPID keys
const initializePushService = () => {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.NOTIFICATION_EMAIL || 'mailto:support@nqueensgame.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
  } else {
    console.warn('VAPID keys not configured. Push notifications will be disabled.')
  }
}

// Initialize on import
initializePushService()

export class PushNotificationService {
  
  // Subscribe a user to push notifications
  static async subscribeUser(userId, subscription) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Add or update subscription
      const existingSubscription = user.pushSubscriptions.find(
        sub => sub.endpoint === subscription.endpoint
      )

      if (existingSubscription) {
        // Update existing subscription
        existingSubscription.keys = subscription.keys
        existingSubscription.lastUsed = new Date()
      } else {
        // Add new subscription
        user.pushSubscriptions.push({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          createdAt: new Date(),
          lastUsed: new Date()
        })
      }

      await user.save()
      return { success: true, message: 'Subscription saved successfully' }
    } catch (error) {
      console.error('Error subscribing user:', error)
      throw error
    }
  }

  // Unsubscribe a user from push notifications
  static async unsubscribeUser(userId, endpoint) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      )

      await user.save()
      return { success: true, message: 'Unsubscribed successfully' }
    } catch (error) {
      console.error('Error unsubscribing user:', error)
      throw error
    }
  }

  // Send notification to a specific user
  static async sendToUser(userId, payload) {
    try {
      if (!process.env.VAPID_PUBLIC_KEY) {
        console.warn('Push notifications not configured')
        return { success: false, message: 'Push notifications not configured' }
      }

      const user = await User.findById(userId)
      if (!user || !user.pushSubscriptions.length) {
        return { success: false, message: 'No active subscriptions for user' }
      }

      const results = []
      
      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            JSON.stringify(payload)
          )
          
          // Update last used timestamp
          subscription.lastUsed = new Date()
          results.push({ success: true, endpoint: subscription.endpoint })
        } catch (error) {
          console.error('Failed to send to subscription:', error)
          
          // Remove invalid subscriptions (410 = Gone)
          if (error.statusCode === 410) {
            user.pushSubscriptions = user.pushSubscriptions.filter(
              sub => sub.endpoint !== subscription.endpoint
            )
          }
          
          results.push({ success: false, endpoint: subscription.endpoint, error: error.message })
        }
      }

      await user.save()
      return { success: true, results }
    } catch (error) {
      console.error('Error sending notification to user:', error)
      throw error
    }
  }

  // Send notification to multiple users
  static async sendToUsers(userIds, payload) {
    const results = []
    
    for (const userId of userIds) {
      try {
        const result = await this.sendToUser(userId, payload)
        results.push({ userId, ...result })
      } catch (error) {
        results.push({ userId, success: false, error: error.message })
      }
    }
    
    return results
  }

  // Send daily challenge notification
  static async sendDailyChallengeNotification() {
    try {
      const users = await User.find({ 
        'preferences.dailyChallengeNotifications': true,
        pushSubscriptions: { $exists: true, $not: { $size: 0 } }
      })

      const payload = {
        title: '🏆 New Daily Challenge Available!',
        body: 'Test your N-Queens skills with today\'s challenge. Solve it to maintain your streak!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          type: 'daily-challenge',
          url: '/daily-challenge',
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'play',
            title: 'Play Now'
          },
          {
            action: 'dismiss',
            title: 'Later'
          }
        ]
      }

      const userIds = users.map(user => user._id)
      const results = await this.sendToUsers(userIds, payload)
      
      console.log(`Daily challenge notification sent to ${userIds.length} users`)
      return results
    } catch (error) {
      console.error('Error sending daily challenge notification:', error)
      throw error
    }
  }

  // Send game invitation notification
  static async sendGameInviteNotification(recipientId, inviterName, gameMode) {
    const payload = {
      title: '🎮 Game Invitation!',
      body: `${inviterName} invited you to play ${gameMode} mode`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'game-invite',
        inviterName,
        gameMode,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'accept',
          title: 'Accept'
        },
        {
          action: 'decline',
          title: 'Decline'
        }
      ]
    }

    return await this.sendToUser(recipientId, payload)
  }

  // Send achievement notification
  static async sendAchievementNotification(userId, achievement) {
    const payload = {
      title: '🏅 Achievement Unlocked!',
      body: `You earned: ${achievement.name}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'achievement',
        achievement,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Achievement'
        }
      ]
    }

    return await this.sendToUser(userId, payload)
  }

  // Clean up old subscriptions (run periodically)
  static async cleanupOldSubscriptions() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const result = await User.updateMany(
        {},
        {
          $pull: {
            pushSubscriptions: {
              lastUsed: { $lt: thirtyDaysAgo }
            }
          }
        }
      )

      console.log(`Cleaned up old push subscriptions: ${result.modifiedCount} users affected`)
      return result
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error)
      throw error
    }
  }

  // Get VAPID public key for client
  static getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY
  }
}

export default PushNotificationService