import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function usePushNotifications() {
  const { token, user } = useSelector(state => state.auth)
  const [permission, setPermission] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if browser supports push notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  // Check if already subscribed
  useEffect(() => {
    if (token && supported && permission === 'granted') {
      checkExistingSubscription()
    }
  }, [token, supported, permission])

  const checkExistingSubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.subscribed) {
        setSubscription(true)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  // Request permission and subscribe
  const requestPermission = async () => {
    if (!supported) {
      console.warn('Push notifications not supported')
      return false
    }

    if (permission === 'denied') {
      console.warn('Notification permission denied')
      return false
    }

    setLoading(true)
    try {
      let result = permission
      if (permission !== 'granted') {
        result = await Notification.requestPermission()
        setPermission(result)
      }
      
      if (result === 'granted') {
        await registerServiceWorker()
        return true
      }
      return false
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Register service worker and subscribe to push
  const registerServiceWorker = async () => {
    if (!token) return false

    try {
      // Get existing registration
      let registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js')
      }

      // Get VAPID public key from server
      const vapidResponse = await axios.get(`${API_URL}/api/notifications/vapid-public-key`)
      const applicationServerKey = vapidResponse.data.publicKey

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      // Send subscription to server
      await axios.post(`${API_URL}/api/notifications/subscribe`, {
        subscription: subscription.toJSON()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSubscription(true)
      return true
    } catch (error) {
      console.error('Error subscribing to push:', error)
      return false
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) return

    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
        }
      }
      
      await axios.delete(`${API_URL}/api/notifications/subscribe`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSubscription(false)
    } catch (error) {
      console.error('Error unsubscribing:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get notification settings
  const getSettings = async () => {
    if (!token) return null
    
    try {
      const response = await axios.get(`${API_URL}/api/notifications/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.settings
    } catch (error) {
      console.error('Error getting settings:', error)
      return null
    }
  }

  // Update notification settings
  const updateSettings = async (settings) => {
    if (!token) return false
    
    try {
      await axios.put(`${API_URL}/api/notifications/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return true
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    if (!token) return false
    
    try {
      await axios.post(`${API_URL}/api/notifications/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return true
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }

  return {
    supported,
    permission,
    subscription,
    loading,
    requestPermission,
    unsubscribe,
    getSettings,
    updateSettings,
    sendTestNotification
  }
}

export default usePushNotifications