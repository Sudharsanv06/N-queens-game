import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award, Loader } from 'lucide-react'
import AchievementGrid from '../components/achievements/AchievementGrid'
import { fetchUserAchievements } from '../store/slices/achievementSlice'

const AchievementsPage = () => {
  const dispatch = useDispatch()
  const { userAchievements, stats, loading, error } = useSelector(state => state.achievements)
  const [selectedAchievement, setSelectedAchievement] = useState(null)

  useEffect(() => {
    dispatch(fetchUserAchievements())
  }, [dispatch])

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading achievements</p>
          <p className="text-gray-500 mt-2">{error.message || 'Please try again later'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Achievements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your progress and unlock rewards
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Achievements</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.completed}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-300 dark:text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.completionPercentage}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-300 dark:text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Achievement Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AchievementGrid
            achievements={userAchievements}
            onAchievementClick={handleAchievementClick}
          />
        </motion.div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          onClick={() => setSelectedAchievement(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-5xl mb-4">
                {selectedAchievement.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedAchievement.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedAchievement.description}
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Requirements</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedAchievement.requirementType.replace(/_/g, ' ')}: {selectedAchievement.requirementValue}
                </p>
              </div>

              <div className="flex gap-4 justify-center mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">XP Reward</p>
                  <p className="text-xl font-bold text-yellow-500">+{selectedAchievement.rewardXP}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                  <p className="text-xl font-bold text-blue-500">+{selectedAchievement.rewardPoints}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AchievementsPage
