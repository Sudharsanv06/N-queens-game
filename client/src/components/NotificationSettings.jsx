import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, Settings, Check, X, TestTube } from 'lucide-react'
import toast from 'react-hot-toast'
import pushNotificationManager from '../utils/pushNotifications'

const NotificationSettings = ({ user, onUpdatePreferences }) => {
  const [notificationStatus, setNotificationStatus] = useState({
    supported: false,
    permission: 'default',
    subscribed: false,
    available: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    notifications: true,
    dailyChallengeNotifications: true,
    gameInviteNotifications: true,
    achievementNotifications: true,
    ...user?.preferences
  })

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    try {
      setIsLoading(true)
      
      // Initialize push notification service
      await pushNotificationManager.initialize()
      
      // Get current status
      const status = await pushNotificationManager.getSubscriptionStatus()
      setNotificationStatus(status)
    } catch (error) {
      console.error('Error initializing notifications:', error)
      toast.error('Failed to initialize notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true)

      // Request permission
      const permissionResult = await pushNotificationManager.requestPermission()
      
      if (!permissionResult.success) {
        toast.error(permissionResult.message)
        return
      }

      // Subscribe to notifications
      const subscribeResult = await pushNotificationManager.subscribe()
      
      if (subscribeResult.success) {
        toast.success('Notifications enabled successfully!')
        
        // Update status
        const status = await pushNotificationManager.getSubscriptionStatus()
        setNotificationStatus(status)
        
        // Update preferences
        const newPreferences = { ...preferences, notifications: true }
        setPreferences(newPreferences)
        onUpdatePreferences?.(newPreferences)
      } else {
        toast.error(subscribeResult.message)
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    try {
      setIsLoading(true)

      const result = await pushNotificationManager.unsubscribe()
      
      if (result.success) {
        toast.success('Notifications disabled')
        
        // Update status
        const status = await pushNotificationManager.getSubscriptionStatus()
        setNotificationStatus(status)
        
        // Update preferences
        const newPreferences = { ...preferences, notifications: false }
        setPreferences(newPreferences)
        onUpdatePreferences?.(newPreferences)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error disabling notifications:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    onUpdatePreferences?.(newPreferences)
  }

  const handleTestNotification = async () => {
    try {
      const result = await pushNotificationManager.sendTestNotification(
        '🧪 Test Notification',
        'This is a test notification from N-Queens Game!'
      )
      
      if (result.success) {
        toast.success('Test notification sent!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  const getPermissionStatusIcon = () => {
    switch (notificationStatus.permission) {
      case 'granted':
        return <Check className="w-4 h-4 text-green-500" />
      case 'denied':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  const getPermissionStatusText = () => {
    switch (notificationStatus.permission) {
      case 'granted':
        return 'Granted'
      case 'denied':
        return 'Denied'
      default:
        return 'Not requested'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="notification-settings bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Bell className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Notification Settings</h3>
      </div>

      {/* Support Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Browser Support</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Push Notifications:</span>
            <span className={notificationStatus.supported ? 'text-green-600' : 'text-red-600'}>
              {notificationStatus.supported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Server Configuration:</span>
            <span className={notificationStatus.available ? 'text-green-600' : 'text-orange-600'}>
              {notificationStatus.available ? 'Available' : 'Not Configured'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Permission Status:</span>
            <div className="flex items-center space-x-2">
              {getPermissionStatusIcon()}
              <span>{getPermissionStatusText()}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>Subscription Status:</span>
            <span className={notificationStatus.subscribed ? 'text-green-600' : 'text-gray-600'}>
              {notificationStatus.subscribed ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Enable/Disable Notifications */}
      {notificationStatus.supported && notificationStatus.available && (
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Push Notifications</h4>
              <p className="text-xs text-gray-500">
                Receive notifications for daily challenges, game invites, and achievements
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {process.env.NODE_ENV === 'development' && notificationStatus.subscribed && (
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center space-x-1"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Test</span>
                </button>
              )}
              <button
                onClick={notificationStatus.subscribed ? handleDisableNotifications : handleEnableNotifications}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  notificationStatus.subscribed
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  'Loading...'
                ) : notificationStatus.subscribed ? (
                  <>
                    <BellOff className="w-4 h-4 inline mr-1" />
                    Disable
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 inline mr-1" />
                    Enable
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {notificationStatus.subscribed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Daily Challenges</label>
                <p className="text-xs text-gray-500">Get notified when new daily challenges are available</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.dailyChallengeNotifications}
                onChange={(e) => handlePreferenceChange('dailyChallengeNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Game Invitations</label>
                <p className="text-xs text-gray-500">Get notified when other players invite you to games</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.gameInviteNotifications}
                onChange={(e) => handlePreferenceChange('gameInviteNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Achievements</label>
                <p className="text-xs text-gray-500">Get notified when you unlock new achievements</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.achievementNotifications}
                onChange={(e) => handlePreferenceChange('achievementNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Browser Not Supported */}
      {!notificationStatus.supported && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-sm text-orange-700">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </span>
          </div>
        </div>
      )}

      {/* Server Not Configured */}
      {notificationStatus.supported && !notificationStatus.available && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-sm text-orange-700">
              Push notifications are not configured on the server. Contact support for more information.
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default NotificationSettings