import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Star, Target, Zap, Users, Mountain, Lock, CheckCircle, Circle, Progress } from 'lucide-react'
import axios from 'axios'
import '../auth.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const categoryIcons = {
  game: Trophy,
  challenge: Target,
  speed: Zap,
  skill: Star,
  social: Users,
  milestone: Mountain
}

const difficultyColors = {
  bronze: 'text-orange-600 bg-orange-100',
  silver: 'text-gray-600 bg-gray-100',
  gold: 'text-yellow-600 bg-yellow-100',
  platinum: 'text-purple-600 bg-purple-100',
  diamond: 'text-blue-600 bg-blue-100'
}

const difficultyPoints = {
  bronze: '100-250',
  silver: '300-500',
  gold: '600-1000',
  platinum: '1500-2000',
  diamond: '2500+'
}

const AchievementCard = ({ achievement }) => {
  const IconComponent = categoryIcons[achievement.category] || Trophy
  const isCompleted = achievement.isCompleted
  const progress = achievement.progress || { current: 0, target: 1, percentage: 0 }

  return (
    <div className={`achievement-card p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
      isCompleted 
        ? 'border-green-500 bg-green-50 shadow-lg' 
        : achievement.isSecret 
          ? 'border-gray-300 bg-gray-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`achievement-icon p-3 rounded-full ${
            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <IconComponent className="w-6 h-6" />}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-bold ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                {achievement.isSecret && !isCompleted ? '???' : achievement.name}
              </h3>
              <span className="achievement-icon text-xl">{achievement.icon}</span>
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[achievement.difficulty]}`}>
                {achievement.difficulty.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                {achievement.points} points
              </span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="achievement-completion text-green-600">
            <Medal className="w-8 h-8" />
          </div>
        )}
      </div>

      <p className={`text-sm mb-4 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
        {achievement.isSecret && !isCompleted 
          ? 'This is a secret achievement. Keep exploring to unlock it!'
          : achievement.description
        }
      </p>

      {!isCompleted && !achievement.isSecret && (
        <div className="achievement-progress">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress.current} / {progress.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress.percentage || (progress.current / progress.target) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(progress.percentage || (progress.current / progress.target) * 100)}% Complete
          </div>
        </div>
      )}

      {isCompleted && achievement.unlockedAt && (
        <div className="achievement-unlocked-date text-xs text-green-600 mt-2">
          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

const AchievementStats = ({ stats }) => (
  <div className="achievement-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div className="stat-card bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
      <div className="text-sm text-blue-600">Completed</div>
    </div>
    
    <div className="stat-card bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
      <div className="text-sm text-yellow-600">In Progress</div>
    </div>
    
    <div className="stat-card bg-green-50 border border-green-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-green-600">{stats.points}</div>
      <div className="text-sm text-green-600">Points Earned</div>
    </div>
    
    <div className="stat-card bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-purple-600">{Math.round((stats.completed / stats.total) * 100)}%</div>
      <div className="text-sm text-purple-600">Completion</div>
    </div>
  </div>
)

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => (
  <div className="category-filter flex flex-wrap gap-2 mb-6">
    <button
      onClick={() => onCategoryChange('all')}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selectedCategory === 'all'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      All ({categories.all})
    </button>
    
    {Object.entries(categories).map(([category, count]) => {
      if (category === 'all') return null
      const IconComponent = categoryIcons[category] || Trophy
      
      return (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <IconComponent className="w-4 h-4" />
          <span>{category.charAt(0).toUpperCase() + category.slice(1)} ({count})</span>
        </button>
      )
    })}
  </div>
)

const Achievements = () => {
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, points: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get(`${API_URL}/api/achievements/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAchievements(response.data.achievements)
        setStats(response.data.stats)
      } else {
        throw new Error(response.data.message || 'Failed to fetch achievements')
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory)

  const categories = achievements.reduce((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] || 0) + 1
    acc.all = (acc.all || 0) + 1
    return acc
  }, { all: 0 })

  if (loading) {
    return (
      <div className="achievements-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="achievements-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error loading achievements</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={fetchAchievements}
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
    <div className="achievements-container min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
            <Trophy className="w-10 h-10 text-yellow-600" />
            <span>Achievements</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress and unlock rewards as you master the N-Queens puzzle!
          </p>
        </div>

        {/* Statistics */}
        <AchievementStats stats={stats} />

        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Achievements Grid */}
        <div className="achievements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard key={achievement.id || index} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No achievements found in this category</div>
          </div>
        )}

        {/* Achievement Tips */}
        <div className="achievement-tips mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-600" />
            <span>Achievement Tips</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Difficulty Levels</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {Object.entries(difficultyPoints).map(([difficulty, points]) => (
                  <li key={difficulty} className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[difficulty]}`}>
                      {difficulty.toUpperCase()}
                    </span>
                    <span>{points} points</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">How to Unlock</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Complete games to unlock game achievements</li>
                <li>• Solve puzzles quickly for speed achievements</li>
                <li>• Maintain daily challenge streaks</li>
                <li>• Play multiplayer games for social achievements</li>
                <li>• Explore to find secret achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements