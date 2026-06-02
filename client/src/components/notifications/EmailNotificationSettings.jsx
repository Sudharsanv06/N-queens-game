import React, { useState, useEffect } from 'react'
import { Mail, Bell, Save, User, Settings } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const EmailNotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailAchievements: true,
    emailGameInvites: true,
    emailWeeklyDigest: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get(`${API_URL}/api/emails/preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setSettings(response.data.preferences)
      } else {
        throw new Error(response.data.message || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.put(`${API_URL}/api/emails/preferences`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Email preferences saved successfully!', {
          style: {
            background: 'rgba(34, 197, 94, 0.95)',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.6)',
            backdropFilter: 'blur(10px)'
          }
        })
      } else {
        throw new Error(response.data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      toast.error('Failed to save email preferences', {
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.6)',
          backdropFilter: 'blur(10px)'
        }
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  if (loading) {
    return (
      <div className="email-settings-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="email-settings-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error loading email settings</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={fetchSettings}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="email-settings-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
            <Mail className="w-10 h-10 text-blue-600" />
            <span>Email Notifications</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Customize when and how you receive email notifications from N-Queens Game
          </p>
        </div>

        {/* Settings Card */}
        <div className="settings-card bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="settings-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Notification Preferences</span>
            </h2>
            <p className="text-blue-100 mt-2">
              Choose which email notifications you'd like to receive
            </p>
          </div>

          <div className="settings-content p-6 space-y-6">
            {/* Achievement Notifications */}
            <div className="setting-item flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="setting-info flex items-start space-x-4">
                <div className="setting-icon p-2 bg-yellow-100 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Achievement Notifications</h3>
                  <p className="text-gray-600 text-sm">
                    Get notified when you unlock new achievements and earn rewards
                  </p>
                </div>
              </div>
              <label className="setting-toggle relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAchievements}
                  onChange={(e) => handleSettingChange('emailAchievements', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Game Invite Notifications */}
            <div className="setting-item flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="setting-info flex items-start space-x-4">
                <div className="setting-icon p-2 bg-green-100 rounded-lg">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Game Invitations</h3>
                  <p className="text-gray-600 text-sm">
                    Receive emails when friends invite you to play multiplayer games
                  </p>
                </div>
              </div>
              <label className="setting-toggle relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailGameInvites}
                  onChange={(e) => handleSettingChange('emailGameInvites', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Weekly Digest */}
            <div className="setting-item flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="setting-info flex items-start space-x-4">
                <div className="setting-icon p-2 bg-purple-100 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Weekly Digest</h3>
                  <p className="text-gray-600 text-sm">
                    Receive a weekly summary of your progress and community highlights
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
              <label className="setting-toggle relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={settings.emailWeeklyDigest}
                  onChange={(e) => handleSettingChange('emailWeeklyDigest', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-footer bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Changes are saved immediately and will take effect for future notifications
              </p>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="save-button bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="info-box mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">📧 About Email Notifications</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• All emails are sent from our official N-Queens Game address</li>
            <li>• You can unsubscribe from any email type at any time</li>
            <li>• We never share your email address with third parties</li>
            <li>• Important account security emails cannot be disabled</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EmailNotificationSettings