import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Bell, BellOff, Calendar, Users, Award, Gamepad2, Volume2, VolumeX, Shield, Save } from 'lucide-react'
import usePushNotifications from '../hooks/usePushNotifications'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Settings() {
  const { token, user } = useSelector(state => state.auth)
  const { supported, permission, requestPermission, getSettings, updateSettings, sendTestNotification } = usePushNotifications()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      dailyChallenge: true,
      multiplayerInvite: true,
      achievementUnlock: true,
      tournamentUpdate: true,
      friendRequest: true
    },
    sound: {
      enabled: true,
      volume: 0.7
    },
    privacy: {
      showOnLeaderboard: true,
      shareStats: true
    }
  })

  useEffect(() => {
    if (token) {
      loadSettings()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }))
      }
      
      const notificationSettings = await getSettings()
      if (notificationSettings) {
        setSettings(prev => ({
          ...prev,
          notifications: notificationSettings
        }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await axios.put(`${API_URL}/api/users/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await updateSettings(settings.notifications)
      
      // Show success message
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50'
      toast.textContent = 'Settings saved successfully!'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleNotification = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const toggleSound = () => {
    setSettings(prev => ({
      ...prev,
      sound: {
        ...prev.sound,
        enabled: !prev.sound.enabled
      }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#F5B800] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
            ⚙️ Settings
          </h1>
          <p className="text-[#B8967A]/60">Customize your game experience</p>
        </motion.div>

        {/* Push Notifications Status */}
        {supported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {permission === 'granted' ? (
                  <Bell className="w-5 h-5 text-[#4ADE80]" />
                ) : (
                  <BellOff className="w-5 h-5 text-[#FF8A8A]" />
                )}
                <div>
                  <div className="font-semibold text-[#FAF7F0]">Push Notifications</div>
                  <div className="text-xs text-[#B8967A]/60">
                    {permission === 'granted' 
                      ? 'Notifications are enabled' 
                      : permission === 'denied'
                      ? 'Notifications are blocked by browser'
                      : 'Enable notifications to get updates'}
                  </div>
                </div>
              </div>
              
              {permission !== 'granted' && permission !== 'denied' && (
                <button
                  onClick={requestPermission}
                  className="px-4 py-2 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-lg text-[#0C0505] text-sm font-semibold"
                >
                  Enable Notifications
                </button>
              )}
              
              {permission === 'granted' && (
                <button
                  onClick={sendTestNotification}
                  className="px-4 py-2 bg-[#2A1A0A] border border-[#F5B800]/20 rounded-lg text-[#F5B800] text-sm font-semibold"
                >
                  Test Notification
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Notification Preferences</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'dailyChallenge', icon: <Calendar size={16} />, label: 'Daily Challenge Reminder', desc: 'Get notified when a new daily challenge is available' },
                { key: 'multiplayerInvite', icon: <Users size={16} />, label: 'Multiplayer Invites', desc: 'Receive notifications when someone invites you to a game' },
                { key: 'achievementUnlock', icon: <Award size={16} />, label: 'Achievement Unlocks', desc: 'Get notified when you unlock a new achievement' },
                { key: 'tournamentUpdate', icon: <Gamepad2 size={16} />, label: 'Tournament Updates', desc: 'Receive updates about tournament matches and results' },
              ].map((item, i) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-[#2A1A0A]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-[#F5B800]">{item.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-[#FAF7F0]">{item.label}</div>
                      <div className="text-xs text-[#B8967A]/60">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.notifications[item.key] ? 'bg-[#F5B800]' : 'bg-[#3A2A1A]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sound Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              {settings.sound.enabled ? <Volume2 className="w-5 h-5 text-[#F5B800]" /> : <VolumeX className="w-5 h-5 text-[#FF8A8A]" />}
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Sound Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#2A1A0A]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-[#F5B800]">{settings.sound.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</div>
                  <div>
                    <div className="text-sm font-medium text-[#FAF7F0]">Game Sound Effects</div>
                    <div className="text-xs text-[#B8967A]/60">Enable sound effects for moves, wins, and notifications</div>
                  </div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-12 h-6 rounded-full transition-all ${
                    settings.sound.enabled ? 'bg-[#F5B800]' : 'bg-[#3A2A1A]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                    settings.sound.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {settings.sound.enabled && (
                <div>
                  <div className="flex justify-between text-xs text-[#B8967A]/60 mb-2">
                    <span>Volume</span>
                    <span>{Math.round(settings.sound.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.sound.volume}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sound: { ...prev.sound, volume: parseFloat(e.target.value) }
                    }))}
                    className="w-full h-2 bg-[#3A2A1A] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5B800]"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Privacy</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'showOnLeaderboard', label: 'Show on Leaderboard', desc: 'Allow your scores to appear on global leaderboards' },
                { key: 'shareStats', label: 'Share Game Stats', desc: 'Allow the game to collect and share anonymous statistics' },
              ].map((item, i) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-[#2A1A0A]/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-[#FAF7F0]">{item.label}</div>
                    <div className="text-xs text-[#B8967A]/60">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, [item.key]: !prev.privacy[item.key] }
                    }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.privacy[item.key] ? 'bg-[#F5B800]' : 'bg-[#3A2A1A]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      settings.privacy[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-xl text-[#0C0505] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Settings