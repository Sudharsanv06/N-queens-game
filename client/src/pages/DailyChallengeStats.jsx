import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Zap, Flame, Calendar, Award } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function DailyChallengeStats() {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    fetchStats()
    fetchStreak()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/daily-challenges/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStreak = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/daily-challenges/streak`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStreak(response.data.streak)
    } catch (error) {
      console.error('Failed to fetch streak:', error)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
            Challenge Stats
          </h1>
          <p className="text-[#B8967A]/60">Track your performance and progress</p>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#F5B800]/20 to-[#C41E1E]/20 border border-[#F5B800]/30 rounded-2xl p-6 mb-8 text-center"
        >
          <Flame className="w-12 h-12 text-[#F5B800] mx-auto mb-3" />
          <div className="text-5xl font-bold text-[#F5B800]">{streak?.currentStreak || 0}</div>
          <div className="text-[#FAF7F0] font-semibold mt-1">Current Streak</div>
          <div className="text-sm text-[#B8967A]/60 mt-2">
            Best streak: {streak?.longestStreak || 0} days
          </div>
          {streak?.lastCompletedDate && (
            <div className="text-xs text-[#B8967A]/60 mt-1">
              Last completed: {new Date(streak.lastCompletedDate).toLocaleDateString()}
            </div>
          )}
        </motion.div>

        {/* Overall Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#F5B800]" />
              <h3 className="font-bold font-['Cinzel'] text-[#FAF7F0]">Completion Rate</h3>
            </div>
            <div className="text-3xl font-bold text-[#4ADE80]">{stats?.completionRate || 0}%</div>
            <div className="text-sm text-[#B8967A]/60 mt-1">
              {stats?.completions || 0} / {stats?.totalAttempts || 0} challenges
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-[#2A1A0A] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#4ADE80] to-[#F5B800] rounded-full transition-all duration-500"
                style={{ width: `${stats?.completionRate || 0}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#F5B800]" />
              <h3 className="font-bold font-['Cinzel'] text-[#FAF7F0]">Total XP Earned</h3>
            </div>
            <div className="text-3xl font-bold text-[#C084FC]">{stats?.totalXPEarned || 0}</div>
            <div className="text-sm text-[#B8967A]/60 mt-1">From daily challenges</div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#F5B800]" />
            <h3 className="font-bold font-['Cinzel'] text-[#FAF7F0]">Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-[#B8967A]/60 mb-1">Average Completion Time</div>
              <div className="text-xl font-bold text-[#FAF7F0]">
                {stats?.averageTime ? `${Math.floor(stats.averageTime / 60)}:${String(stats.averageTime % 60).padStart(2, '0')}` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#B8967A]/60 mb-1">Average Moves Used</div>
              <div className="text-xl font-bold text-[#FAF7F0]">{stats?.averageMoves || 'N/A'}</div>
            </div>
          </div>
        </motion.div>

        {/* Challenge Type Breakdown */}
        {stats?.byType && stats.byType.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-[#F5B800]" />
              <h3 className="font-bold font-['Cinzel'] text-[#FAF7F0]">By Challenge Type</h3>
            </div>

            <div className="space-y-4">
              {stats.byType.map((type, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-[#2A1A0A]/50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-[#FAF7F0] capitalize">{type._id}</div>
                    <div className="text-xs text-[#B8967A]/60">{type.count} completions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#F5B800]">{type.avgScore?.toFixed(0) || 0}%</div>
                    <div className="text-xs text-[#B8967A]/60">Avg Score</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8 p-6 bg-gradient-to-r from-[#F5B800]/10 to-transparent rounded-xl"
        >
          <p className="text-[#B8967A]/80 italic">
            {stats?.completionRate >= 80 
              ? "🏆 Incredible! You're a daily challenge master!"
              : stats?.completionRate >= 50
              ? "🔥 Keep going! You're building an impressive streak!"
              : "🌟 Every challenge completed is a step toward mastery. You've got this!"}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default DailyChallengeStats