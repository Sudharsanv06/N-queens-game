import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, Award, Loader, Crown, Target, Zap, Calendar, Flame, Star } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, completionPercentage: 0, points: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/achievements/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAchievements(response.data.achievements || [])
      setStats(response.data.stats || { total: 0, completed: 0, completionPercentage: 0, points: 0 })
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'bronze': return 'from-orange-600 to-orange-800'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-500 to-yellow-700'
      case 'platinum': return 'from-cyan-500 to-blue-700'
      case 'diamond': return 'from-purple-500 to-pink-600'
      default: return 'from-[#F5B800] to-[#C41E1E]'
    }
  }

  const getDifficultyBorder = (difficulty) => {
    switch (difficulty) {
      case 'bronze': return 'border-orange-600/50'
      case 'silver': return 'border-gray-500/50'
      case 'gold': return 'border-yellow-600/50'
      case 'platinum': return 'border-cyan-600/50'
      case 'diamond': return 'border-purple-600/50'
      default: return 'border-[#F5B800]/30'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'game': return <Trophy className="w-4 h-4" />
      case 'challenge': return <Calendar className="w-4 h-4" />
      case 'speed': return <Zap className="w-4 h-4" />
      case 'skill': return <Target className="w-4 h-4" />
      case 'milestone': return <Star className="w-4 h-4" />
      case 'social': return <Crown className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
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
            Achievements
          </h1>
          <p className="text-[#B8967A]/60">Track your progress and unlock rewards</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Achievements', value: stats.total, icon: Trophy, color: '#F5B800' },
            { label: 'Completed', value: stats.completed, icon: Award, color: '#4ADE80' },
            { label: 'Completion Rate', value: `${stats.completionPercentage || 0}%`, icon: TrendingUp, color: '#C084FC' },
            { label: 'Total Points', value: stats.points || 0, icon: Crown, color: '#FFD700' }
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

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, i) => {
            const isCompleted = achievement.isCompleted
            const progressPercent = achievement.progress?.percentage || 0
            
            return (
              <motion.div
                key={achievement.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAchievement(achievement)}
                className={`bg-[#1E1010] border rounded-xl p-4 cursor-pointer transition-all ${
                  isCompleted 
                    ? `border-${getDifficultyBorder(achievement.difficulty)} shadow-lg shadow-[#F5B800]/10` 
                    : 'border-[#F5B800]/15 hover:border-[#F5B800]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} flex items-center justify-center text-2xl flex-shrink-0 ${
                    !isCompleted && 'opacity-50 grayscale'
                  }`}>
                    {achievement.icon || '🏆'}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold font-['Cinzel'] text-sm ${isCompleted ? 'text-[#F5B800]' : 'text-[#FAF7F0]'}`}>
                        {achievement.name}
                      </h3>
                      {getCategoryIcon(achievement.category)}
                    </div>
                    <p className="text-xs text-[#B8967A]/60 mb-2 line-clamp-2">{achievement.description}</p>
                    
                    {/* Progress Bar */}
                    {!isCompleted && progressPercent > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-[#B8967A]/60 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#2A1A0A] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Reward Badge */}
                    {isCompleted && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          +{achievement.points} XP
                        </span>
                        <span className="text-xs text-[#B8967A]/60">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {/* Requirement hint */}
                    {!isCompleted && achievement.requirements && (
                      <div className="mt-2 text-xs text-[#B8967A]/60">
                        Need: {achievement.progress?.current || 0}/{achievement.requirements?.value} {achievement.requirements?.type}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <div
            onClick={() => setSelectedAchievement(null)}
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
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getDifficultyColor(selectedAchievement.difficulty)} flex items-center justify-center text-5xl mb-4`}>
                  {selectedAchievement.icon || '🏆'}
                </div>
                
                <h2 className="text-2xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
                  {selectedAchievement.name}
                </h2>
                
                <div className="mb-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase bg-[${selectedAchievement.difficulty === 'bronze' ? 'orange' : selectedAchievement.difficulty === 'silver' ? 'gray' : selectedAchievement.difficulty === 'gold' ? 'yellow' : 'purple'}-600]/20 text-${selectedAchievement.difficulty === 'bronze' ? 'orange' : selectedAchievement.difficulty === 'silver' ? 'gray' : selectedAchievement.difficulty === 'gold' ? 'yellow' : 'purple'}-400`}>
                    {selectedAchievement.difficulty || 'Standard'}
                  </span>
                </div>

                <p className="text-[#B8967A]/80 mb-4">
                  {selectedAchievement.description}
                </p>
                
                {selectedAchievement.requirements && (
                  <div className="bg-[#2A1A0A] rounded-lg p-4 mb-4">
                    <p className="text-sm text-[#B8967A]/60 mb-1">Requirements</p>
                    <p className="font-semibold text-[#F5B800]">
                      {selectedAchievement.requirements.type?.replace(/_/g, ' ')}: {selectedAchievement.requirements.value}
                    </p>
                    {selectedAchievement.progress && (
                      <p className="text-sm text-[#B8967A]/60 mt-2">
                        Your progress: {selectedAchievement.progress.current} / {selectedAchievement.requirements.value}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-center mb-4">
                  <div className="text-center">
                    <p className="text-sm text-[#B8967A]/60">XP Reward</p>
                    <p className="text-xl font-bold text-[#F5B800]">+{selectedAchievement.points || 100}</p>
                  </div>
                </div>

                {selectedAchievement.isCompleted && selectedAchievement.unlockedAt && (
                  <p className="text-sm text-[#B8967A]/60 mb-4">
                    Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}

                {selectedAchievement.unlockMessage && (
                  <div className="bg-[#F5B800]/10 border border-[#F5B800]/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#F5B800] italic">"{selectedAchievement.unlockMessage}"</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full bg-gradient-to-r from-[#F5B800] to-[#C41E1E] hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AchievementsPage