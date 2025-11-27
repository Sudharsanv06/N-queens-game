import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { History, Trophy, Award, Clock, Loader } from 'lucide-react'
import { fetchRewardHistory } from '../store/slices/rewardSlice'

const RewardHistoryPage = () => {
  const dispatch = useDispatch()
  const { history, loading, error } = useSelector(state => state.rewards)

  useEffect(() => {
    dispatch(fetchRewardHistory({ limit: 100 }))
  }, [dispatch])

  const getRewardIcon = (type) => {
    return type === 'achievement' ? <Trophy className="w-6 h-6 text-yellow-500" /> : <Award className="w-6 h-6 text-purple-500" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <History className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Reward History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View all your earned achievements and badges
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reward Timeline */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading reward history</p>
            <p className="text-gray-500 mt-2">{error.message}</p>
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No rewards earned yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Start playing to unlock achievements and badges!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {history.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center
                    ${reward.type === 'achievement' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                      : 'bg-purple-100 dark:bg-purple-900/30'
                    }
                  `}>
                    {reward.icon ? (
                      <span className="text-2xl">{reward.icon}</span>
                    ) : (
                      getRewardIcon(reward.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                          {reward.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {reward.type} {reward.tier && `• ${reward.tier}`}
                        </p>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(reward.timestamp)}</span>
                      </div>
                    </div>

                    {/* Rewards */}
                    {reward.type === 'achievement' && (reward.xpReward > 0 || reward.pointsReward > 0) && (
                      <div className="flex items-center gap-3 mt-2">
                        {reward.xpReward > 0 && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                            +{reward.xpReward} XP
                          </span>
                        )}
                        {reward.pointsReward > 0 && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                            +{reward.pointsReward} pts
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default RewardHistoryPage
