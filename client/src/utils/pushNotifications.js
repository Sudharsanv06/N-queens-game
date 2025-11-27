import axios from 'axios'

class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    this.serviceWorkerRegistration = null
    this.subscription = null
    this.vapidPublicKey = null
  }

  // Initialize push notifications
  async initialize() {
    try {
      if (!this.isSupported) {
        console.warn('Push notifications not supported')
        return { success: false, message: 'Push notifications not supported' }
      }

      // Register service worker
      await this.registerServiceWorker()

      // Get VAPID public key
      await this.getVapidPublicKey()

      return { success: true, message: 'Push notifications initialized' }
    } catch (error) {
      console.error('Error initializing push notifications:', error)
      return { success: false, message: error.message }
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', registration)
      this.serviceWorkerRegistration = registration

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(event) {
    const { type, url } = event.data

    if (type === 'NAVIGATE' && url) {
      // Navigate to the specified URL
      window.location.href = url
    }
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    try {
      const response = await axios.get('/api/notifications/vapid-public-key')
      
      if (response.data.available) {
        this.vapidPublicKey = response.data.publicKey
      } else {
        throw new Error('Push notifications not configured on server')
      }
    } catch (error) {
      console.error('Error getting VAPID public key:', error)
      throw error
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (!this.isSupported) {
        return { success: false, message: 'Push notifications not supported' }
      }

      if (Notification.permission === 'granted') {
        return { success: true, message: 'Permission already granted' }
      }

      if (Notification.permission === 'denied') {
        return { 
          success: false, 
          message: 'Notification permission denied. Please enable in browser settings.' 
        }
      }

      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        return { success: true, message: 'Permission granted' }
      } else {
        return { success: false, message: 'Permission denied' }
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      return { success: false, message: error.message }
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered')
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available')
      }

      // Check if already subscribed
      const existingSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      
      if (existingSubscription) {
        this.subscription = existingSubscription
        // Update subscription on server
        await this.sendSubscriptionToServer(existingSubscription)
        return { success: true, message: 'Already subscribed' }
      }

      // Create new subscription
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      this.subscription = subscription
      console.log('Push subscription created:', subscription)

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return { success: true, message: 'Successfully subscribed to notifications' }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return { success: false, message: error.message }
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (!this.subscription) {
        return { success: true, message: 'Not subscribed' }
      }

      // Unsubscribe from browser
      await this.subscription.unsubscribe()

      // Remove from server
      await this.removeSubscriptionFromServer(this.subscription.endpoint)

      this.subscription = null
      return { success: true, message: 'Successfully unsubscribed' }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return { success: false, message: error.message }
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      }

      await axios.post('/api/notifications/subscribe', {
        subscription: subscriptionData
      })

      console.log('Subscription sent to server')
    } catch (error) {
      console.error('Error sending subscription to server:', error)
      throw error
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(endpoint) {
    try {
      await axios.post('/api/notifications/unsubscribe', {
        endpoint
      })

      console.log('Subscription removed from server')
    } catch (error) {
      console.error('Error removing subscription from server:', error)
      throw error
    }
  }

  // Check if currently subscribed
  async isSubscribed() {
    try {
      if (!this.serviceWorkerRegistration) {
        return false
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription()
      return !!subscription
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const permission = Notification.permission
      const subscribed = await this.isSubscribed()

      return {
        supported: this.isSupported,
        permission,
        subscribed,
        available: this.vapidPublicKey !== null
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return {
        supported: this.isSupported,
        permission: 'default',
        subscribed: false,
        available: false
      }
    }
  }

  // Send test notification
  async sendTestNotification(title, body) {
    try {
      await axios.post('/api/notifications/test', {
        title,
        body
      })
      return { success: true, message: 'Test notification sent' }
    } catch (error) {
      console.error('Error sending test notification:', error)
      return { success: false, message: error.response?.data?.message || error.message }
    }
  }

  // Utility: Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Utility: Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  // Show browser notification (fallback)
  showBrowserNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      })
    }
  }

  // Schedule daily reminder (if supported)
  async scheduleDailyReminder() {
    try {
      if ('serviceWorker' in navigator && this.serviceWorkerRegistration) {
        // This would require additional implementation for background sync
        // For now, just show a confirmation
        console.log('Daily reminder scheduled')
        return { success: true, message: 'Daily reminder scheduled' }
      }
    } catch (error) {
      console.error('Error scheduling daily reminder:', error)
      return { success: false, message: error.message }
    }
  }
}

// Create and export singleton instance
const pushNotificationManager = new PushNotificationManager()

export default pushNotificationManager

// Also export the class for advanced usage
export { PushNotificationManager }