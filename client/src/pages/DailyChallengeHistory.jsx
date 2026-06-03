import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function DailyChallengeHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/daily-challenges/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(response.data.history || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    return { daysInMonth, startingDayOfWeek }
  }

  const getChallengeForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return history.find(h => {
      const challengeDate = new Date(h.challengeId?.date || h.createdAt)
      return challengeDate.toISOString().split('T')[0] === dateStr
    })
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  const changeMonth = (increment) => {
    setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + increment)))
  }

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const getStatusIcon = (challenge) => {
    if (!challenge) return null
    if (challenge.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    }
    if (challenge.status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-400" />
    }
    return <Clock className="w-5 h-5 text-yellow-400" />
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
            Challenge History
          </h1>
          <p className="text-[#B8967A]/60">Track your daily challenge progress</p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Challenges', value: history.length, icon: Calendar, color: '#F5B800' },
            { label: 'Completed', value: history.filter(h => h.status === 'completed').length, icon: CheckCircle, color: '#4ADE80' },
            { label: 'Failed', value: history.filter(h => h.status === 'failed').length, icon: XCircle, color: '#FF8A8A' },
            { label: 'Total XP', value: history.reduce((sum, h) => sum + (h.totalReward || 0), 0), icon: Trophy, color: '#C084FC' }
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

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg bg-[#1E1010] border border-[#F5B800]/15 text-[#FAF7F0] hover:border-[#F5B800]/40 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-['Cinzel'] text-[#F5B800]">{formatMonthYear(selectedMonth)}</h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg bg-[#1E1010] border border-[#F5B800]/15 text-[#FAF7F0] hover:border-[#F5B800]/40 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-6"
        >
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-[#B8967A]/60 font-semibold py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square bg-[#2A1A0A]/30 rounded-lg" />
            ))}
            
            {days.map(day => {
              const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
              const challenge = getChallengeForDate(date)
              const isToday = new Date().toDateString() === date.toDateString()
              
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center border transition-all ${
                    challenge?.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                    challenge?.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-[#2A1A0A] border-[#F5B800]/10'
                  } ${isToday ? 'ring-2 ring-[#F5B800]' : ''}`}
                >
                  <span className={`text-sm font-semibold ${isToday ? 'text-[#F5B800]' : 'text-[#FAF7F0]'}`}>
                    {day}
                  </span>
                  {challenge && (
                    <div className="mt-1">
                      {getStatusIcon(challenge)}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0] mb-4">Recent Challenges</h3>
          <div className="space-y-3">
            {history.slice(0, 10).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item)}
                  <div>
                    <div className="font-semibold text-[#FAF7F0]">
                      {item.challengeId?.title || 'Daily Challenge'}
                    </div>
                    <div className="text-xs text-[#B8967A]/60">
                      {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {item.status === 'completed' && (
                    <div className="text-sm font-bold text-green-400">+{item.totalReward} XP</div>
                  )}
                  {item.timeTaken && (
                    <div className="text-xs text-[#B8967A]/60">{Math.floor(item.timeTaken / 60)}:{String(item.timeTaken % 60).padStart(2, '0')}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DailyChallengeHistory