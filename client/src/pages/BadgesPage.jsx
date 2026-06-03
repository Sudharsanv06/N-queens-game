import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Award, Loader, CheckCircle, Sparkles, Lock } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function BadgesPage() {
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState({ total: 0, earned: 0, collectionRate: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/badges/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBadges(response.data.badges || [])
      setStats(response.data.stats || { total: 0, earned: 0, collectionRate: 0 })
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEquipBadge = async (badgeId) => {
    try {
      await axios.post(`${API_URL}/api/badges/equip`, { badgeId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchBadges()
    } catch (error) {
      console.error('Failed to equip badge:', error)
    }
  }

  const getTierGradient = (tier) => {
    switch (tier) {
      case 'bronze': return 'from-orange-700 to-orange-900'
      case 'silver': return 'from-gray-500 to-gray-700'
      case 'gold': return 'from-yellow-600 to-yellow-800'
      case 'platinum': return 'from-cyan-600 to-cyan-800'
      case 'diamond': return 'from-purple-600 to-purple-800'
      default: return 'from-[#F5B800] to-[#C41E1E]'
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-orange-400'
      case 'silver': return 'text-gray-400'
      case 'gold': return 'text-yellow-400'
      case 'platinum': return 'text-cyan-400'
      case 'diamond': return 'text-purple-400'
      default: return 'text-[#F5B800]'
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
            Badge Collection
          </h1>
          <p className="text-[#B8967A]/60">Earn and equip badges to show off your achievements</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Badges', value: stats.total, icon: Shield, color: '#F5B800' },
            { label: 'Earned', value: stats.earned, icon: Award, color: '#4ADE80' },
            { label: 'Collection Rate', value: `${stats.collectionRate || 0}%`, icon: Sparkles, color: '#C084FC' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-4 text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-2xl font-bold text-[#FAF7F0]">{stat.value}</div>
              <div className="text-xs text-[#B8967A]/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge, i) => {
            const isEarned = badge.isEarned
            
            return (
              <motion.div
                key={badge.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`bg-[#1E1010] border rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isEarned 
                    ? `border-[#F5B800]/30 hover:border-[#F5B800]/60 shadow-lg shadow-[#F5B800]/10` 
                    : 'border-[#F5B800]/15 opacity-60'
                }`}
              >
                {/* Badge Icon */}
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getTierGradient(badge.tier)} flex items-center justify-center text-3xl mb-3 ${
                  !isEarned && 'grayscale'
                }`}>
                  {isEarned ? (badge.icon || '🏅') : <Lock className="w-8 h-8 text-white/50" />}
                </div>
                
                {/* Badge Name */}
                <h3 className={`font-bold font-['Cinzel'] text-sm mb-1 ${isEarned ? 'text-[#FAF7F0]' : 'text-[#B8967A]/60'}`}>
                  {badge.name}
                </h3>
                
                {/* Tier Badge */}
                <span className={`text-xs ${getTierColor(badge.tier)} capitalize`}>
                  {badge.tier}
                </span>
                
                {/* Equipped Indicator */}
                {badge.isEquipped && (
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">Equipped</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1010] border border-[#F5B800]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${getTierGradient(selectedBadge.tier)} flex items-center justify-center text-5xl mb-4`}>
                  {selectedBadge.icon || '🏅'}
                </div>
                
                <h2 className="text-2xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
                  {selectedBadge.name}
                </h2>
                
                <div className="mb-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${getTierColor(selectedBadge.tier)} bg-${selectedBadge.tier}-600/20`}>
                    {selectedBadge.tier}
                  </span>
                </div>

                <p className="text-[#B8967A]/80 mb-4">
                  {selectedBadge.description}
                </p>
                
                {selectedBadge.unlockCondition && (
                  <div className="bg-[#2A1A0A] rounded-lg p-4 mb-4">
                    <p className="text-sm text-[#B8967A]/60 mb-1">Unlock Condition</p>
                    <p className="font-semibold text-[#F5B800]">
                      {selectedBadge.unlockCondition.description}
                    </p>
                  </div>
                )}

                {selectedBadge.isEarned && selectedBadge.earnedAt && (
                  <p className="text-sm text-[#B8967A]/60 mb-4">
                    Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="flex-1 bg-[#2A1A0A] hover:bg-[#3A2A1A] text-[#FAF7F0] font-semibold py-3 rounded-lg transition-all"
                  >
                    Close
                  </button>
                  
                  {selectedBadge.isEarned && !selectedBadge.isEquipped && (
                    <button
                      onClick={() => handleEquipBadge(selectedBadge.id)}
                      className="flex-1 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all"
                    >
                      Equip Badge
                    </button>
                  )}
                  
                  {selectedBadge.isEquipped && (
                    <button
                      className="flex-1 bg-green-600/20 border border-green-500 text-green-400 font-semibold py-3 rounded-lg cursor-default"
                      disabled
                    >
                      ✓ Equipped
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BadgesPage