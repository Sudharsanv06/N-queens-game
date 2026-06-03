import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { 
  TrendingUp, TrendingDown, Calendar, Target, 
  Zap, Award, Clock, BarChart3, ChevronLeft,
  Flame, Activity, PieChart, Download
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Scatter, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Analytics() {
  const navigate = useNavigate()
  const { token, user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year, all
  const [analytics, setAnalytics] = useState({
    gamesOverTime: [],
    winRateBySize: [],
    speedImprovement: [],
    activityHeatmap: [],
    totalStats: {
      totalGames: 0,
      totalWins: 0,
      winRate: 0,
      totalTimePlayed: 0,
      averageTime: 0,
      bestStreak: 0,
      currentStreak: 0,
      achievementsUnlocked: 0,
      totalXP: 0
    },
    recentGames: []
  })

  useEffect(() => {
    if (token) {
      fetchAnalytics()
    }
  }, [token, timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/analytics/personal`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { range: timeRange }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Load mock data for demo if API fails
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    // Mock data for demonstration
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        games: Math.floor(Math.random() * 8) + 1,
        wins: Math.floor(Math.random() * 6),
        timeSpent: Math.floor(Math.random() * 300) + 60
      }
    })

    setAnalytics({
      gamesOverTime: last30Days,
      winRateBySize: [
        { size: '4x4', games: 45, wins: 42, winRate: 93.3 },
        { size: '5x5', games: 38, wins: 34, winRate: 89.5 },
        { size: '6x6', games: 52, wins: 43, winRate: 82.7 },
        { size: '7x7', games: 41, wins: 32, winRate: 78.0 },
        { size: '8x8', games: 89, wins: 61, winRate: 68.5 },
        { size: '9x9', games: 34, wins: 21, winRate: 61.8 },
        { size: '10x10', games: 28, wins: 16, winRate: 57.1 },
        { size: '11x11', games: 19, wins: 10, winRate: 52.6 },
        { size: '12x12', games: 23, wins: 11, winRate: 47.8 }
      ],
      speedImprovement: [
        { month: 'Week 1', avgTime: 245, bestTime: 180, gamesPlayed: 12 },
        { month: 'Week 2', avgTime: 220, bestTime: 155, gamesPlayed: 15 },
        { month: 'Week 3', avgTime: 195, bestTime: 142, gamesPlayed: 18 },
        { month: 'Week 4', avgTime: 178, bestTime: 128, gamesPlayed: 22 },
        { month: 'Week 5', avgTime: 165, bestTime: 115, gamesPlayed: 25 },
        { month: 'Week 6', avgTime: 152, bestTime: 108, gamesPlayed: 28 }
      ],
      activityHeatmap: generateHeatmapData(),
      totalStats: {
        totalGames: 432,
        totalWins: 298,
        winRate: 68.9,
        totalTimePlayed: 48600,
        averageTime: 185,
        bestStreak: 12,
        currentStreak: 5,
        achievementsUnlocked: 24,
        totalXP: 15250
      },
      recentGames: [
        { date: '2024-01-15', size: '8x8', time: 142, moves: 28, result: 'win', score: 2850 },
        { date: '2024-01-14', size: '6x6', time: 98, moves: 18, result: 'win', score: 1950 },
        { date: '2024-01-13', size: '10x10', time: 245, moves: 42, result: 'loss', score: 0 },
        { date: '2024-01-12', size: '8x8', time: 167, moves: 31, result: 'win', score: 2420 },
        { date: '2024-01-11', size: '4x4', time: 45, moves: 12, result: 'win', score: 850 }
      ]
    })
  }

  const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return days.map(day => ({
      day,
      ...hours.reduce((acc, hour) => {
        acc[`h${hour}`] = Math.floor(Math.random() * 100)
        return acc
      }, {})
    }))
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E1010] border border-[#F5B800]/30 rounded-lg p-3 shadow-lg">
          <p className="text-[#F5B800] text-sm font-semibold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs text-[#FAF7F0]">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#F5B800] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E1010] border border-[#F5B800]/20 rounded-lg text-[#B8967A] hover:text-[#FAF7F0] transition-all"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold font-['Cinzel'] text-[#FAF7F0]">Analytics Dashboard</h1>
            <p className="text-[#B8967A]/60 text-sm mt-1">Track your performance and progress</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-[#F5B800] text-[#0C0505]' 
                    : 'bg-[#1E1010] text-[#B8967A] border border-[#F5B800]/20 hover:border-[#F5B800]/50'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { icon: <Target size={16} />, label: 'Total Games', value: analytics.totalStats.totalGames, color: '#F5B800' },
            { icon: <Trophy size={16} />, label: 'Win Rate', value: `${analytics.totalStats.winRate}%`, color: '#4ADE80' },
            { icon: <Flame size={16} />, label: 'Best Streak', value: analytics.totalStats.bestStreak, color: '#FF8A8A' },
            { icon: <Clock size={16} />, label: 'Avg Time', value: formatTime(analytics.totalStats.averageTime), color: '#60A5FA' },
            { icon: <Award size={16} />, label: 'Achievements', value: analytics.totalStats.achievementsUnlocked, color: '#C084FC' },
            { icon: <Zap size={16} />, label: 'Total XP', value: analytics.totalStats.totalXP, color: '#FFD700' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-3 text-center"
            >
              <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="text-xl font-bold text-[#FAF7F0]">{stat.value}</div>
              <div className="text-xs text-[#B8967A]/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart 1: Games Played Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Games Over Time</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#B8967A]/60">
              <span className="w-3 h-3 rounded-full bg-[#F5B800]" />
              <span>Games Played</span>
              <span className="w-3 h-3 rounded-full bg-[#4ADE80] ml-2" />
              <span>Wins</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analytics.gamesOverTime.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#B8967A"
                tick={{ fill: '#B8967A', fontSize: 11 }}
              />
              <YAxis stroke="#B8967A" tick={{ fill: '#B8967A', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#FAF7F0' }} />
              <Bar dataKey="games" fill="#F5B800" radius={[4, 4, 0, 0]} name="Games Played" />
              <Bar dataKey="wins" fill="#4ADE80" radius={[4, 4, 0, 0]} name="Wins" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chart 2: Win Rate by Board Size */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={20} className="text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Win Rate by Board Size</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.winRateBySize} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#B8967A" tick={{ fill: '#B8967A', fontSize: 11 }} />
                <YAxis type="category" dataKey="size" stroke="#B8967A" tick={{ fill: '#B8967A', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" fill="#4ADE80" radius={[0, 4, 4, 0]}>
                  {analytics.winRateBySize.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.winRate > 70 ? '#4ADE80' : entry.winRate > 50 ? '#F5B800' : '#FF8A8A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#4ADE80]" />Good (&gt;70%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#F5B800]" />Average (50-70%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FF8A8A]" />Needs Work (&lt;50%)</div>
            </div>
          </motion.div>

          {/* Chart 3: Speed Improvement Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Speed Improvement Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.speedImprovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#B8967A" tick={{ fill: '#B8967A', fontSize: 11 }} />
                <YAxis stroke="#B8967A" tick={{ fill: '#B8967A', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#FAF7F0' }} />
                <Line type="monotone" dataKey="avgTime" stroke="#F5B800" strokeWidth={2} name="Avg Time (seconds)" dot={{ fill: '#F5B800' }} />
                <Line type="monotone" dataKey="bestTime" stroke="#4ADE80" strokeWidth={2} name="Best Time (seconds)" dot={{ fill: '#4ADE80' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center mt-3">
              <span className="text-xs text-[#4ADE80]">↓ {Math.round((analytics.speedImprovement[0]?.avgTime - analytics.speedImprovement[analytics.speedImprovement.length - 1]?.avgTime) / analytics.speedImprovement[0]?.avgTime * 100)}% improvement</span>
            </div>
          </motion.div>
        </div>

        {/* Chart 4: Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-[#F5B800]" />
            <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Activity Heatmap</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex mb-2">
                <div className="w-12" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-[10px] text-[#B8967A]/60">{i}h</div>
                ))}
              </div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs text-[#B8967A]/60">{day}</div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const intensity = analytics.activityHeatmap[dayIndex]?.[`h${hour}`] || 0
                    const getColor = () => {
                      if (intensity > 80) return '#F5B800'
                      if (intensity > 60) return '#C41E1E'
                      if (intensity > 40) return '#8B4513'
                      if (intensity > 20) return '#5A2A0A'
                      return '#2A1A0A'
                    }
                    return (
                      <div
                        key={hour}
                        className="flex-1 aspect-square mx-0.5 rounded-sm transition-all hover:scale-125"
                        style={{ backgroundColor: getColor() }}
                        title={`${day} ${hour}:00 - ${intensity} games`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#2A1A0A]" />Low</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#8B4513]" />Medium</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#C41E1E]" />High</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#F5B800]" />Peak</div>
          </div>
        </motion.div>

        {/* Recent Games Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-[#F5B800]" />
              <h2 className="text-lg font-bold font-['Cinzel'] text-[#FAF7F0]">Recent Games</h2>
            </div>
            <button className="text-xs text-[#F5B800] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5B800]/15">
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Board</th>
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Time</th>
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Moves</th>
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Result</th>
                  <th className="text-left py-3 px-2 text-[#B8967A]/60 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentGames.map((game, i) => (
                  <tr key={i} className="border-b border-[#F5B800]/10 hover:bg-[#2A1A0A]/30">
                    <td className="py-2 px-2 text-[#FAF7F0]">{new Date(game.date).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-[#FAF7F0]">{game.size}</td>
                    <td className="py-2 px-2 text-[#FAF7F0]">{formatTime(game.time)}</td>
                    <td className="py-2 px-2 text-[#FAF7F0]">{game.moves}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        game.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {game.result === 'win' ? '✓ Win' : '✗ Loss'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[#F5B800] font-semibold">{game.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics