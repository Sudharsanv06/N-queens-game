import React, { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Users, Gamepad2, Trophy, Clock, TrendingUp, Activity, 
  Monitor, Smartphone, Tablet, Download, RefreshCw, Calendar,
  AlertCircle, CheckCircle, Target, Award
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
  <div className="stat-card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
)

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`chart-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
)

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [gameModeData, setGameModeData] = useState([])
  const [engagementData, setEngagementData] = useState(null)
  const [achievementData, setAchievementData] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState(24)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const headers = { Authorization: `Bearer ${token}` }

      // Fetch all analytics data
      const [
        dashboardResponse,
        gameModeResponse,
        engagementResponse,
        achievementResponse,
        performanceResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/dashboard?timeRange=${timeRange}`, { headers }),
        axios.get(`${API_URL}/api/analytics/game-modes?timeRange=7`, { headers }),
        axios.get(`${API_URL}/api/analytics/engagement?timeRange=30`, { headers }),
        axios.get(`${API_URL}/api/analytics/achievements`, { headers }),
        axios.get(`${API_URL}/api/analytics/performance?timeRange=${timeRange}`, { headers })
      ])

      setDashboardData(dashboardResponse.data.stats)
      setGameModeData(gameModeResponse.data.gameModeStats)
      setEngagementData(engagementResponse.data.engagement)
      setAchievementData(achievementResponse.data.achievementAnalytics)
      setPerformanceData(performanceResponse.data.performance)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError(error.response?.data?.message || error.message)
      
      if (error.response?.status === 403) {
        toast.error('Admin access required to view analytics dashboard', {
          style: {
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.6)',
            backdropFilter: 'blur(10px)'
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/analytics/export?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Analytics data exported successfully!', {
        style: {
          background: 'rgba(34, 197, 94, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.6)',
          backdropFilter: 'blur(10px)'
        }
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analytics data')
    }
  }

  if (loading) {
    return (
      <div className="analytics-dashboard min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-dashboard min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <div className="text-red-600 text-lg mb-4">Error loading analytics dashboard</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={fetchAllData}
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
    <div className="analytics-dashboard min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <span>Analytics Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-2">Monitor game performance and user engagement</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Last Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last 7 Days</option>
              <option value={720}>Last 30 Days</option>
            </select>
            
            <button
              onClick={fetchAllData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={exportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Monitor },
                { id: 'games', label: 'Game Analytics', icon: Gamepad2 },
                { id: 'users', label: 'User Engagement', icon: Users },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'performance', label: 'Performance', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="overview-tab space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={dashboardData.totalUsers.toLocaleString()}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={dashboardData.activeUsers.toLocaleString()}
                icon={Activity}
                color="green"
              />
              <StatCard
                title="Games Played"
                value={dashboardData.totalGames.toLocaleString()}
                icon={Gamepad2}
                color="purple"
              />
              <StatCard
                title="Completion Rate"
                value={`${Math.round(dashboardData.completionRate)}%`}
                icon={Target}
                color="orange"
              />
            </div>

            {/* Device Breakdown */}
            <ChartCard title="Device Usage">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dashboardData.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* Game Analytics Tab */}
        {activeTab === 'games' && gameModeData.length > 0 && (
          <div className="games-tab space-y-6">
            <ChartCard title="Game Mode Performance">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gameModeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mode" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="started" fill="#3B82F6" name="Games Started" />
                  <Bar dataKey="completed" fill="#10B981" name="Games Completed" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Completion Rates by Mode">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameModeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mode" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Average Scores by Mode">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameModeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mode" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}

        {/* User Engagement Tab */}
        {activeTab === 'users' && engagementData && (
          <div className="users-tab space-y-6">
            <ChartCard title="Daily Active Users">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={engagementData.dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Most Active Users">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Events</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Games Played</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Achievements</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {engagementData.topUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalEvents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.gamesPlayed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.achievementsUnlocked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastActivity).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && achievementData && (
          <div className="achievements-tab space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Achievement Category Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={achievementData.categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {achievementData.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Total Achievement Points by Category">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={achievementData.categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalPoints" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Most Popular Achievements">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Achievement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unlocked Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {achievementData.achievementStats.slice(0, 10).map((achievement, index) => (
                      <tr key={achievement._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {achievement.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {achievement.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {achievement.unlockedCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {achievement.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            achievement.difficulty === 'bronze' ? 'bg-orange-100 text-orange-600' :
                            achievement.difficulty === 'silver' ? 'bg-gray-100 text-gray-600' :
                            achievement.difficulty === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                            achievement.difficulty === 'platinum' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {achievement.difficulty.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performanceData && (
          <div className="performance-tab space-y-6">
            <ChartCard title="Response Time Over Time">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData.hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#3B82F6" 
                    name="Avg Response Time (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgLoadTime" 
                    stroke="#10B981" 
                    name="Avg Load Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Error Breakdown">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.errorBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Requests vs Errors">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRequests" fill="#3B82F6" name="Total Requests" />
                    <Bar dataKey="errorCount" fill="#EF4444" name="Error Count" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard